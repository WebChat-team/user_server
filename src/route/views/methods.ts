// imports ================================================== //
import type { Response, Request } from "express";
import { queryDataBase } from "../../helpers/dataBase";
import jwt from "jsonwebtoken";
import { isUserDataFromJWT } from "../../helpers/isUserDataFromJWT";
import { createHash } from "crypto";

// main ===================================================== //
async function PUT(request: Request, response: Response) {

    try {

        const { id, duration } = request.query;
        let user_id = null;
        let ip_user = request.headers['x-forwarded-for'] || request.socket.remoteAddress;
        let user_agent_hash = createHash('sha256').update(request.get('User-Agent') || '').digest('hex');

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
                        SELECT 1 FROM video_views 
                        WHERE
                            video_id = ? AND 
                            (user_id = ? OR (ip_address = ? AND user_agent = ?))
                        LIMIT 1
                    `,
                    [id, user_id, ip_user, user_agent_hash]
                )
            )
        );

        if (result && result[0]) {

            // @ts-ignore
            const isUniqueView = !Boolean(result[0][0]);

            await queryDataBase(
                async (connection) => (
                    await connection.execute(
                        `
                            UPDATE videos 
                            SET 
                                views = views + 1,
                                unique_views = unique_views + ?
                            WHERE id = ?
                        `,
                        [isUniqueView ? 1 : 0, id]
                    )
                )
            );

            if (isUniqueView) {
                await queryDataBase(
                    async (connection) => (
                        await connection.execute(
                            `
                                INSERT INTO video_views (video_id, user_id, ip_address, user_agent, duration)
                                VALUES (?, ?, ?, ?, ?)
                            `,
                            [id, user_id, ip_user, user_agent_hash, duration]
                        )
                    )
                );
            }

            return response.json({ success: true, isUniqueView }).end();

        }

    } catch (error: any) {
        console.error('Error adding video view:', error);
        return { success: false, error: error.message };
    }

}

// exports ================================================== //
export { PUT };