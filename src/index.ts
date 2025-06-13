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
import viewsRoute from "./route/views";
import durationRoute from "./route/duration";
import videoCommentsRoute from "./route/video_comments";
import videoLikesRoute from "./route/video_like";
import totalLengthVideoCommentsRoute from "./route/total_length_video_comments";

// constants ================================================ //
dotenv.config({ path: ".env.local" });
const { PORT, MODE, HOST } = process.env;

// main ===================================================== //
(async () => {

    const APP = express();
    if (MODE === "development") APP.use(debag());

    APP.use(cors());
    APP.use(cookieParser());
    APP.use(express.json());

    APP.use("/video", videoRoute);
    APP.use("/photo", photoRoute);
    APP.use("/videos", videosRoute);
    APP.use("/video/comments", videoCommentsRoute);
    APP.use("/video/likes", videoLikesRoute);
    APP.use("/video/comments/total_length", totalLengthVideoCommentsRoute);
    APP.use("/info", infoRoute);
    APP.use("/views", viewsRoute);
    APP.use("/duration", durationRoute);

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
