// imports ================================================== //
import type { Response, Request } from "express";
import getUserWith from "../../queries/getUserWith";
import addUser from "../../queries/addUser";
import getAuthTokens from "../../helpers/getAuthTokens";

// main ===================================================== //
async function POST(request: Request, response: Response) {

    console.log("sdfsfsdsf");

    if (
        request.body &&
        request.body.email &&
        request.body.password
    ) {

        const { email, password } = request.body;
        console.log(email, password);
        const user = await getUserWith({ email });
        console.log(user);

        if (user) {
            response.sendStatus(409);
        } else {
            const userId = await addUser(email, password);
            console.log(userId);
            if (userId) {
                const tokens = await getAuthTokens(userId);
                console.log(tokens);
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