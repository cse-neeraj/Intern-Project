import 'dotenv/config';
import nodemailer from 'nodemailer';

async function verifyConfig(config, name) {
    console.log(`\n🔍 Testing Configuration: ${name}`);
    console.log(`   Host: ${config.host || 'service: ' + config.service}`);
    console.log(`   Port: ${config.port || 'N/A'}`);
    console.log(`   Secure: ${config.secure}`);
    const transporter = nodemailer.createTransport(config);

    try {
        await transporter.verify();
        console.log(`✅ SUCCESS: ${name} connected!`);
        return true;
    } catch (error) {
        console.error(`❌ FAILED: ${name}`);
        console.error(`   Error: ${error.message}`);
        return false;
    }
}

async function runDebug() {
    const user = process.env.EMAIL_USER || process.env.SMTP_MAIL || process.env.SMTP_USER;
    const pass = process.env.EMAIL_PASS || process.env.SMTP_PASSWORD || process.env.SMTP_PASS;

    if (!user || !pass) {
        console.error("❌ CRTICAL: Missing credentials");
        return;
    }

    // Explicit Port 587 (The Fix)
    const config587 = {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: { user, pass },
        tls: { rejectUnauthorized: false }
    };

    await verifyConfig(config587, "Forced Port 587");
}

runDebug();
