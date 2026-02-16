export const sendEmail = async ({ to, subject, html, text, attachments }) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn("Email sending skipped: EMAIL_USER or EMAIL_PASS not configured.");
            return false;
        }

        const nodemailer = (await import('nodemailer')).default;

        const transportConfig = {
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.EMAIL_PORT || '465'), // Try Port 465 (SSL) instead of 587
            secure: process.env.EMAIL_SECURE !== 'false', // Default to true for 465
            family: 4, 
            dnsCache: true,
            debug: true, // Enable verbose logging for debugging
            logger: true, // Log to console
            auth: {
                user: process.env.EMAIL_USER?.trim(),
                pass: process.env.EMAIL_PASS?.replace(/\s+/g, '')
            },
            connectionTimeout: 20000, // Increase to 20s
            greetingTimeout: 20000
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