const nodemailer = require('nodemailer');

// ── Environment Sanitization Helper ──────────────────────────────────────────
const cleanEnvVar = (val) => {
  if (!val) return '';
  let cleaned = val.trim();
  // Strip surrounding quotes if any (e.g. "smtp.gmail.com" -> smtp.gmail.com)
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned.trim();
};

const SMTP_HOST = cleanEnvVar(process.env.SMTP_HOST);
const SMTP_PORT = parseInt(cleanEnvVar(process.env.SMTP_PORT)) || 587;
const SMTP_USER = cleanEnvVar(process.env.SMTP_USER);
const SMTP_PASS = cleanEnvVar(process.env.SMTP_PASS);
const SMTP_FROM = cleanEnvVar(process.env.SMTP_FROM);
const SMTP_SECURE = cleanEnvVar(process.env.SMTP_SECURE) === 'true';

// ── Startup Diagnostics ──────────────────────────────────────────────────────
(async () => {
  console.log("\n=== SMTP CONFIGURATION DIAGNOSTICS ===");
  console.log("SMTP_HOST (raw):", process.env.SMTP_HOST ? `"${process.env.SMTP_HOST}"` : "(not set)");
  console.log("SMTP_HOST (cleaned):", SMTP_HOST ? `"${SMTP_HOST}"` : "(not set)");
  console.log("SMTP_PORT (raw):", process.env.SMTP_PORT ? `"${process.env.SMTP_PORT}"` : "(not set)");
  console.log("SMTP_PORT (cleaned):", SMTP_PORT);
  console.log("SMTP_USER (raw):", process.env.SMTP_USER ? `"${process.env.SMTP_USER}"` : "(not set)");
  console.log("SMTP_USER (cleaned):", SMTP_USER ? `"${SMTP_USER}"` : "(not set)");
  console.log("SMTP_PASS (raw):", process.env.SMTP_PASS ? `*set* (length: ${process.env.SMTP_PASS.length})` : "(not set)");
  console.log("SMTP_PASS (cleaned):", SMTP_PASS ? `*set* (length: ${SMTP_PASS.length})` : "(not set)");
  console.log("SMTP_FROM (raw):", process.env.SMTP_FROM ? `"${process.env.SMTP_FROM}"` : "(not set)");
  console.log("SMTP_FROM (cleaned):", SMTP_FROM ? `"${SMTP_FROM}"` : "(not set)");
  console.log("SMTP_SECURE (raw):", process.env.SMTP_SECURE ? `"${process.env.SMTP_SECURE}"` : "(not set)");
  console.log("SMTP_SECURE (cleaned):", SMTP_SECURE);

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    try {
      console.log("[SMTP Startup Check] Attempting transporter verification on startup...");
      const testTransporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_SECURE,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });
      await testTransporter.verify();
      console.log("[SMTP Startup Check] Connection Successful!");
    } catch (err) {
      console.error("[SMTP Startup Check] Connection Failed.");
      console.error("[SMTP Startup Check] Error Message:", err.message);
      console.error("[SMTP Startup Check] Full Error Stack:", err.stack);
    }
  } else {
    console.log("[SMTP Startup Check] Skipping transporter verification (SMTP not fully configured)");
  }
  console.log("======================================\n");
})();

// ── Create transporter ────────────────────────────────────────────────────────
const createTransporter = async () => {
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    console.log("[SMTP Transporter] Attempting connection to host:", SMTP_HOST);
    console.log("[SMTP Transporter] Using Port:", SMTP_PORT, "| Secure flag:", SMTP_SECURE);
    console.log("[SMTP Transporter] User:", SMTP_USER);
    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_SECURE,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });
      // verify connection configuration
      await transporter.verify();
      console.log("[SMTP Transporter] Connected successfully. Transporter ready.");
      return transporter;
    } catch (verifyErr) {
      console.error("[SMTP Transporter] Verification failed for", SMTP_HOST);
      console.error("[SMTP Transporter] Error Message:", verifyErr.message);
      console.error("[SMTP Transporter] Full Error Stack:", verifyErr.stack);
      throw verifyErr;
    }
  }

  // Development fallback: Ethereal fake SMTP
  console.log("[SMTP Transporter] Missing configuration, attempting Ethereal fallback");
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  console.log("[SMTP Transporter] Ethereal Transporter Created");
  return transporter;
};

