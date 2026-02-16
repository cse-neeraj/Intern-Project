import express from 'express';
import { sendEmail } from '../utils/email.js';

const emailRouter = express.Router();

emailRouter.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    console.log(`Attempting to send test email to: ${email}`);
    const result = await sendEmail({
      to: email,
      subject: 'Test Email - Greencart',
      html: '<h1>It Works!</h1><p>Your email configuration is correct.</p>'
    });

    if (result) {
      res.json({ success: true, message: 'Email sent successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send email (Check server logs)' });
    }
  } catch (error) {
    console.error("Test Email Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default emailRouter;