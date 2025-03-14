import express from "express";
import verifyToken from "../middlewares/auth.js";
import tryCatch from "../utils/tryCatch.js";

import {sendMessage, getMessages, getMessageList, getOrCreateChat} from "../controllers/user/messageController.js";

const router = express.Router();

router

    .post("/send", verifyToken, tryCatch(sendMessage))
    .get("/chat/:userId", verifyToken, tryCatch(getMessages))
    .get("/chats/:user1/:user2", verifyToken, tryCatch(getOrCreateChat))
    .get("/list", verifyToken, tryCatch(getMessageList))

    export default router