// imports ================================================== //
import { Router } from "express";
import { GET } from "./methods";

// constants ================================================ //
const ROUTER = Router();

// main ===================================================== //
ROUTER
    .route("/")
        .get(GET);

// exports ================================================== //
export default ROUTER;