import express from "express";
import {
  login,
  register,
  isAuth,
  logout,
  sendOtp,
  loginWithOtp,
  updateProfile,
  googleLogin,
} from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";
import { forgotPassword, resetPassword } from '../controllers/authController.js';

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.post("/is-auth", authUser, isAuth);
userRouter.post("/logout", authUser, logout);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);
userRouter.post("/send-otp", sendOtp);
userRouter.post("/login-otp", loginWithOtp);
userRouter.post("/update-profile", authUser, updateProfile);
userRouter.post("/google-login", googleLogin);

export default userRouter;
