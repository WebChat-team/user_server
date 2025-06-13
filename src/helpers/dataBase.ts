// imports ================================================== //
import mysql from "mysql2";
import type { Pool, PoolConnection } from "mysql2/promise";
import dotenv from "dotenv";

// constants ================================================ //
dotenv.config({ path: ".env.local" });
const { DATABASE_HOST, DATABASE_PORT, DATABASE_NAME, DATABASE_PASSWORD, DATABASE_USERNAME } = process.env;

// main ===================================================== //
let pool: Pool | undefined;

try {

    pool = mysql.createPool({

        host: DATABASE_HOST,
        port: Number(DATABASE_PORT),
        database: DATABASE_NAME,
        user: DATABASE_USERNAME,
        password: DATABASE_PASSWORD,

        waitForConnections: true, 
        connectionLimit: 4,
        queueLimit: 0,

    }).promise();

} catch (error) {
    console.error(
        "К сожалению, не удалось подключится к базе данных. Error: \n",
        error
    );
}

async function queryDataBase<T extends any>(query: (connection: PoolConnection) => T ): Promise<T | undefined> {

    if (!pool) return;

    const connection = await pool.getConnection();

    try {
        return await query(connection);
    } finally {
        connection.release();
    }

}

// exports ================================================== //
export { pool, queryDataBase };