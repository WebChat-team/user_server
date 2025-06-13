// imports ================================================== //
import dotenv from "dotenv";

// constants ================================================ //
dotenv.config({ path: ".env.local" });

// main ===================================================== //
export default async function getAuthTokens(userId: number) {

    const response = await fetch(
        `${process.env.API_SERVER_ADDRESS}/auth/get_tokens.php`,
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "Application/json",
                "Origin": `http://${process.env.SERVER_HOST}`
            },
            body: JSON.stringify({ userId })
        }
    );  

    return response.headers.getSetCookie();

}