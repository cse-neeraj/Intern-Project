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
      // Remove old OTP logic, login user directly
      user.otp = undefined;
      user.otpExpire = undefined;
      await user.save();

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // Send successful login email asynchronously in the background
      // This prevents the login flow from waiting for the email to send
      if (user.email) {
        console.log(`Queueing Google Login Success Email to: ${user.email}`);
        const emailContent = googleLoginEmail(user.name || 'User');
        
        sendEmail({
            to: user.email,
            subject: 'New Login Alert - Greencart',
            html: emailContent
        }).catch(emailErr => {
            console.error("⚠️ Background Error: Login Email failed to send.", emailErr.message);
        });
      }

      // Redirect directly to frontend Home page IMMEDIATELY with token in URL
      return res.redirect(`${frontendUrl}/?token=${token}`);

    } catch (error) {
      logger.error(`Google Auth Error: ${error.message}`);
      return res.redirect(`${frontendUrl}/?error=auth_failed`);
    }
  })(req, res, next);
});

export default googleAuthRouter;
