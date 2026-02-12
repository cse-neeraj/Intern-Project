import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const googleAuthRouter = express.Router();
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

googleAuthRouter.get('/google', passport.authenticate('google', { session: false, scope: ['profile', 'email'] }));

googleAuthRouter.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err) {
      console.error("Google Auth Error:", err);
      return res.redirect(`${frontendUrl}/login`);
    }
    if (!user) {
      console.error("Google Auth Failed: No user returned");
      return res.redirect(`${frontendUrl}/login`);
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`${frontendUrl}?token=${token}`);
  })(req, res, next);
});

export default googleAuthRouter;
