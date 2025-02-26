import express from "express";
import tryCatch from "../utils/tryCatch.js";
import {
  sendOtp,
  verifyRegister,
  userLogin,
  userLogout,
  refreshingToken,
  verifyOtp,
} from "../controllers/authController.js";
import verifyToken from "../middlewares/auth.js";

const router = express.Router();

router

  .get("/send_otp/:email", tryCatch(sendOtp))
  .post("/verify_otp", tryCatch(verifyOtp))
  .post("/register", tryCatch(verifyRegister))
  .post("/login", tryCatch(userLogin))
  .post("/logout",verifyToken, tryCatch(userLogout))
  .post("/refreshToken", tryCatch(refreshingToken));

export default router;
