// imports ================================================== //
import mysql from "mysql2";
import type { Connection } from "mysql2/promise";
import dotenv from "dotenv";

// constants ================================================ //
dotenv.config({ path: ".env.local" });
const { DATABASE_HOST, DATABASE_NAME, DATABASE_PASSWORD, DATABASE_USERNAME } = process.env;

// main ===================================================== //
let dataBase: Connection | undefined;

try {

    dataBase = mysql.createConnection({
        host: DATABASE_HOST,
        database: DATABASE_NAME,
        user: DATABASE_USERNAME,
        password: DATABASE_PASSWORD,
    }).promise();

} catch (error) {
    console.error(
        "К сожалению, не удалось подключится к базе данных. Error: \n",
        error
    );
}

// exports ================================================== //
export default dataBase;