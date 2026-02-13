export const sendEmail = async ({ to, subject, html, text, attachments }) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn("Email sending skipped: EMAIL_USER or EMAIL_PASS not configured.");
            return false;
        }

        const nodemailer = (await import('nodemailer')).default;

        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS?.replace(/\s+/g, '')
            }
        });

        const mailOptions = {
            from: `"BuyFresh" <${process.env.EMAIL_USER}>`,
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