// imports ================================================== //
import { type Response, type Request } from "express";
import jwt from "jsonwebtoken";
import { queryDataBase } from "../../helpers/dataBase";
import { isUserDataFromJWT } from "./helpers";

// main ===================================================== //
async function GET(request: Request, response: Response) {

    let hasFindUser = false;

    if (request.cookies.access_token) {

        let userData = jwt.decode(request.cookies.access_token);
        if (!userData) {
            userData = jwt.decode(Buffer.from(request.cookies.access_token).toString("base64url"));
        }

        if (isUserDataFromJWT(userData)) {

            const { detail } = request.query;

            let resultQueryDataBase = null;
            switch (detail) {

                case "account":
                    resultQueryDataBase = await queryDataBase(
                        async (connection) => await connection.execute(`
                            SELECT 
                              u.email,
                              p.name,
                              p.avatar_url,
                              p.bio,
                              u.id,
                              (SELECT COUNT(*) FROM subscriptions s WHERE s.channel_id = u.id) AS subscriber_count,
                              (SELECT COUNT(*) FROM subscriptions s WHERE s.subscriber_id = u.id) AS subscriptions_count,
                              (
                                SELECT JSON_ARRAYAGG(
                                  JSON_OBJECT(
                                    'user_id', s.subscriber_id,
                                    'avatar_url', ps.avatar_url
                                  )
                                )
                                FROM (
                                  SELECT subscriber_id
                                  FROM subscriptions
                                  WHERE channel_id = u.id
                                  LIMIT 5
                                ) s
                                JOIN profiles ps ON s.subscriber_id = ps.user_id
                              ) AS subscribers_avatars,
                              (
                                SELECT JSON_ARRAYAGG(
                                  JSON_OBJECT(
                                    'user_id', s.channel_id,
                                    'avatar_url', pt.avatar_url
                                  )
                                )
                                FROM (
                                  SELECT channel_id
                                  FROM subscriptions
                                  WHERE subscriber_id = u.id
                                  LIMIT 5
                                ) s
                                JOIN profiles pt ON s.channel_id = pt.user_id
                              ) AS subscriptions_avatars,
                              (SELECT COUNT(*) FROM videos v WHERE v.user_id = u.id) AS videos_count
                            FROM users u
                            INNER JOIN profiles p ON u.id = p.user_id
                            WHERE u.id = ?
                        `, [userData.user_id])
                    );
                    break;

                case "profile":
                    resultQueryDataBase = await queryDataBase(
                        async (connection) => await connection.execute("SELECT * FROM profiles WHERE user_id = ?", [userData.user_id])
                    );
                    break;

            }

            if (resultQueryDataBase) {
                // @ts-ignore
                const userData = resultQueryDataBase[0][0];
                response.json(userData);
                hasFindUser = true;
            }
            
        }

    }

    if (hasFindUser) {
        response.send();
    } else {
        response.status(404).send();
    }

}
async function PUT(request: Request, response: Response) {
    
    if (request.cookies.access_token) {

        const userData = jwt.decode(request.cookies.access_token);

        if (isUserDataFromJWT(userData)) {

            const { type } = request.query;

            switch (type) {

                case "profile":
                    let keys = [];
                    let values = [];
                    for (let key in request.body) {
                        keys.push(`${key} = ?`);
                        values.push(request.body[key]);
                    }
                    await queryDataBase(
                        async (connection) => await connection.execute(`UPDATE profiles SET ${keys.join(",")} WHERE user_id = ?`, [...values, userData.user_id])
                    );
                    break;

            }

            return response.status(200).send();

        }

    }

    return response
        .status(404)
        .send();

}

// exports ================================================== //
export { GET, PUT };