// ── Password Reset Email Template ─────────────────────────────────────────────
const buildResetEmailHTML = (userName, resetUrl) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;background:#f5f3ff;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(107,78,255,0.12);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6B4EFF 0%,#4F46E5 100%);padding:36px 40px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:12px;">
                <div style="width:48px;height:48px;background:rgba(255,255,255,0.2);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;font-size:24px;">🎓</div>
              </div>
              <h1 style="color:#ffffff;font-size:26px;font-weight:800;margin:12px 0 0;letter-spacing:-0.5px;">Placement<span style="color:#c4b5fd;">Hub</span></h1>
              <p style="color:rgba(255,255,255,0.75);font-size:13px;margin:4px 0 0;">Campus Recruitment Management System</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 28px;">
              <h2 style="color:#1a1a2e;font-size:22px;font-weight:700;margin:0 0 8px;">Reset Your Password</h2>
              <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 24px;">
                Hi <strong style="color:#6B4EFF;">${userName}</strong>,<br/>
                We received a request to reset the password for your PlacementHub account.
                Click the button below to choose a new password.
              </p>

              <!-- CTA Button -->
              <div style="text-align:center;margin:32px 0;">
                <a href="${resetUrl}"
                   style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#6B4EFF,#4F46E5);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;border-radius:12px;letter-spacing:0.3px;box-shadow:0 6px 20px rgba(107,78,255,0.35);">
                  Reset Password
                </a>
              </div>

              <!-- Expiry notice -->
              <div style="background:#fef9ee;border:1px solid #fde68a;border-radius:10px;padding:14px 18px;margin:24px 0;">
                <p style="color:#92400e;font-size:13px;margin:0;line-height:1.5;">
                  ⏰ <strong>This link expires in 15 minutes.</strong> If you did not request a password reset,
                  you can safely ignore this email — your password will not change.
                </p>
              </div>

              <!-- Fallback URL -->
              <p style="color:#aaa;font-size:12px;line-height:1.6;margin:20px 0 0;">
                If the button does not work, paste this link into your browser:<br/>
                <a href="${resetUrl}" style="color:#6B4EFF;word-break:break-all;">${resetUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#fafafa;border-top:1px solid #ede9ff;padding:20px 40px;text-align:center;">
              <p style="color:#bbb;font-size:12px;margin:0;line-height:1.6;">
                © ${new Date().getFullYear()} PlacementHub · Campus Recruitment Management System<br/>
                This is an automated email — please do not reply.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ── Send reset email ──────────────────────────────────────────────────────────
const sendPasswordResetEmail = async ({ to, userName, resetUrl }) => {
  try {
    console.log("[SMTP Email Service] Preparing email...");
    const transporter = await createTransporter();

    const fromAddress = SMTP_FROM || `"PlacementHub" <${SMTP_USER || 'noreply@placementhub.app'}>`;
    console.log("[SMTP Email Service] Email From Header:", fromAddress);
    console.log("[SMTP Email Service] Email To Header:", to);
    console.log("[SMTP Email Service] Reset URL:", resetUrl);

    const mailOptions = {
      from: fromAddress,
      to,
      subject: 'Reset Your PlacementHub Password',
      html: buildResetEmailHTML(userName, resetUrl),
    };

    console.log("[SMTP Email Service] Dispatching sendMail() request...");
    const info = await transporter.sendMail(mailOptions);
    console.log("[SMTP Email Service] sendMail() Response Successful!");
    console.log("[SMTP Email Service] Message ID:", info.messageId);
    console.log("[SMTP Email Service] Response Envelope:", JSON.stringify(info.envelope));
    console.log("[SMTP Email Service] Delivery status: SUCCESS");

    if (!SMTP_HOST) {
      console.log(`\n📧 Ethereal message preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return info;
  } catch (error) {
    console.error("[SMTP Email Service] sendMail() failed.");
    console.error("[SMTP Email Service] Error Message:", error.message);
    console.error("[SMTP Email Service] Full Error Stack:", error.stack);
    console.error("[SMTP Email Service] Delivery status: FAILED");
    throw error;
  }
};

module.exports = { sendPasswordResetEmail };
