import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import 'dotenv/config';
import logger from './logger.js';

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  logger.error("❌ Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env file");
}

const callbackURL = "http://localhost:4000/api/user/google/callback";

logger.info(`Google Callback URL: ${callbackURL}`);

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL,
    proxy: true
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      if (!profile.emails || profile.emails.length === 0) {
        return done(new Error("No email found in Google profile"), null);
      }

      const email = profile.emails[0].value;
      let user = await User.findOne({ email });

      console.log("Google Profile:", JSON.stringify(profile, null, 2));

      if (user) {
        console.log("Found existing user:", user.email);
        console.log("Current profilePicture:", user.profilePicture);
        
        // Force update for debugging or if meaningful change
        if (profile.photos && profile.photos.length > 0) {
           const googlePhoto = profile.photos[0].value;
           console.log("Google has photo:", googlePhoto);
           // Only set profile picture if user doesn't have one
           if (!user.profilePicture) {
               console.log("Setting user profile picture from Google...");
               user.profilePicture = googlePhoto;
               await user.save();
           } else {
               console.log("User already has a profile picture. Skipping Google photo sync.");
           }
        } else {
            console.log("No photos in Google profile.");
        }
      } else {
        console.log("Creating new user...");
        user = await User.create({
          name: profile.displayName || "User",
          email: email,
          password: Math.random().toString(36).slice(-8), // Dummy password for OAuth users
          profilePicture: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : ""
        });
      }

      return done(null, user);
    } catch (error) {
      logger.error(`Google Auth Error: ${error.message}`);
      return done(error, null);
    }
  }
));
} else {
  logger.warn("⚠️ Google OAuth credentials missing. Google Login will not work.");
}
