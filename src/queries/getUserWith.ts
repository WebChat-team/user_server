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

        const results = await queryDataBase((connection) => (
            connection.query(`SELECT * FROM users WHERE ${whereValue}`, values)
        ));

        // @ts-ignore: resulst 
        if (results[0]) return results[0][0];

    }

    return null;

}