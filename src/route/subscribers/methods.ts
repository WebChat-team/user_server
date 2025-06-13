// imports ================================================== //
import type { Response, Request } from "express";
import { queryDataBase } from "../../helpers/dataBase";

// main ===================================================== //
async function GET(request: Request, response: Response) {
    try {

        let { user_id } = request.query;

        const result = await queryDataBase(
            async (connection) => (
                await connection.execute(
                    `SELECT 
                        p.user_id,
                        p.name,
                        p.avatar_url,
                        (SELECT COUNT(*) from subscriptions WHERE channel_id = p.user_id) AS subscribers_count
                    FROM subscriptions s
                    JOIN profiles p ON s.channel_id = p.user_id
                    WHERE s.subscriber_id = ?`,
                    [user_id]
                )
            )
        );

        if (result) {
            // @ts-ignore
            return response.json(result[0]).end();
        } else {
            return response.status(404).end();
        }

    } catch (error: any) {
        console.log(error);
        return response.status(500).end();
    }
};

// exports ================================================== //
export { GET };