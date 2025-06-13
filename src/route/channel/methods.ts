// imports ================================================== //
import type { Response, Request } from "express";
import { queryDataBase } from "../../helpers/dataBase";

// main ===================================================== //
async function GET(request: Request, response: Response) {

    const { id } = request.query;

    let resultQueryDataBase = await queryDataBase(
        async (connection) => await connection.execute("SELECT avatar_url, name FROM profiles WHERE user_id = ?", [id])
    );

    if (resultQueryDataBase) {
        // @ts-ignore
        return response.json(resultQueryDataBase[0][0]).end();
    }

    return response.status(404).end();

}

// exports ================================================== //
export { GET };