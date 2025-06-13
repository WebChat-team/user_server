// imports ================================================== //
import { Router } from "express";
import { DELETE, GET, POST } from "./methods";

// constants ================================================ //
const ROUTER = Router();

// main ===================================================== //
ROUTER
    .route("/")
        .get(GET)
        .post(POST)
        .delete(DELETE);

// exports ================================================== //
export default ROUTER;