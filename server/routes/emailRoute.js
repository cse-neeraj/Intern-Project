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


emailRouter.get('/config-check', (req, res) => {
  res.json({
    email_user_configured: !!process.env.EMAIL_USER,
    email_pass_configured: !!process.env.EMAIL_PASS,
    email_host: process.env.EMAIL_HOST || 'default (smtp.gmail.com)',
    email_port: process.env.EMAIL_PORT || 'default (587)',
    email_secure: process.env.EMAIL_SECURE || 'default (false)',
    node_env: process.env.NODE_ENV
  });
});

export default emailRouter;