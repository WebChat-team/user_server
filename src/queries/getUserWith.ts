// imports ================================================== //
import { queryDataBase } from "../helpers/dataBase";
import type { User } from "../types/user";

// main ===================================================== //
export default async function getUserWith(paramaters: Record<string, string>): Promise<User | null> {

    if (Object.keys(paramaters).length) {

        let values = [];
        let whereValue = "";
        for (let name_parameter in paramaters) {
            values.push(paramaters[name_parameter]);
            if (whereValue === "") {
                whereValue = `${name_parameter} = ?`;
            } else {
                whereValue += ` AND ${name_parameter} = ?`;
            }
        }

        const result = await queryDataBase(
            async (connection) => {
                return await connection.query(`SELECT * FROM users WHERE ${whereValue}`, values);
            }
        );

        // @ts-ignore: resulst 
        if (result && result[0][0]) return result[0][0];

    }

    return null;

}