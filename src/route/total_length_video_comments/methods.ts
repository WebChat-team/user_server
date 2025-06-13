
// imports ================================================== //
import type { Response, Request } from "express";
import { queryDataBase } from "../../helpers/dataBase";

// main ===================================================== //
async function GET(request: Request, response: Response) {

    try {

        const { video_id } = request.query;

        const result = await queryDataBase(
            async (connection) => (
                await connection.execute(
                    `
                        SELECT COUNT(*) AS total_length
                        FROM video_comments
                        WHERE video_id = ? AND is_approved = TRUE
                    `,
                    [video_id]
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
        return response.status(500).end();
    }

}

// exports ================================================== //
export { GET };