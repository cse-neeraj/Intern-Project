import 'dotenv/config';
import nodemailer from 'nodemailer';

async function testEmail() {
    console.log("🚀 Starting Email Test...");

    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
        console.error("❌ Missing EMAIL_USER or EMAIL_PASS");
        return;
    }

    console.log(`📧 Using Account: ${user}`);
    
    // Create transporter using 'Gmail' service
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: user,
            pass: pass.replace(/\s+/g, '') // remove spaces just in case
        }
    });

    try {
        console.log("1️⃣ Verifying connection...");
        await transporter.verify();
        console.log("✅ Connection Verified!");

        console.log("2️⃣ Sending test email...");
        const info = await transporter.sendMail({
            from: `"Test Script" <${user}>`,
            to: user, // Send to self
            subject: "Test Email from Debug Script",
            text: "If you see this, email sending is WORKING!",
        });

        console.log("✅ Email sent: %s", info.messageId);
    } catch (error) {
        console.error("❌ Error:", error);
    }
}

testEmail();
