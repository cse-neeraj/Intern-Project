import newsletterModel from "../models/newsletterModel.js";
import { sendEmail } from "../utils/email.js";

const subscribe = async (req, res) => {
    try {
        const { email } = req.body;
        const existing = await newsletterModel.findOne({ email });
        if (existing) {
            return res.json({ success: false, message: "Email already subscribed" });
        }
        const newSubscription = new newsletterModel({ email });
        await newSubscription.save();

        // Send welcome email
        let emailMessage = "";
        try {
            const sent = await sendEmail({
                to: email,
                subject: 'Welcome to BuyFresh! 🎉',
                html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                            <div style="background-color: #22c55e; padding: 20px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Thanks for Subscribing!</h1>
                            </div>
                            <div style="padding: 30px; background-color: #ffffff; text-align: center;">
                                <h2 style="color: #333333; margin-top: 0; font-size: 20px;">Welcome to the BuyFresh Family!</h2>
                                <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">You're all set to receive the latest deals, new arrivals, and exclusive discounts directly to your inbox.</p>
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="display: inline-block; background-color: #22c55e; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Start Shopping</a>
                            </div>
                            <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0; font-size: 12px; color: #888888;">&copy; ${new Date().getFullYear()} BuyFresh. All rights reserved.</div>
                        </div>
                    `
            });

            if (sent) {
                emailMessage = " (Welcome email sent)";
            } else {
                emailMessage = " (Email skipped: credentials missing)";
            }
        } catch (error) {
            console.log("Welcome email failed:", error.message);
            emailMessage = " (Email failed to send)";
        }
        
        res.json({ success: true, message: "Subscribed successfully" + emailMessage });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const listSubscribers = async (req, res) => {
    try {
        const subscribers = await newsletterModel.find({}).sort({ date: -1 });
        res.json({ success: true, subscribers });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const sendOffer = async (req, res) => {
    try {
        const { subject, message } = req.body;
        
        const subscribers = await newsletterModel.find({});

        if (subscribers.length === 0) {
            return res.json({ success: false, message: "No subscribers to send to." });
        }

        try {
            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                console.log("Offer email skipped (simulation): EMAIL_USER or EMAIL_PASS not set in .env");
                return res.json({ success: true, message: `Offer sent to ${subscribers.length} subscribers successfully (Simulated)` });
            }

            const emailPromises = subscribers.map(subscriber => {
                return sendEmail({
                    to: subscriber.email,
                    subject: subject,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                            <div style="background-color: #22c55e; padding: 20px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Exclusive Offer!</h1>
                            </div>
                            <div style="padding: 30px; background-color: #ffffff;">
                                <h2 style="color: #333333; margin-top: 0; font-size: 20px;">${subject}</h2>
                                <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                                    ${message.replace(/\n/g, '<br>')}
                                </p>
                                <div style="text-align: center;">
                                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/products" style="display: inline-block; background-color: #22c55e; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                                        Shop Now
                                    </a>
                                </div>
                            </div>
                            <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
                                <p style="color: #888888; font-size: 12px; margin: 0;">You received this email because you subscribed to our newsletter.</p>
                                <p style="color: #888888; font-size: 12px; margin: 5px 0 0;">&copy; ${new Date().getFullYear()} BuyFresh. All rights reserved.</p>
                            </div>
                        </div>
                    `
                });
            });

            await Promise.all(emailPromises);
            res.json({ success: true, message: `Offer sent to ${subscribers.length} subscribers successfully` });
        } catch (error) {
            console.log("Error sending offer emails:", error);
            res.json({ success: false, message: error.message });
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { subscribe, listSubscribers, sendOffer };