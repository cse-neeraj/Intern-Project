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

// GET version for easy browser testing
emailRouter.get('/test-send', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).send('<h1>Error: Please provide email query param</h1><p>Example: /api/email/test-send?email=you@example.com</p>');
    }

    console.log(`Attempting to send test email (GET) to: ${email}`);
    const result = await sendEmail({
      to: email,
      subject: 'Test Email (Browser) - Greencart',
      html: '<h1>It Works!</h1><p>Your email configuration is definitively correct.</p>'
    });

    if (result) {
      res.send(`<h1>✅ Email Sent!</h1><p>Check inbox for ${email}</p>`);
    } else {
      // This path is less likely now that we throw on verify, but keeping it just in case
      res.status(500).send('<h1>❌ Failed</h1><p>Unknown error (Function returned false).</p>');
    }
  } catch (error) {
    console.error("Test Send Error:", error);
    res.status(500).send(`
      <h1>❌ Error</h1>
      <p><strong>Message:</strong> ${error.message}</p>
      <p><strong>Code:</strong> ${error.code || 'N/A'}</p>
      <p><strong>Response:</strong> ${error.response || 'N/A'}</p>
      <hr>
      <p><em>Please show this error to your developer.</em></p>
    `);
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