import { Resend } from "resend";
import { RESEND } from "../config/config.js";

/**
 * Generates a beautiful, responsive HTML email body with matching branding.
 */
const getOtpTemplate = (otp, username) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Rynqor Password Reset</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }
          .container { max-width: 500px; margin: 40px auto; background: #ffffff; padding: 32px; border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e5e7eb; }
          .header { text-align: center; margin-bottom: 24px; }
          .logo { font-size: 28px; font-weight: 800; color: #6366f1; letter-spacing: -0.5px; }
          .greeting { font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 12px; }
          .instruction { font-size: 14px; color: #4b5563; line-height: 1.5; margin-bottom: 24px; }
          .otp-container { background: #f5f3ff; border: 1px solid #e0e7ff; border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 24px; }
          .otp-code { font-size: 32px; font-weight: 800; color: #6366f1; letter-spacing: 6px; font-family: monospace; }
          .expiry { font-size: 12px; color: #9ca3af; text-align: center; margin-top: 8px; }
          .footer { font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #f3f4f6; padding-top: 24px; margin-top: 24px; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Rynqor</div>
          </div>
          <div class="greeting">Hi ${username},</div>
          <div class="instruction">
            We received a request to reset your password. Use the verification code below to proceed with changing your password:
          </div>
          <div class="otp-container">
            <div class="otp-code">${otp}</div>
            <div class="expiry">Expires in 10 minutes</div>
          </div>
          <div class="instruction">
            If you did not request a password reset, please ignore this email or contact support if you have concerns.
          </div>
          <div class="footer">
            This is an automated security message from Rynqor Chat App.<br>
            Please do not reply directly to this email.
          </div>
        </div>
      </body>
    </html>
  `;
};

// Module-level cached Resend instance
let resendClient = null;

/**
 * Lazily configures and caches the Resend SDK client instance.
 * Bypasses SMTP connection overhead and executes sending over fast HTTP REST calls.
 */
const getResendClient = () => {
  if (resendClient) return resendClient;

  const apiKey = RESEND.apiKey;
  if (!apiKey) return null;

  resendClient = new Resend(apiKey);
  return resendClient;
};

/**
 * Sends an email using the Resend HTTP API.
 * Degrades gracefully back to terminal console logs if RESEND_API_KEY is missing in .env.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const resend = getResendClient();
  const fromAddress = RESEND.from;

  if (!resend) {
    console.log("\n-----------------------------------------");
    console.log("✉️ EMAIL LOG FALLBACK (RESEND_API_KEY not configured in .env)");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${text}`);
    console.log("-----------------------------------------\n");
    return;
  }

  try {
    await resend.emails.send({
      from: fromAddress,
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error("❌ Resend API transmission failed:", error.message);
    throw error;
  }
};

export { sendEmail, getOtpTemplate };
