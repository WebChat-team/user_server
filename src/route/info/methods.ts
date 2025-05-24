import type { Response, Request } from "express";
import { queryDataBase } from "../../helpers/dataBase";

async function GET(request: Request, response: Response) {

    const { id } = request.query;

    if (id) {

        const result = await queryDataBase(
            async (connection) => (
                await connection.execute(`
                    SELECT
                        user_id,
                        timestamp,
                        name,
                        description,
                        has_comments,
                        has_load
                    FROM
                        videos
                    WHERE
                        level_access = 'public'
                        AND
                        id = ?
                `, [id])
            )
        );

        if (result && result[0]) {
            // @ts-ignore
            return response.json(result[0][0]).end();
        }

    }

    return response.status(404).end();

}

export { GET };