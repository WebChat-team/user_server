// imports ================================================== //
import { queryDataBase } from "../helpers/dataBase";
import { hash } from "bcrypt";

// main ===================================================== //
export default async function addUser(email: string, password: string) {

    const hashed_password = await hash(password, 10);

    const result = await queryDataBase((connection) => (
        connection.execute(
            "INSERT INTO users (email, password) VALUES (?, ?)",
            [email, hashed_password]
        )
    ));

    // @ts-ignore
    return result[0].insertId;

}