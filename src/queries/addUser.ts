// imports ================================================== //
import { queryDataBase } from "../helpers/dataBase";
import { hash } from "bcrypt";
import type { OkPacketParams } from "mysql2";

// main ===================================================== //
export default async function addUser(email: string, password: string) {

    const hashed_password = await hash(password, 10);

    const resultQueryDataBase = await queryDataBase(
        async (connection) => connection.execute(
            "INSERT INTO users (email, hashed_password) VALUES (?, ?)",
            [email, hashed_password]
        )
    );


    if (resultQueryDataBase) {

        const result = resultQueryDataBase[0] as OkPacketParams;
        const userId = result.insertId;

        if (userId) {

            await queryDataBase(
                async (connection) => connection.execute(
                    "INSERT INTO profiles (user_id, name) VALUES (?, ?)",
                    [userId, `Пользователь ${userId}`]
                )
            );

            // @ts-ignore
            return userId;
            
        }

    }

    return null;

}