// imports ================================================== //
import { queryDataBase } from "../helpers/dataBase";
import { hash } from "bcrypt";

// main ===================================================== //
export default async function addUser(email: string, password: string) {

    const hashed_password = await hash(password, 10);

    const result = await queryDataBase((connection) => (
        connection.execute(
            "INSERT INTO users (email, hashed_password) VALUES (?, ?)",
            [email, hashed_password]
        )
    ));
    
    // @ts-ignore
    const userId = result[0].insertId;
    
    const resultD = await queryDataBase((connection) => (
        connection.execute(
            "INSERT INTO profiles (user_id, avatar_url, name) VALUES (?, ?, ?)",
            [userId, `/imgs/default_avatar.png`, `user_${userId}`]
        )
    ));

    return userId;

}