// imports ================================================== //
import type { Response, Request } from "express";
import getUserWith from "../../queries/getUserWith";
import addUser from "../../queries/addUser";
import getAuthTokens from "../../helpers/getAuthTokens";

// main ===================================================== //
async function POST(request: Request, response: Response) {

    if (
        request.body &&
        request.body.email &&
        request.body.password
    ) {

        const { email, password } = request.body;
        const user = await getUserWith({ email });

        if (user) {
            response.sendStatus(409);
        } else {
            const userId = await addUser(email, password);
            if (userId) {
                const tokens = await getAuthTokens(userId);
                if (tokens) {
                    response
                        .setHeader("Set-Cookie", tokens)
                        .sendStatus(200);
                    return;
                }
            }
            response.sendStatus(500);
        }

    } else {    
        response.sendStatus(401);
    }

}

// exports ================================================== //
export { POST };