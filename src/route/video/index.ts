// imports ================================================== //
import { Router } from "express";
import { GET, POST } from "./methods";
import upload from "../../helpers/multier";

// constants ================================================ //
const ROUTER = Router();

// main ===================================================== //
ROUTER
    .route("/")
        .get(GET)
        .post(upload.single("video"), POST);

// exports ================================================== //
export default ROUTER;