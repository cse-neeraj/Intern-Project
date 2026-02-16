import 'dotenv/config';
import { sendEmail } from './utils/email.js';

const testEmail = async () => {
    console.log("Testing Email Sending...");
    console.log(`User: ${process.env.EMAIL_USER}`);
    console.log(`Pass: ${process.env.EMAIL_PASS ? '********' : 'Not Set'}`);
    console.log(`Host: ${process.env.EMAIL_HOST}`);
    console.log(`Port: ${process.env.EMAIL_PORT}`);

    try {
        const result = await sendEmail({
            to: process.env.EMAIL_USER, // Send to self
            subject: 'Test Email from Script',
            html: '<h1>If you see this, email is working!</h1>'
        });

        if (result) {
            console.log("✅ Email sent successfully!");
        } else {
            console.log("❌ Email failed to send (Function returned false).");
        }
    } catch (error) {
        console.error("❌ Email failed with error:", error);
    }
};

testEmail();
