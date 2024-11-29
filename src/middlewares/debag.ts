// imports ================================================== //
import type { RequestHandler } from "express";

// types ==================================================== //
type debagType = () => RequestHandler

// main ===================================================== //
const debag: debagType = () => {

    console.info("\nDebag mode enabled");

    return async function (request, response, next) {

        const { method, url } = request;
        console.info(`\n ${method} ${url}`);

        next();

    };

}

// exports ================================================== //
export default debag;