export const sendEmail = async ({ to, subject, html, text, attachments }) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn("Email sending skipped: EMAIL_USER or EMAIL_PASS not configured.");
            return false;
        }

        const nodemailer = (await import('nodemailer')).default;

        const transportConfig = {
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.EMAIL_PORT || '465'), // Default to 465 (SSL)
            secure: process.env.EMAIL_SECURE === 'true' || process.env.EMAIL_PORT === '465' || !process.env.EMAIL_PORT, // Default to secure for 465
            family: 4, // Force IPv4 to avoid timeouts on some cloud providers
            dnsCache: false, // Disable cache to ensure fresh lookup
            debug: true,
            logger: true,
            tls: {
                rejectUnauthorized: false, // Permissive for debugging
                ciphers: 'SSLv3' // Compatibility fallback
            },
            auth: {
                user: process.env.EMAIL_USER?.trim(),
                pass: process.env.EMAIL_PASS?.replace(/\s+/g, '')
            },
            connectionTimeout: 10000, // 10s
            greetingTimeout: 10000
        };

        // FORCE VALIDATION: If using Gmail, allow override to 465 (SSL) if 587 is failing or configured
        if (transportConfig.host === 'smtp.gmail.com') {
             // If env var is set to 587, force it to 465 because 587 is blocked on some cloud providers (like Render)
             if (transportConfig.port === 587) {
                 console.log("⚠️ Detected Gmail on Port 587. Forcing switch to Port 465 (SSL) for reliability on cloud hosting.");
                 transportConfig.port = 465;
                 transportConfig.secure = true;
             }
        }

        /* 
        // EMAIL_SERVICE overrides manual host/port which causes issues with 587
        if (process.env.EMAIL_SERVICE) {
            if (process.env.EMAIL_SERVICE.toLowerCase() === 'gmail') {
                transportConfig.service = 'Gmail'; // Use built-in Gmail preset (Port 465, SSL)
            } else {
                transportConfig.service = process.env.EMAIL_SERVICE;
            }
        }
        */

        console.log("📧 Email Config:", {
            host: transportConfig.host,
            port: transportConfig.port,
            secure: transportConfig.secure,
            family: transportConfig.family,
            user: transportConfig.auth.user ? '***' + transportConfig.auth.user.slice(-4) : 'MISSING',
            pass: transportConfig.auth.pass ? 'PRESENT' : 'MISSING'
        });

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