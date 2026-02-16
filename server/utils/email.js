export const sendEmail = async ({ to, subject, html, text, attachments }) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn("Email sending skipped: EMAIL_USER or EMAIL_PASS not configured.");
            return false;
        }

        const nodemailer = (await import('nodemailer')).default;

        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.EMAIL_PORT || '587'), // Use 587 by default
            secure: process.env.EMAIL_SECURE === 'true', // false for 587, true for 465
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS?.replace(/\s+/g, '')
            },
            // Use 10 seconds timeout for better reliability in all environments
            connectionTimeout: 10000, 
            greetingTimeout: 10000
        });

        // Verify connection configuration
        try {
            await transporter.verify();
            console.log("✅ Email Server is ready to take our messages");
        } catch (error) {
            console.warn("⚠️ Email Server Connection Failed (Dev Mode):", error.message);
            return false;
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