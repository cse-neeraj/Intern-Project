const emailStyles = `
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
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  }
  .header {
    background-color: #10b981;
    padding: 30px 20px;
    text-align: center;
  }
  .header h1 {
    color: #ffffff;
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.5px;
  }
  .content {
    padding: 40px 30px;
  }
  .greeting {
    font-size: 20px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 20px;
  }
  .message {
    margin-bottom: 24px;
    color: #4b5563;
    font-size: 16px;
  }
  .button-container {
    text-align: center;
    margin: 35px 0;
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
    box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.4);
  }
  .button:hover {
    background-color: #059669;
  }
  .alert-box {
    background-color: #f0fdf4;
    border-left: 4px solid #10b981;
    padding: 20px;
    margin: 25px 0;
    border-radius: 6px;
  }
  .alert-box.warning {
    background-color: #fef2f2;
    border-left: 4px solid #ef4444;
  }
  .alert-detail {
    margin: 5px 0;
    color: #065f46;
    font-size: 15px;
  }
  .divider {
    border-top: 1px solid #e5e7eb;
    margin: 30px 0;
  }
  .footer {
    background-color: #f9fafb;
    padding: 24px;
    text-align: center;
    font-size: 13px;
    color: #9ca3af;
    border-top: 1px solid #e5e7eb;
  }
  .link-secondary {
    color: #10b981;
    text-decoration: none;
  }
  .link-secondary:hover {
    text-decoration: underline;
  }
`;

