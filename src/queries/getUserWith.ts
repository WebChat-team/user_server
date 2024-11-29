// imports ================================================== //
import dataBase from "../helpers/dataBase";
import type { User } from "../types/user";

// main ===================================================== //
export default async function getUserWith(paramaters: Record<string, string>): Promise<User | null> {

    if (dataBase && Object.keys(paramaters).length) {

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

        const [results, fields] = await dataBase.query(`SELECT * FROM users WHERE ${whereValue}`, values);

        // @ts-ignore: resulst 
        if (results[0]) return results[0];

    }

    return null;

}