// requires ================================================= //
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import debag from "./middlewares/debag";
import videoRoute from "./route/video";
import photoRoute from "./route/photo";
import videosRoute from "./route/videos";
import infoRoute from "./route/info";

// constants ================================================ //
dotenv.config({ path: ".env.local" });
const { PORT, MODE, HOST } = process.env;

// main ===================================================== //
(async () => {

    const APP = express();
    if (MODE === "development") APP.use(debag());

    APP.use(cors());
    APP.use(cookieParser());

    APP.use("/video", videoRoute);
    APP.use("/photo", photoRoute);
    APP.use("/videos", videosRoute);
    APP.use("/info", infoRoute);

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
