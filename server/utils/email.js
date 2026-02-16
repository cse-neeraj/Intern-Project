export const sendEmail = async ({ to, subject, html, text, attachments }) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn("Email sending skipped: EMAIL_USER or EMAIL_PASS not configured.");
            return false;
        }

        const nodemailer = (await import('nodemailer')).default;

        const transportConfig = {
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: process.env.EMAIL_SECURE === 'true',
            family: 4, // Force IPv4 to prevent Gmail IPv6 timeouts on cloud (Critical Fix)
            dnsCache: true, // Cache DNS lookups for performance
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS?.replace(/\s+/g, '')
            },
            connectionTimeout: 10000, 
            greetingTimeout: 10000
        };

        // Only use 'service' if it's explicitly set to something other than gmail
        // (using 'service: gmail' forces port 465, which we want to avoid if 587 is requested)
        if (process.env.EMAIL_SERVICE && process.env.EMAIL_SERVICE.toLowerCase() !== 'gmail') {
            transportConfig.service = process.env.EMAIL_SERVICE;
        }

        const transporter = nodemailer.createTransport(transportConfig);

        // Verify connection configuration
        try {
            await transporter.verify();
            console.log("✅ Email Server is ready to take our messages");
        } catch (error) {
            console.error("❌ Email Server Connection Failed:", error.message);
            throw new Error(`Connection Failed: ${error.message}`);
        }

        const mailOptions = {
            from: `"Greencart" <${process.env.EMAIL_USER}>`,
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
        throw error;
    }
};