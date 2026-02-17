import 'dotenv/config';
import nodemailer from 'nodemailer';

async function testEmailDebug() {
    console.log("🚀 Starting Detailed Email Debug...");
    
    // 1. Check Env Vars
    const config = {
        service: process.env.EMAIL_SERVICE,
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE,
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS ? '******' : 'MISSING',
    };
    console.log("📄 Configuration from .env:", config);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("❌ Critical: EMAIL_USER or EMAIL_PASS is missing.");
        return;
    }

    // 2. Construct Transporter (mimicking server/utils/email.js logic)
    const transportConfig = {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true', 
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        debug: true, // Enable debug output
        logger: true  // Enable logger
    };

    // Mimic the service override logic
    if (process.env.EMAIL_SERVICE) {
        if (process.env.EMAIL_SERVICE.toLowerCase() === 'gmail') {
            console.log("⚠️ EMAIL_SERVICE is 'gmail'. Nodemailer will use 'Gmail' service preset (Port 465, SSL).");
            console.log("   This overrides EMAIL_HOST/PORT/SECURE settings!");
            transportConfig.service = 'Gmail';
        } else {
            transportConfig.service = process.env.EMAIL_SERVICE;
        }
    }

    console.log("🔧 Final Transporter Config (sans auth):", {
        ...transportConfig,
        auth: { user: transportConfig.auth.user, pass: '******' }
    });

    const transporter = nodemailer.createTransport(transportConfig);

    // 3. Verify Connection
    try {
        console.log("1️⃣ Verifying connection... (Timeout 10s)");
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error("Connection Verification Timeout")), 10000);
            transporter.verify((error, success) => {
                clearTimeout(timeout);
                if (error) reject(error);
                else resolve(success);
            });
        });
        console.log("✅ Connection Verified!");
    } catch (error) {
        console.error("❌ Connection Verification Failed:", error.message);
        if (error.code === 'EAUTH') {
            console.error("   -> Auth Error. Check email/password. If Gmail, check App Password.");
        }
        // We'll try sending anyway, just in case verify is flaky
    }

    // 4. Send Email
    try {
        console.log("2️⃣ Sending test email...");
        const info = await transporter.sendMail({
            from: `"Debug Script" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: "Debug Email Test",
            text: "This is a test email from the debug script.",
        });
        console.log("✅ Email sent successfully!");
        console.log("   Message ID:", info.messageId);
        console.log("   Preview URL:", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error("❌ Email Sending Failed:", error.message);
        console.error("   Error Code:", error.code);
        console.error("   Error Command:", error.command);
    }
}

testEmailDebug();
