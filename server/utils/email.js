export const sendEmail = async ({ to, subject, html, text, attachments }) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn("Email sending skipped: EMAIL_USER or EMAIL_PASS not configured.");
            return false;
        }

        const nodemailer = (await import('nodemailer')).default;

        // Minimal Configuration - removing specific optimizations that might conflict with Render's network
        const transportConfig = {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER?.trim(),
                pass: process.env.EMAIL_PASS?.replace(/\s+/g, '')
            },
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