export const resetPasswordEmail = (resetUrl, name) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>${emailStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Greencart</h1>
    </div>
    <div class="content">
      <p class="greeting">Hi ${name},</p>
      <p class="message">We received a request to reset the password for your Greencart account. If you didn't ask for this, you can safely ignore this email.</p>
      
      <div class="button-container">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </div>
      
      <p class="message" style="font-size: 14px; color: #6b7280; text-align: center;">This link will expire in 15 minutes for your security.</p>
      
      <div class="divider"></div>
      
      <p class="message" style="margin-bottom: 0;">
        Best regards,<br>
        <strong>The Greencart Team</strong>
      </p>
    </div>
    <div class="footer">
      <p style="margin-bottom: 10px;">Having trouble with the button?</p>
      <p style="word-break: break-all;"><a href="${resetUrl}" class="link-secondary">${resetUrl}</a></p>
      <p style="margin-top: 20px;">&copy; ${new Date().getFullYear()} Greencart. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

export const googleLoginEmail = (name) => {
  const loginTime = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Login Alert - Greencart</title>
  <style>${emailStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Login Alert</h1>
    </div>
    <div class="content">
      <p class="greeting">Hello ${name},</p>
      <p class="message">We noticed a new login to your Greencart account via Google.</p>
      
      <div class="alert-box">
        <p class="alert-detail"><strong>Time:</strong> ${loginTime}</p>
        <p class="alert-detail"><strong>Method:</strong> Google Authentication</p>
        <p class="alert-detail"><strong>Status:</strong> Successful</p>
      </div>
      
      <p class="message">If this was you, great! You don't need to do anything else.</p>
      
      <div class="alert-box warning">
        <p class="alert-detail" style="color: #991b1b;"><strong>Wasn't you?</strong></p>
        <p class="message" style="margin: 5px 0 0 0; color: #7f1d1d; font-size: 14px;">
          If you didn't authorize this login, please contact our support team immediately to secure your account.
        </p>
      </div>
      
      <div class="divider"></div>

      <p class="message" style="margin-bottom: 0;">
        Best,<br>
        <strong>The Greencart Security Team</strong>
      </p>
    </div>
    <div class="footer">
      <p>This is an automated security notification.</p>
      <p style="margin-top: 10px;">&copy; ${new Date().getFullYear()} Greencart. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

export const verifyOtpEmail = (otp, name) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Login</title>
  <style>${emailStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Verify Login</h1>
    </div>
    <div class="content">
      <p class="greeting">Hello ${name},</p>
      <p class="message">Please use the following One-Time Password (OTP) to complete your login. This OTP is valid for 10 minutes.</p>
      
      <div class="alert-box">
        <p style="text-align: center; margin: 0;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 5px; color: #10b981; display: block; margin-bottom: 5px;">${otp}</span>
          <span style="font-size: 12px; color: #6b7280; display: block;">Do not share this code with anyone.</span>
        </p>
      </div>
      
      <p class="message">If you did not request this OTP, please ignore this email.</p>
      
      <div class="divider"></div>

      <p class="message" style="margin-bottom: 0;">
        Best regards,<br>
        <strong>The Greencart Team</strong>
      </p>
    </div>
    <div class="footer">
      <p>This is an automated message, please do not reply.</p>
      <p style="margin-top: 10px;">&copy; ${new Date().getFullYear()} Greencart. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

export const orderCancellationEmail = (name, orderId, isSeller = false) => {
  const reason = isSeller 
    ? "Unfortunately, your order was cancelled by the seller."
    : "Your order has been successfully cancelled as requested.";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Cancelled - Greencart</title>
  <style>${emailStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header" style="background-color: #ef4444;">
      <h1>Order Cancelled</h1>
    </div>
    <div class="content">
      <p class="greeting">Hi ${name},</p>
      <p class="message">${reason}</p>
      
      <div class="alert-box warning">
        <p class="alert-detail"><strong>Order ID:</strong> #${orderId.slice(-6).toUpperCase()}</p>
        <p class="alert-detail"><strong>Status:</strong> Cancelled</p>
      </div>
      
      <p class="message">If you have paid online, the refund process will be initiated shortly and should reflect in your account within 5-7 business days.</p>

      <div class="button-container">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/products" class="button">Continue Shopping</a>
      </div>
      
      <div class="divider"></div>

      <p class="message" style="margin-bottom: 0;">
        We apologize for any inconvenience.<br>
        <strong>The Greencart Team</strong>
      </p>
    </div>
    <div class="footer">
      <p>Need help? Contact us at <a href="mailto:support@greencart.com" class="link-secondary">support@greencart.com</a></p>
      <p style="margin-top: 10px;">&copy; ${new Date().getFullYear()} Greencart. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

export const orderConfirmationEmail = (name, orderId, items, totalAmount, currency = "Rs.") => {
  const orderDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const itemsHtml = items.map(item => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 0; color: #374151;">
        <div style="font-weight: 600;">${item.name}</div>
        <div style="font-size: 13px; color: #6b7280;">Qty: ${item.quantity}</div>
      </td>
      <td style="padding: 12px 0; text-align: right; color: #374151;">
        ${currency} ${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - Greencart</title>
  <style>${emailStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Order Confirmed!</h1>
    </div>
    <div class="content">
      <p class="greeting">Hi ${name},</p>
      <p class="message">Thank you for your order! We're getting your fresh groceries ready.</p>
      
      <div class="alert-box">
        <p class="alert-detail"><strong>Order ID:</strong> #${orderId.slice(-6).toUpperCase()}</p>
        <p class="alert-detail"><strong>Date:</strong> ${orderDate}</p>
      </div>
      
      <h3 style="color: #111827; margin-top: 25px;">Order Summary</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
        <thead>
          <tr style="border-bottom: 2px solid #e5e7eb;">
            <th style="padding: 10px 0; text-align: left; color: #4b5563; font-size: 14px;">Item</th>
            <th style="padding: 10px 0; text-align: right; color: #4b5563; font-size: 14px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td style="padding-top: 15px; text-align: right; font-weight: 600; color: #374151;">Total:</td>
            <td style="padding-top: 15px; text-align: right; font-weight: 700; color: #10b981; font-size: 18px;">
              ${currency} ${totalAmount.toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>

      <div class="button-container">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/my-orders" class="button">View Order Details</a>
      </div>
      
      <div class="divider"></div>

      <p class="message" style="margin-bottom: 0;">
        We hope you enjoy your purchase!<br>
        <strong>The Greencart Team</strong>
      </p>
    </div>
    <div class="footer">
      <p>Need help? Contact us at <a href="mailto:support@greencart.com" class="link-secondary">support@greencart.com</a></p>
      <p style="margin-top: 10px;">&copy; ${new Date().getFullYear()} Greencart. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

export const orderDeliveredEmail = (name, orderId) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Delivered - Greencart</title>
  <style>${emailStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Order Delivered!</h1>
    </div>
    <div class="content">
      <p class="greeting">Hi ${name},</p>
      <p class="message">Your order has been successfully delivered! We hope you love your fresh groceries.</p>
      
      <div class="alert-box">
        <p class="alert-detail"><strong>Order ID:</strong> #${orderId.slice(-6).toUpperCase()}</p>
        <p class="alert-detail"><strong>Status:</strong> Delivered</p>
      </div>
      
      <p class="message">If you have any feedback or issues, please don't hesitate to contact us.</p>

      <div class="button-container">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/products" class="button">Rate Your Experience</a>
      </div>
      
      <div class="divider"></div>

      <p class="message" style="margin-bottom: 0;">
        Thank you for choosing Greencart!<br>
        <strong>The Greencart Team</strong>
      </p>
    </div>
    <div class="footer">
      <p>Need help? Contact us at <a href="mailto:support@greencart.com" class="link-secondary">support@greencart.com</a></p>
      <p style="margin-top: 10px;">&copy; ${new Date().getFullYear()} Greencart. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};


