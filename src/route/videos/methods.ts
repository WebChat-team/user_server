import type { Response, Request } from "express";
import { queryDataBase } from "../../helpers/dataBase";

// Типы для параметров запроса
interface VideoQueryParams {
    limit?: number;
    offset?: number;
    search_query?: string;
    sort?: 'newest' | 'popular' | 'random';
    duration?: 'short' | 'medium' | 'long';
    category?: string;
    by_user_id?: string;
}

// Основная функция GET
async function GET(request: Request, response: Response) {
    try {
        const {
            limit = 12,
            offset = 0,
            search_query,
            sort = 'newest',
            duration,
            category,
            by_user_id
        } = request.query as unknown as VideoQueryParams;

        // Валидация параметров
        const validatedLimit = String(Math.min(Number(limit), 50));
        const validatedOffset = String(Math.max(Number(offset), 0));

        // Базовый SQL запрос
        let sqlQuery = `
            SELECT 
                v.id, 
                v.user_id, 
                v.timestamp, 
                v.name, 
                v.unique_views,
                p.name as author_name,
                p.avatar_url as author_avatar,
                (
                    SELECT COUNT(*) 
                    FROM video_comments c 
                    WHERE c.video_id = v.id
                ) as comments_count
            FROM videos v
            JOIN profiles p ON v.user_id = p.user_id
            WHERE v.level_access = 'public'
        `;

        // Параметры для запроса
        const queryParams: any[] = [];

        // Поиск по названию
        if (search_query) {
            sqlQuery += ` AND v.name LIKE ?`;
            queryParams.push(`%${search_query}%`);
        }

        // Фильтр по категории
        if (category) {
            sqlQuery += ` AND v.category = ?`;
            queryParams.push(category);
        }

        // Фильтр по продолжительности
        if (duration) {
            const durationMap = {
                'short': 'v.duration < 240',
                'medium': 'v.duration BETWEEN 240 AND 1200',
                'long': 'v.duration > 1200'
            };
            sqlQuery += ` AND ${durationMap[duration]}`;
        }

        if (by_user_id) {
            sqlQuery += ` AND v.user_id = ${by_user_id}`;
        }

        // Сортировка
        switch (sort) {
            case 'newest':
                sqlQuery += ` ORDER BY v.timestamp DESC`;
                break;
            case 'popular':
                sqlQuery += ` ORDER BY v.unique_views DESC`;
                break;
            case 'random':
                sqlQuery += ` ORDER BY RAND()`;
                break;
        }

        // Пагинация
        sqlQuery += ` LIMIT ? OFFSET ?`;
        queryParams.push(validatedLimit, validatedOffset);

        // Выполняем запрос
        const result = await queryDataBase(
            async (connection) => await connection.execute(sqlQuery, queryParams)
        );

        // Запрос для общего количества
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM videos v
            WHERE v.level_access = 'public'
            ${search_query ? `AND v.name LIKE ?` : ''}
            ${category ? `AND v.category = ?` : ''}
        `;

        const countParams = queryParams.slice(0, -2);
        const countResult = await queryDataBase(
            async (connection) => await connection.execute(countQuery, countParams)
        );

        if (result && countResult) {
            return response.json({
                videos: result[0],
                pagination: {
                    // @ts-ignore
                    total: countResult[0][0]?.total || 0,
                    limit: validatedLimit,
                    offset: validatedOffset
                }
            }).end();
        } else {
            return response.status(404).json({ error: 'Videos not found' }).end();
        }

    } catch (error: any) {
        console.error('Error fetching videos:', error);
        return response.status(500).json({ 
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }).end();
    }
}

// Экспортируем только GET метод
export { GET };