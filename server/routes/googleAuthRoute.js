import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import logger from '../configs/logger.js';
import { sendEmail } from '../utils/email.js';
import { googleLoginEmail, verifyOtpEmail } from '../utils/emailTemplates.js';

const googleAuthRouter = express.Router();
const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, "");

googleAuthRouter.get('/google', passport.authenticate('google', { session: false, scope: ['profile', 'email'] }));

googleAuthRouter.get('/google/callback', (req, res, next) => {
  console.log("Google callback hit");
  console.log(process.env.GOOGLE_CLIENT_ID);

  passport.authenticate('google', { session: false }, async (err, user, info) => {
    console.log("Passport authenticate finished", { err, user, info });
    if (err) {
      console.log(process.env.GOOGLE_CLIENT_ID);

      logger.error(`Google Auth Error: ${err.message}`);
      return res.redirect(`${frontendUrl}/login`);
    }
    if (!user) {
      logger.error("Google Auth Failed: No user returned");
      return res.redirect(`${frontendUrl}/login`);
    }

    try {
      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
      await user.save();

      // Send OTP Email
      if (user.email) {
        console.log(`Sending Google Login OTP to: ${user.email}`);
        const emailContent = verifyOtpEmail(otp, user.name || 'User');
        await sendEmail({
          to: user.email,
          subject: 'Verify Your Login - Greencart',
          html: emailContent
        });
      }

      // Redirect to frontend OTP verification page
      return res.redirect(`${frontendUrl}/verify-otp?email=${encodeURIComponent(user.email)}&isGoogle=true`);

    } catch (error) {
      logger.error(`Google Auth OTP Error: ${error.message}`);
      return res.redirect(`${frontendUrl}/login?error=auth_failed`);
    }
  })(req, res, next);
});

export default googleAuthRouter;
