// requires ================================================= //
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import debag from "./middlewares/debag";
import channelRoute from "./route/channel";
import videosRoute from "./route/login";
import infoRoute from "./route/info";
import registerRoute from "./route/register";
import subsRoute from "./route/subscriptions";
import userRoute from "./route/user";
import loginRoute from "./route/login";
import subersRoute from "./route/subscribers";

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

    APP.use("/register", registerRoute);
    APP.use("/login", loginRoute);
    APP.use("/channel", channelRoute);
    APP.use("/videos", videosRoute);
    APP.use("/info", infoRoute);
    APP.use("/subscriptions", subsRoute);
    APP.use("/subscribers", subersRoute);
    APP.use("/user", userRoute);

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
