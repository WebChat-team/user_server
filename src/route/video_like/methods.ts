
// imports ================================================== //
import type { Response, Request } from "express";
import { queryDataBase } from "../../helpers/dataBase";
import jwt from "jsonwebtoken";
import { isUserDataFromJWT } from "../../helpers/isUserDataFromJWT";

// main ===================================================== //
async function GET(request: Request, response: Response) {

    try {

        let { video_id, is_like } = request.query;

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
                COUNT(*) AS total_likes
                ${user_id ? `, EXISTS (
                    SELECT 1 
                    FROM video_likes 
                    WHERE video_id = ? AND user_id = ? AND is_like = ?
                ) AS has_user_reaction` : ''}
            FROM video_likes
            WHERE video_id = ? AND is_like = ?;
                    `,
                    user_id
                    ? [video_id, user_id, is_like, video_id, is_like]
                    : [video_id, is_like]
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

        const { video_id, is_like } = request.query;
        if (typeof video_id === 'undefined' || typeof is_like === 'undefined') {
            return response.status(400).json({ error: 'Missing video_id or is_like' }).end();
        }

        const existingReaction = await queryDataBase(
            async (connection) => (
                await connection.execute(
                    `SELECT is_like FROM video_likes WHERE video_id = ? AND user_id = ?`,
                    [video_id, userData.user_id]
                )
            )
        );

        console.log(existingReaction);

        // @ts-ignore
        if (existingReaction && existingReaction[0].length > 0) {

            // @ts-ignore
            if (existingReaction[0][0].is_like === is_like === "1") {
                return response.status(200).json({ message: 'Reaction already exists' }).end();
            }
            
            // Если реакция отличается - обновляем
            await queryDataBase(
                async (connection) => (
                    await connection.execute(
                        `UPDATE video_likes SET is_like = ? WHERE video_id = ? AND user_id = ?`,
                        [is_like === "1", video_id, userData.user_id]
                    )
                )
            );
        } else {
            // Создаем новую реакцию
            await queryDataBase(
                async (connection) => (
                    await connection.execute(
                        `INSERT INTO video_likes (video_id, user_id, is_like) VALUES (?, ?, ?)`,
                        [video_id, userData.user_id, is_like === "1"]
                    )
                )
            );
        }

        return response.status(200).json({ success: true }).end();

    } catch (error: any) {
        console.log(error);
        return response.status(500).end();
    }
}
async function DELETE(request: Request, response: Response) {
    try {
        // Проверяем авторизацию пользователя
        if (!request.cookies.access_token) {
            return response.status(401).json({ error: 'Unauthorized' }).end();
        }

        const userData = jwt.decode(request.cookies.access_token);
        if (!isUserDataFromJWT(userData)) {
            return response.status(401).json({ error: 'Invalid token' }).end();
        }

        const { video_id } = request.query;
        if (typeof video_id === 'undefined') {
            return response.status(400).json({ error: 'Missing video_id' }).end();
        }

        // Удаляем реакцию пользователя
        const result = await queryDataBase(
            async (connection) => (
                await connection.execute(
                    `DELETE FROM video_likes WHERE video_id = ? AND user_id = ?`,
                    [video_id, userData.user_id]
                )
            )
        );

        // @ts-ignore
        if (result && result[0].affectedRows > 0) {
            return response.status(200).json({ success: true }).end();
        } else {
            return response.status(404).json({ error: 'Reaction not found' }).end();
        }

    } catch (error: any) {
        console.log(error);
        return response.status(500).end();
    }
}

// exports ================================================== //
export { GET, POST, DELETE };