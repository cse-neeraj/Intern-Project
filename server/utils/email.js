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
        const smtpPort = Number(process.env.SMTP_PORT) || 587;

        // Minimal Configuration - removing specific optimizations that might conflict with Render's network
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
            connectionTimeout: 10000, // Fail fast (10s) to avoid hanging
            // Debugging options
            debug: true,
            logger: true
        };
        
        // Allow env overrides if strictly necessary, but default to the above for Gmail
        if (process.env.EMAIL_SERVICE === 'gmail') {
             // If user explicitly wants "service: gmail" (simple mode)
             transportConfig.service = 'gmail';
             delete transportConfig.host;
             delete transportConfig.port;
             delete transportConfig.secure;
        }

        console.log("📧 Email Config:", {
            host: transportConfig.host,
            port: transportConfig.port,
            secure: transportConfig.secure,
            family: transportConfig.family,
            user: transportConfig.auth.user ? '***' + transportConfig.auth.user.slice(-4) : 'MISSING',
            pass: transportConfig.auth.pass ? 'PRESENT' : 'MISSING'
        });

        const transporter = nodemailer.createTransport(transportConfig);

        // Verify connection configuration (Non-blocking)
        try {
            await transporter.verify();
            console.log("✅ Email Server is ready to take our messages");
        } catch (error) {
            console.warn("⚠️ Email Server Verification Warning:", error.message);
            // We do NOT throw here anymore. We'll try to send anyway.
        }

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