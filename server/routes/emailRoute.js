import express from "express";
import { sendWelcomeEmail } from "../controllers/emailController.js";

const emailRouter = express.Router();

emailRouter.post("/send-welcome", sendWelcomeEmail);

export default emailRouter;