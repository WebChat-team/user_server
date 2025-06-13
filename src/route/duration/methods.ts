
// imports ================================================== //
import type { Response, Request } from "express";
import jwt from "jsonwebtoken";
import { isUserDataFromJWT } from "../../helpers/isUserDataFromJWT";
import { queryDataBase } from "../../helpers/dataBase";

// main ===================================================== //
async function PUT(request: Request, response: Response) {

    try {

        const { id, duration } = request.query;

        if (request.cookies.access_token) {

            const userData = jwt.decode(request.cookies.access_token);

            if (isUserDataFromJWT(userData)) {
             
                const result = await queryDataBase(
                    async (connection) => (
                        await connection.execute(
                            `
                                SELECT 1 FROM video_views 
                                WHERE video_id = ? AND user_id = ?
                                LIMIT 1
                            `,
                            [id, userData.user_id]
                        )
                    )
                );

                if (result && result[0]) {

                    await queryDataBase(
                        async (connection) => (
                            await connection.execute(
                                `
                                    UPDATE video_views SET duration = ? 
                                    WHERE video_id = ? AND user_id = ?
                                `,
                                [duration, id, userData.user_id]
                            )
                        )
                    );

                    return response.status(200).end();
        
                }
        
                return response.status(404).end();
                
            }

        }

        return response.status(403).end();

    } catch (error: any) {
        console.error('Error adding video view:', error);
        return response.status(500).end();
    }

}

// exports ================================================== //
export { PUT };