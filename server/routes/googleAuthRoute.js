import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const googleAuthRouter = express.Router();
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

googleAuthRouter.get('/google', passport.authenticate('google', { session: false, scope: ['profile', 'email'] }));

googleAuthRouter.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${frontendUrl}/login` }),
  (req, res) => {
    try {
      const user = req.user;
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.redirect(`${frontendUrl}?token=${token}`);
    } catch (error) {
      console.error("Google Callback Error:", error);
      res.redirect(`${frontendUrl}/login`);
    }
  }
);

export default googleAuthRouter;
