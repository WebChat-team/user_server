import type { Response, Request } from "express";
import { queryDataBase } from "../../helpers/dataBase";
import jwt from "jsonwebtoken";
import { isUserDataFromJWT } from "../../helpers/isUserDataFromJWT";
import { createHash } from "crypto";

async function GET(request: Request, response: Response) {

    const { id } = request.query;
    let user_id = null;
    const ip_user = request.headers['x-forwarded-for'] || request.socket.remoteAddress;
    const user_agent_hash = createHash('sha256').update(request.get('User-Agent') || '').digest('hex');

    if (request.cookies.access_token) {
        const userData = jwt.decode(request.cookies.access_token);
        if (isUserDataFromJWT(userData)) {
            user_id = userData.user_id;
        }
    }

    if (id) {

        const result = await queryDataBase(
            async (connection) => (
                await connection.execute(`
                    SELECT 
                        v.id,
                        v.name,
                        v.description,
                        v.timestamp,
                        JSON_OBJECT(
                            'id', p.user_id,
                            'name', p.name,
                            'avatar_url', p.avatar_url,
                            'subscriptionCounter', (SELECT COUNT(*) FROM subscriptions WHERE channel_id = p.user_id)
                        ) AS channel,
                        v.has_load AS hasload,
                        v.age_limit,
                        v.level_access,
                        v.unique_views,
                        v.has_comments,
                        IFNULL(
                            (
                                SELECT vw.duration 
                                FROM video_views vw
                                WHERE vw.video_id = v.id 
                                  AND vw.user_id = ?
                                ORDER BY vw.viewed_at DESC
                                LIMIT 1
                            ),
                            0
                        ) AS user_view_duration,
                        EXISTS (
                            SELECT 1 
                            FROM video_views vw 
                            WHERE
                                vw.video_id = ? AND 
                                (vw.user_id = ? OR (ip_address = ? AND user_agent = ?))
                        ) AS is_viewed
                    FROM 
                        videos v
                    JOIN 
                        profiles p ON v.user_id = p.user_id
                    LEFT JOIN
                        subscriptions s ON s.channel_id = p.user_id
                    WHERE 
                        v.id = ?
                    GROUP BY
                        v.name, v.description, v.timestamp, v.has_load, 
                        v.age_limit, v.level_access, p.user_id, p.name,
                        p.avatar_url, v.id;
                `, [user_id, id, user_id, ip_user, user_agent_hash, id])
            )
        );

        if (result && result[0]) {
            // @ts-ignore
            return response.json(result[0][0]).end();
        }

    }

    return response.status(404).json({ error: "undefined" }).end();

}

export { GET };