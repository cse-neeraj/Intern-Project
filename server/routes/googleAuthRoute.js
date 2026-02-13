import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import logger from '../configs/logger.js';
import { sendEmail } from '../utils/email.js';
import { googleLoginEmail } from '../utils/emailTemplates.js';

const googleAuthRouter = express.Router();
const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, "");

googleAuthRouter.get('/google', passport.authenticate('google', { session: false, scope: ['profile', 'email'] }));

googleAuthRouter.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, async (err, user, info) => {
    if (err) {
      logger.error(`Google Auth Error: ${err.message}`);
      return res.redirect(`${frontendUrl}/login`);
    }
    if (!user) {
      logger.error("Google Auth Failed: No user returned");
      return res.redirect(`${frontendUrl}/login`);
    }
    if (!process.env.JWT_SECRET) {
      logger.error("Google Auth Error: JWT_SECRET is not defined");
      return res.redirect(`${frontendUrl}/login`);
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Send Login Notification Email
    try {
      if (user.email) {
        const emailContent = googleLoginEmail(user.name || 'User');
        await sendEmail({
          to: user.email,
          subject: 'New Google Login Detected',
          html: emailContent
        });
      }
    } catch (emailError) {
      logger.error(`Failed to send Google login email: ${emailError.message}`);
    }

    res.redirect(`${frontendUrl}?token=${token}`);
  })(req, res, next);
});

export default googleAuthRouter;
