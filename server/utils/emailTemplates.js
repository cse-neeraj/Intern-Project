export const resetPasswordEmail = (resetUrl, name) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f3f4f6;
      margin: 0;
      padding: 0;
      line-height: 1.6;
      color: #374151;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .header {
      background-color: #10b981;
      padding: 32px 20px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.025em;
    }
    .content {
      padding: 40px 32px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 16px;
    }
    .message {
      margin-bottom: 24px;
      color: #4b5563;
    }
    .button-container {
      text-align: center;
      margin: 32px 0;
    }
    .button {
      display: inline-block;
      background-color: #10b981;
      color: #ffffff;
      padding: 14px 32px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      transition: background-color 0.2s;
      box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);
    }
    .button:hover {
      background-color: #059669;
    }
    .expiry-text {
      font-size: 14px;
      color: #6b7280;
      text-align: center;
      margin-top: 24px;
    }
    .footer {
      background-color: #f9fafb;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
      border-top: 1px solid #e5e7eb;
    }
    .link-fallback {
      color: #10b981;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>BuyFresh</h1>
    </div>
    <div class="content">
      <p class="greeting">Hello ${name},</p>
      <p class="message">We received a request to reset the password for your BuyFresh account. If you didn't make this request, you can safely ignore this email.</p>
      
      <div class="button-container">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </div>
      
      <p class="message">For security, this link will expire in 15 minutes.</p>
      
      <p class="message" style="margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 24px;">
        Best regards,<br>
        <strong>The BuyFresh Team</strong>
      </p>
    </div>
    <div class="footer">
      <p>If you're having trouble clicking the "Reset Password" button, copy and paste the URL below into your web browser:</p>
      <p><a href="${resetUrl}" class="link-fallback">${resetUrl}</a></p>
      <p style="margin-top: 16px;">&copy; ${new Date().getFullYear()} BuyFresh. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};
