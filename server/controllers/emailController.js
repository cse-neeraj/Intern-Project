import { sendEmail } from "../utils/email.js";
import logger from "../configs/logger.js";

export const sendWelcomeEmail = async (req, res) => {
  const { email, name } = req.body;

  // 1. Validate input
  if (!email || !name) {
    return res.status(400).json({ success: false, message: "Email and Name are required." });
  }

  try {
    // 2. Call the sendEmail utility
    const isSent = await sendEmail({
      to: email,
      subject: "Welcome to BuyFresh!",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #22c55e;">Welcome, ${name}!</h2>
          <p>We are excited to have you on board.</p>
        </div>
      `,
      text: `Welcome, ${name}! We are excited to have you on board.`
    });

    // 3. Handle the result (sendEmail returns false if config is missing)
    if (isSent) {
      return res.status(200).json({ success: true, message: "Welcome email sent successfully." });
    } else {
      return res.status(500).json({ success: false, message: "Email service is not configured on the server." });
    }
  } catch (error) {
    // 4. Handle errors (e.g., invalid login, network issues)
    logger.error(`Email Controller Error: ${error.message}`);
    return res.status(500).json({ success: false, message: "Failed to send email due to an internal error." });
  }
};
