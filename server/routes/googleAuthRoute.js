import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import logger from '../configs/logger.js';
import { sendEmail } from '../utils/email.js';
import { googleLoginEmail, verifyOtpEmail } from '../utils/emailTemplates.js';

const googleAuthRouter = express.Router();

googleAuthRouter.get('/google', passport.authenticate('google', { session: false, scope: ['profile', 'email'] }));

googleAuthRouter.get('/google/callback', (req, res, next) => {
  const frontendUrl = (process.env.FRONTEND_URL || 'https://buyfresh-client.onrender.com').replace(/\/$/, "");
  console.log("Google callback hit");
  console.log("Redirecting to Frontend URL:", frontendUrl);
  console.log(process.env.GOOGLE_CLIENT_ID);

  passport.authenticate('google', { session: false }, async (err, user, info) => {
    console.log("Passport authenticate finished", { err, user, info });
    if (err) {
      console.log(process.env.GOOGLE_CLIENT_ID);

      logger.error(`Google Auth Error: ${err.message}`);
      return res.redirect(`${frontendUrl}/?error=auth_error`);
    }
    if (!user) {
      logger.error("Google Auth Failed: No user returned");
      return res.redirect(`${frontendUrl}/?error=no_user`);
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
        console.log(`🔐 LOGIN OTP (Manual Retrieval): ${otp}`); // Log OTP for Render logs

        const emailContent = verifyOtpEmail(otp, user.name || 'User');
        
        try {
            await sendEmail({
              to: user.email,
              subject: 'Verify Your Login - Greencart',
              html: emailContent
            });
        } catch (emailErr) {
            console.error("⚠️ Soft Error: OTP Email failed to send (likely Render block), but proceeding to verification page.", emailErr.message);
        }
      }

      // Redirect to frontend OTP verification page
      return res.redirect(`${frontendUrl}/verify-otp?email=${encodeURIComponent(user.email)}&isGoogle=true`);

    } catch (error) {
      logger.error(`Google Auth OTP Error: ${error.message}`);
      // Redirect to Home with error param so helpful toast can be shown
      return res.redirect(`${frontendUrl}/?error=email_failed`);
    }
  })(req, res, next);
});

export default googleAuthRouter;
