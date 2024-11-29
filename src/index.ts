// requires ================================================= //
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import debag from "./middlewares/debag";
import { POST as loginPost } from "./route/login/methods";
import { POST as registerPost } from "./route/register/methods";

// constants ================================================ //
dotenv.config({ path: ".env.local" });
const { PORT, MODE, HOST } = process.env;

// main ===================================================== //
(async () => {

    const APP = express();

    if (MODE === "development") APP.use(debag());

    APP.use(cors());
    APP.use(express.json());
    APP.use(cookieParser());

    APP.post("/login", loginPost);
    APP.post("/register", registerPost);

    APP.listen(
        PORT,
        () => {
            console.info(
                `\nCORS mode enabled `,
                `\nServer started at http://${HOST}:${PORT} \n`
            );
        }
    );
    
})();