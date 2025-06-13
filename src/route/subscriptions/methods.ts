// imports ================================================== //
import type { Response, Request } from "express";
import { queryDataBase } from "../../helpers/dataBase";
import jwt from "jsonwebtoken";
import { isUserDataFromJWT } from "../user/helpers";

// main ===================================================== //
async function GET(request: Request, response: Response) {
    try {

        let { channel_id } = request.query;

        let user_id = null;
        if (request.cookies.access_token) {
            const userData = jwt.decode(request.cookies.access_token);
            if (isUserDataFromJWT(userData)) {
                user_id = userData.user_id;
            }
        }

        const result = await queryDataBase(
            async (connection) => (
                await connection.execute(
                    `
                    SELECT
                        COUNT(*) AS total_subscribers,
                        ${user_id ? `EXISTS (
                            SELECT 1 
                            FROM subscriptions 
                            WHERE channel_id = ? AND subscriber_id = ?
                        ) AS is_subscribed` : 'NULL AS is_subscribed'}
                    FROM subscriptions
                    WHERE channel_id = ?;
                    `,
                    user_id
                    ? [channel_id, user_id, channel_id]
                    : [channel_id]
                )
            )
        );

        if (result) {
            // @ts-ignore
            return response.json(result[0][0]).end();
        } else {
            return response.status(404).end();
        }

    } catch (error: any) {
        console.log(error);
        return response.status(500).end();
    }
}
async function POST(request: Request, response: Response) {
    try {

        if (!request.cookies.access_token) {
            return response.status(401).json({ error: 'Unauthorized' }).end();
        }

        const userData = jwt.decode(request.cookies.access_token);
        if (!isUserDataFromJWT(userData)) {
            return response.status(401).json({ error: 'Invalid token' }).end();
        }

        const { channel_id } = request.query;
        if (typeof channel_id === 'undefined') {
            return response.status(400).json({ error: 'Missing channel_id' }).end();
        }

        // Проверяем, есть ли уже подписка
        const existingSubscription = await queryDataBase(
            async (connection) => (
                await connection.execute(
                    `SELECT 1 FROM subscriptions WHERE channel_id = ? AND subscriber_id = ?`,
                    [channel_id, userData.user_id]
                )
            )
        );

        // @ts-ignore
        if (existingSubscription && existingSubscription[0].length > 0) {
            return response.status(200).json({ message: 'Already subscribed' }).end();
        }

        // Создаем новую подписку
        await queryDataBase(
            async (connection) => (
                await connection.execute(
                    `INSERT INTO subscriptions (channel_id, subscriber_id, timestamp) VALUES (?, ?, NOW())`,
                    [channel_id, userData.user_id]
                )
            )
        );

        return response.status(200).json({ success: true }).end();

    } catch (error: any) {
        console.log(error);
        return response.status(500).end();
    }
}
async function DELETE(request: Request, response: Response) {
    try {
        // Проверка авторизации
        if (!request.cookies.access_token) {
            return response.status(401).json({ error: 'Unauthorized' }).end();
        }

        const userData = jwt.decode(request.cookies.access_token);
        if (!isUserDataFromJWT(userData)) {
            return response.status(401).json({ error: 'Invalid token' }).end();
        }

        const { channel_id } = request.query;
        if (typeof channel_id === 'undefined') {
            return response.status(400).json({ error: 'Missing channel_id' }).end();
        }

        // Удаляем подписку
        const result = await queryDataBase(
            async (connection) => (
                await connection.execute(
                    `DELETE FROM subscriptions WHERE channel_id = ? AND subscriber_id = ?`,
                    [channel_id, userData.user_id]
                )
            )
        );

        // @ts-ignore
        if (result && result[0].affectedRows > 0) {
            return response.status(200).json({ success: true }).end();
        } else {
            return response.status(404).json({ error: 'Subscription not found' }).end();
        }

    } catch (error: any) {
        console.log(error);
        return response.status(500).end();
    }
}

// exports ================================================== //
export { GET, POST, DELETE };