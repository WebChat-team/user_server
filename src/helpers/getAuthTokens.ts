// imports ================================================== //
import dotenv from "dotenv";

// constants ================================================ //
dotenv.config({ path: ".env.local" });
const { HOST, PORT } = process.env;

// main ===================================================== //
export default async function getAuthTokens(userId: number) {

    const response = await fetch(
        "http://api.webchat.com:3000/auth/get_tokens.php",
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "Application/json",
                "Origin": `http://${HOST}:${PORT}`
            },
            body: JSON.stringify({ userId })
        }
    );  

    return response.headers.getSetCookie();

}