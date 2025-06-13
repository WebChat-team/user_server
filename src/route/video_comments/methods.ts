
// imports ================================================== //
import type { Response, Request } from "express";
import { queryDataBase } from "../../helpers/dataBase";
import jwt from "jsonwebtoken";
import { isUserDataFromJWT } from "../../helpers/isUserDataFromJWT";

// main ===================================================== //
async function GET(request: Request, response: Response) {

    try {

        const { video_id, limit = 20, offset = 0 } = request.query;

        let user_id = null;
        if (request.cookies.access_token) {
            const userData = jwt.decode(request.cookies.access_token);
            if (isUserDataFromJWT(userData)) {
                user_id = userData.user_id;
            }
        }

        const numericLimit = Math.min(Number(limit), 50);

        const result = await queryDataBase(async (connection) => (
            await connection.execute(
                `
                    SELECT 
                        c.id,
                        c.user_id,
                        c.text,
                        c.created_at,
                        c.updated_at,
                        c.parent_id,
                        p.avatar_url,
                        p.name,
                        (
                            SELECT COUNT(*) 
                            FROM video_comments cc 
                            WHERE cc.parent_id = c.id AND cc.is_approved = TRUE
                        ) AS reply_count,
                        ${user_id ? `EXISTS (
                            SELECT 1 
                            FROM video_comment_likes cl 
                            WHERE cl.comment_id = c.id AND cl.user_id = ? AND cl.is_like = TRUE
                        ) AS is_liked_by_user` : 'NULL AS is_liked_by_user'},
                        (
                            SELECT COUNT(*)
                            FROM video_comment_likes cl
                            WHERE cl.comment_id = c.id AND cl.is_like = TRUE
                        ) AS likes_count
                    FROM 
                        video_comments c
                    JOIN
                        profiles p ON c.user_id = p.user_id
                    WHERE 
                        c.video_id = ? 
                        AND c.is_approved = TRUE
                        AND c.parent_id IS NULL
                    ORDER BY
                        c.created_at DESC
                    LIMIT ? OFFSET ?;
                `,
                user_id
                    ? [user_id, video_id, numericLimit.toString(), offset]
                    : [video_id, numericLimit.toString(), offset]
            )
        ));

        return response.json({
            success: true,
            // @ts-ignore
            data: result[0],
            pagination: {
                limit: numericLimit,
                offset: Number(offset)
            }
        });

    } catch (error: any) {
        console.error(error);
        return response.status(500).end();
    }

};
async function POST (request: Request, response: Response) {
    try {

        if (!request.cookies.access_token) {
            return response.status(401).json({ error: 'Unauthorized' }).end();
        }

        const userData = jwt.decode(request.cookies.access_token);
        if (!isUserDataFromJWT(userData)) {
            return response.status(401).json({ error: 'Invalid token' }).end();
        }

        const { video_id, parent_id, text } = request.query;

        if (!video_id || !text) {
            return response.status(400).json({ 
                error: 'video_id and text are required' 
            }).end();
        }

        const result = await queryDataBase(
            async (connection) => (
                await connection.execute(
                    `
                    INSERT INTO video_comments 
                        (user_id, video_id, parent_id, text, created_at, updated_at, is_edited, is_approved)
                    VALUES 
                        (?, ?, ?, ?, NOW(), NOW(), FALSE, TRUE);
                    `,
                    [userData.user_id, video_id, parent_id || null, text]
                )
            )
        );

        // @ts-ignore
        if (result && result[0].affectedRows > 0) {
            return response.status(201).json({ success: true }).end();
        } else {
            return response.status(400).json({ error: 'Failed to add comment' }).end();
        }

    } catch (error: any) {
        console.log(error);
        return response.status(500).end();
    }
};
async function PUT(request: Request, response: Response) {
    try {

        if (!request.cookies.access_token) {
            return response.status(401).json({ error: 'Unauthorized' }).end();
        }

        const userData = jwt.decode(request.cookies.access_token);
        if (!isUserDataFromJWT(userData)) {
            return response.status(401).json({ error: 'Invalid token' }).end();
        }

        const { id } = request.query;

        // Проверяем существование комментария
        const commentCheck = await queryDataBase(
            async (connection) => (
                await connection.execute(
                    `SELECT 1 FROM video_comments WHERE id = ?`,
                    [id]
                )
            )
        );

        // @ts-ignore
        if (!commentCheck || commentCheck[0].length === 0) {
            return response.status(404).json({ error: 'Comment not found' }).end();
        }

        // Проверяем, есть ли уже лайк от пользователя
        const existingLike = await queryDataBase(
            async (connection) => (
                await connection.execute(
                    `SELECT 1 FROM video_comment_likes WHERE comment_id = ? AND user_id = ?`,
                    [id, userData.user_id]
                )
            )
        );

        // @ts-ignore
        if (existingLike && existingLike[0].length > 0) {
            // Удаляем лайк, если он уже есть
            await queryDataBase(
                async (connection) => (
                    await connection.execute(
                        `DELETE FROM video_comment_likes WHERE comment_id = ? AND user_id = ?`,
                        [id, userData.user_id]
                    )
                )
            );
            return response.status(200).json({ liked: false }).end();
        } else {
            // Добавляем лайк
            await queryDataBase(
                async (connection) => (
                    await connection.execute(
                        `INSERT INTO video_comment_likes (comment_id, user_id) VALUES (?, ?)`,
                        [id, userData.user_id]
                    )
                )
            );
            return response.status(200).json({ liked: true }).end();
        }

    } catch (error: any) {
        console.log(error);
        return response.status(500).end();
    }
};
async function DELETE(request: Request, response: Response) {
    try {
        if (!request.cookies.access_token) {
            return response.status(401).json({ error: 'Unauthorized' }).end();
        }

        const userData = jwt.decode(request.cookies.access_token);
        if (!isUserDataFromJWT(userData)) {
            return response.status(401).json({ error: 'Invalid token' }).end();
        }

        const { id } = request.query;

        // Проверяем, принадлежит ли комментарий пользователю
        const commentCheck = await queryDataBase(
            async (connection) => (
                await connection.execute(
                    `SELECT user_id FROM video_comments WHERE id = ?`,
                    [id]
                )
            )
        );

        // @ts-ignore
        if (!commentCheck || commentCheck[0].length === 0) {
            return response.status(404).json({ error: 'Comment not found' }).end();
        }

        // @ts-ignore
        if (commentCheck[0][0].user_id !== userData.user_id) {
            return response.status(403).json({ error: 'Forbidden' }).end();
        }

        const result = await queryDataBase(
            async (connection) => (
                await connection.execute(
                    `DELETE FROM video_comments WHERE id = ?`,
                    [id]
                )
            )
        );

        // @ts-ignore
        if (result && result[0].affectedRows > 0) {
            return response.status(200).json({ success: true }).end();
        } else {
            return response.status(400).json({ error: 'Failed to delete comment' }).end();
        }

    } catch (error: any) {
        console.log(error);
        return response.status(500).end();
    }
};

// exports ================================================== //
export { GET, POST, DELETE, PUT };