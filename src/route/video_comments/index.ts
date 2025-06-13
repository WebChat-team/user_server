// imports ================================================== //
import { Router } from "express";
import { GET, POST, DELETE, PUT } from "./methods";

// constants ================================================ //
const ROUTER = Router();

// main ===================================================== //
ROUTER
    .route("/")
        .get(GET)
        .post(POST)
        .put(PUT)
        .delete(DELETE);

// exports ================================================== //
export default ROUTER;