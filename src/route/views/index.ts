// imports ================================================== //
import { Router } from "express";
import { PUT } from "./methods";

// constants ================================================ //
const ROUTER = Router();

// main ===================================================== //
ROUTER
    .route("/")
        .put(PUT);

// exports ================================================== //
export default ROUTER;