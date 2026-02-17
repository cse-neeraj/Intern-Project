import { sendGmailApi } from './gmailClient.js';

export const sendEmail = async ({ to, subject, html, text, attachments }) => {
    try {
        // Priority 1: Use Gmail API if Refresh Token is available (Bypasses Render Block)
        if (process.env.GMAIL_REFRESH_TOKEN) {
            console.log("🚀 Sending via Gmail API...");
            return await sendGmailApi({ to, subject, html });
        }

        console.warn("⚠️ GMAIL_REFRESH_TOKEN missing. Falling back to SMTP (May fail on Render).");

        const emailUser = process.env.EMAIL_USER || process.env.SMTP_MAIL || process.env.SMTP_USER;
        const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASSWORD || process.env.SMTP_PASS;

        if (!emailUser || !emailPass) {
            console.error("❌ Email sending failed: Missing credentials.");
            console.error(`   EMAIL_USER / SMTP_MAIL: ${emailUser ? 'Set' : 'Missing'}`);
            console.error(`   EMAIL_PASS / SMTP_PASSWORD: ${emailPass ? 'Set' : 'Missing'}`);
            return false;
        }

        const nodemailer = (await import('nodemailer')).default;

        const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
        // Default to 587 as it is more reliable on cloud hosting (Render) than 465
        const smtpPort = Number(process.env.SMTP_PORT) || 587;

        const transportConfig = {
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465, // true for 465, false for other ports
            auth: {
                user: emailUser.trim(),
                pass: emailPass.replace(/\s+/g, '')
            },
            tls: {
                rejectUnauthorized: false // Helps avoid self-signed cert errors in some cloud envs
            },
            // Debugging options
            debug: true,
            logger: true
        };

        console.log("📧 Email Config:", {
            host: smtpHost,
            port: smtpPort,
            user: transportConfig.auth.user ? '***' + transportConfig.auth.user.slice(-4) : 'MISSING'
        });

        const transporter = nodemailer.createTransport(transportConfig);

        const mailOptions = {
            from: `"Greencart" <${emailUser}>`,
            to,
            subject,
            html,
            text,
            attachments
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        if (error.responseCode === 535) {
            console.error("Tip: If using Gmail, use an App Password instead of your login password. Enable 2-Step Verification -> Security -> App Passwords.");
        }
        if (error.code === 'ETIMEDOUT') {
            console.error("Tip: Connection timed out. If on Render, try setting SMTP_PORT to 587 in your environment variables.");
        }
        throw error;
    }
};