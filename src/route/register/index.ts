// imports ================================================== //
import { Router } from "express";
import { POST } from "./methods";

// constants ================================================ //
const ROUTER = Router();

// main ===================================================== //
ROUTER
    .route("/")
        .post(POST);

// exports ================================================== //
export default ROUTER;