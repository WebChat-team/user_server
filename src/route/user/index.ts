// imports ================================================== //
import { Router } from "express";
import { GET, PUT } from "./methods";

// constants ================================================ //
const ROUTER = Router();

// main ===================================================== //
ROUTER
    .route("/")
        .get(GET)
        .put(PUT);

// exports ================================================== //
export default ROUTER;