// imports ================================================== //
import type { Response, Request } from "express";
import { queryDataBase } from "../../helpers/dataBase";

// main ===================================================== //
async function GET(request: Request, response: Response) {

    const { limit } = request.query;

    const result = await queryDataBase(
        async (connection) => (
            await connection.execute(`SELECT id, user_id, timestamp, name FROM videos WHERE level_access = 'public' ORDER BY RAND() LIMIT ${limit || 6}`)
        )
    );

    if (result) {
        return response.json(result[0]).end();
    } else {
        return response.status(404).end();
    }

}

// exports ================================================== //
export { GET };