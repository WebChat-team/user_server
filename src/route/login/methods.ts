// imports ================================================== //
import type { Response, Request } from "express";
import getUserWith from "../../queries/getUserWith";
import getAuthTokens from "../../helpers/getAuthTokens";
import bcrypt from "bcrypt";

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
            // @ts-ignore
            if (await bcrypt.compare(password, user.hashed_password)) {
                const tokens = await getAuthTokens(user.id);
                if (tokens) {
                    response
                        .setHeader("Set-Cookie", tokens)
                        .sendStatus(200);
                    return;
                } else {
                    response.sendStatus(500);
                }
            } else {
                response.sendStatus(403);
            }
        } else {
            response.sendStatus(403);
        }

    } else {    
        response.sendStatus(401);
    }

}

// exports ================================================== //
export { POST };