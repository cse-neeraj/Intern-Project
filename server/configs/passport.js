import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import 'dotenv/config';
import nodemailer from 'nodemailer';

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

      // Send login notification email
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          service: process.env.SMTP_HOST ? undefined : 'gmail',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: email,
          subject: 'Login Notification',
          text: `Hello ${user.name},\n\nYou have successfully logged in with Google.\n\nIf this wasn't you, please contact support immediately.\n\nBest regards,\nBuyFresh Team`,
        });
      } catch (emailError) {
        console.error("Failed to send login notification email:", emailError);
      }

      return done(null, user);
    } catch (error) {
      console.error("Google Auth Error:", error);
      return done(error, null);
    }
  }
));
