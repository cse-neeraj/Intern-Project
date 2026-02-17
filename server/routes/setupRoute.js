import express from 'express';
import { google } from 'googleapis';
import 'dotenv/config';

const setupRouter = express.Router();

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

setupRouter.get('/gmail', (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = (process.env.BACKEND_URL || 'http://localhost:4000') + '/api/setup-gmail/callback';

    const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline', // Crucial for refresh token
        scope: SCOPES,
        prompt: 'consent' // Force consent screen to ensure refresh token is returned
    });

    res.redirect(authUrl);
});

setupRouter.get('/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) return res.send("Error: No code returned");

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = (process.env.BACKEND_URL || 'http://localhost:4000') + '/api/setup-gmail/callback';

    const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

    try {
        const { tokens } = await oAuth2Client.getToken(code);
        
        if (!tokens.refresh_token) {
            return res.send(`
                <h1>Error: No Refresh Token</h1>
                <p>Google didn't send a refresh token. Did you verify the app permissions?</p>
                <p>Try <a href="/api/setup-gmail/gmail">Adding Permissions again</a>.</p>
            `);
        }

        res.send(`
            <h1>✅ Setup Successful!</h1>
            <p><strong>Copy this Refresh Token into your Render Environment Variables:</strong></p>
            <div style="background: #f4f4f4; padding: 20px; font-family: monospace; word-break: break-all;">
                GMAIL_REFRESH_TOKEN=${tokens.refresh_token}
            </div>
            <p>Also confirm your Callback URL is added to Google Cloud Console:</p>
            <code>${redirectUri}</code>
        `);
    } catch (error) {
        console.error("Error retrieving access token", error);
        res.send(`Error: ${error.message}`);
    }
});

export default setupRouter;
