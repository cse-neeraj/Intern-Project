import twilio from "twilio";
import "dotenv/config";

const verifyTwilio = async () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

  console.log("--- Twilio Configuration Check ---");
  console.log(`TWILIO_ACCOUNT_SID: ${accountSid ? "Loaded (" + accountSid.substring(0, 6) + "...)" : "Missing ❌"}`);
  console.log(`TWILIO_AUTH_TOKEN: ${authToken ? "Loaded (Hidden)" : "Missing ❌"}`);
  console.log(`TWILIO_PHONE_NUMBER: ${twilioPhoneNumber ? "Loaded (" + twilioPhoneNumber + ")" : "Missing ❌"}`);

  if (!accountSid || !authToken) {
    console.error("\nError: Credentials missing in .env file.");
    return;
  }

  if (twilioPhoneNumber && !twilioPhoneNumber.startsWith('+')) {
    console.warn("\n⚠️ Warning: TWILIO_PHONE_NUMBER should usually start with '+' (E.164 format).");
  }

  try {
    const client = twilio(accountSid, authToken);
    // Fetch account details to verify credentials
    const account = await client.api.v2010.accounts(accountSid).fetch();
    
    console.log("\n--- Authentication Successful ✅ ---");
    console.log(`Account Name: ${account.friendlyName}`);
    console.log(`Account Status: ${account.status}`);
    console.log(`Account Type: ${account.type}`);
    
  } catch (error) {
    console.error("\n--- Authentication Failed ❌ ---");
    console.error(`Error Code: ${error.code}`);
    console.error(`Message: ${error.message}`);
  }
};

verifyTwilio();