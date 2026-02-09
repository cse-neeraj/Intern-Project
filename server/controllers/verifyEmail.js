import { sendEmail } from "./utils/email.js";
import "dotenv/config";

const verifyEmailConfig = async () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  console.log("--- Email Configuration Check ---");
  console.log(`EMAIL_USER: ${emailUser ? emailUser : "Missing ❌"}`);
  console.log(`EMAIL_PASS: ${emailPass ? "Loaded (Hidden)" : "Missing ❌"}`);
  console.log(`EMAIL_SERVICE: ${process.env.EMAIL_SERVICE || "Default (Gmail)"}`);

  if (!emailUser || !emailPass) {
    console.error("\nError: Email credentials missing in .env file.");
    return;
  }

  console.log("\nAttempting to send test email...");

  try {
    const result = await sendEmail({
      to: emailUser, // Send to self
      subject: "BuyFresh Email Configuration Test",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #22c55e;">Test Successful! ✅</h2>
          <p>Your Nodemailer configuration is working correctly.</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `,
      text: "Test Successful! Your Nodemailer configuration is working correctly."
    });

    if (result) {
      console.log("\n--- Email Sent Successfully ✅ ---");
      console.log(`Check inbox for ${emailUser}`);
    }
  } catch (error) {
    console.log("\n--- Email Sending Failed ❌ ---");
  }
};

verifyEmailConfig();
