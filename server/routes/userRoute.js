import express from "express";
import {
  login,
  register,
  isAuth,
  logout,
  sendOtp,
  loginWithOtp,
  updateProfile,
  uploadProfilePicture,
} from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";
import { forgotPassword, resetPassword } from '../controllers/authController.js';
import { upload } from "../configs/multer.js";

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
userRouter.post("/upload-profile-picture", authUser, upload.single('image'), uploadProfilePicture);

export default userRouter;
