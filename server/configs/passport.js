import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import 'dotenv/config';

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error("❌ Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env file");
}

const backendUrl = process.env.BACKEND_URL ? process.env.BACKEND_URL.trim() : null;

if (process.env.NODE_ENV === 'production' && !backendUrl) {
  console.warn("⚠️  WARNING: NODE_ENV is 'production' but BACKEND_URL is not set. Google Login will likely fail with redirect_uri_mismatch.");
}

const callbackURL = backendUrl 
  ? `${backendUrl.replace(/\/$/, "")}/api/user/google/callback` 
  : "/api/user/google/callback";

console.log("🔵 Google OAuth Config:");
console.log(`   - Client ID: ${process.env.GOOGLE_CLIENT_ID?.substring(0, 15)}...`);
console.log(`   - BACKEND_URL: ${backendUrl || "NOT SET (Using relative path)"}`);
console.log(`   - Callback URL: ${callbackURL}`);

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

      if (!user) {
        user = await User.create({
          name: profile.displayName || "User",
          email: email,
          password: Math.random().toString(36).slice(-8), // Dummy password for OAuth users
        });
      }
      return done(null, user);
    } catch (error) {
      console.error("Google Auth Error:", error);
      return done(error, null);
    }
  }
));
