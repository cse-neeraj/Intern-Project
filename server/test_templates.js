import { resetPasswordEmail, googleLoginEmail, verifyOtpEmail } from './utils/emailTemplates.js';

console.log("--- Reset Password Email ---");
console.log(resetPasswordEmail("https://example.com/reset", "John Doe").substring(0, 100) + "...");

console.log("\n--- Google Login Email ---");
console.log(googleLoginEmail("John Doe").substring(0, 100) + "...");

console.log("\n--- Verify OTP Email ---");
const otpEmail = verifyOtpEmail("123456", "John Doe");
console.log(otpEmail);

if (!otpEmail.includes("123456")) {
    throw new Error("OTP not found in email");
}
console.log("\n✅ OTP Email Verification Passed");
