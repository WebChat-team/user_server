// imports ================================================== //
import dataBase from "../helpers/dataBase";
import { hash } from "bcrypt";

// main ===================================================== //
export default async function addUser(email: string, password: string) {

    if (dataBase) {

        const hashed_password = await hash(password, 10);

        const [result] = await dataBase.execute(
            "INSERT INTO users (email, password) VALUES (?, ?)",
            [email, hashed_password]
        );

        // @ts-ignore
        return result.insertId;

    }

    return null;

}