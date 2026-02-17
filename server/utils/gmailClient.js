import { google } from 'googleapis';
import 'dotenv/config';

const createGmailClient = () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = (process.env.BACKEND_URL || 'http://localhost:4000') + '/api/setup-gmail/callback';
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

    const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

    if (refreshToken) {
        oAuth2Client.setCredentials({ refresh_token: refreshToken });
    }

    return oAuth2Client;
};

// Helper to encode email in base64url format
const makeBody = (to, from, subject, message) => {
    const str = [
        `To: ${to}`,
        `From: ${from}`,
        `Subject: ${subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=utf-8',
        '',
        message
    ].join('\n');

    return Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const sendGmailApi = async ({ to, subject, html }) => {
    try {
        const auth = createGmailClient();
        
        // Check if we have a refresh token
        if (!process.env.GMAIL_REFRESH_TOKEN) {
            throw new Error("GMAIL_REFRESH_TOKEN is missing. Please run the setup flow.");
        }

        const gmail = google.gmail({ version: 'v1', auth });

        const emailUser = process.env.EMAIL_USER || process.env.SMTP_MAIL;
        const raw = makeBody(to, `Greencart <${emailUser}>`, subject, html);

        const res = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: raw,
            },
        });

        console.log(`✅ Email sent via Gmail API! ID: ${res.data.id}`);
        return true;
    } catch (error) {
        console.error("❌ Gmail API Error:", error.result?.data?.error?.message || error.message);
        throw error;
    }
};

export { createGmailClient, sendGmailApi };
