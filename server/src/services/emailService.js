const nodemailer = require('nodemailer');

// ── Startup Diagnostics ──────────────────────────────────────────────────────
(async () => {
  console.log("\n=== SMTP CONFIGURATION DIAGNOSTICS ===");
  console.log("SMTP_HOST:", process.env.SMTP_HOST ? `"${process.env.SMTP_HOST}"` : "(not set)");
  console.log("SMTP_PORT:", process.env.SMTP_PORT ? `"${process.env.SMTP_PORT}"` : "(not set)");
  console.log("SMTP_USER:", process.env.SMTP_USER ? `"${process.env.SMTP_USER}"` : "(not set)");
  console.log("SMTP_PASS:", process.env.SMTP_PASS ? `*set* (length: ${process.env.SMTP_PASS.length})` : "(not set)");
  console.log("SMTP_FROM:", process.env.SMTP_FROM ? `"${process.env.SMTP_FROM}"` : "(not set)");
  console.log("SMTP_SECURE:", process.env.SMTP_SECURE ? `"${process.env.SMTP_SECURE}"` : "(not set)");

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      console.log("Attempting transporter verification on startup...");
      const testTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      await testTransporter.verify();
      console.log("SMTP Connection Successful");
    } catch (err) {
      console.error("SMTP Connection Failed:", err.message);
    }
  } else {
    console.log("Skipping transporter verification (SMTP not fully configured)");
  }
  console.log("======================================\n");
})();

// ── Create transporter ────────────────────────────────────────────────────────
// Uses SMTP credentials from .env.
// For development without real SMTP, falls back to Ethereal (fake SMTP) automatically.
const createTransporter = async () => {
  // If real SMTP is configured, use it
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log("SMTP Connection Status: Attempting connection to", process.env.SMTP_HOST);
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      // verify connection configuration
      await transporter.verify();
      console.log("SMTP Connection Status: Connected Successfully");
      return transporter;
    } catch (verifyErr) {
      console.error("SMTP Connection Status: Failed to connect to", process.env.SMTP_HOST, "-", verifyErr.message);
      throw verifyErr;
    }
  }

  // Development fallback: Ethereal fake SMTP — logs email to console
  console.log("SMTP Connection Status: Missing configuration, attempting Ethereal fallback");
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
  console.log("SMTP Connection Status: Ethereal Transporter Created");
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
    console.log("Preparing email");
    const transporter = await createTransporter();

    const fromAddress = process.env.SMTP_FROM || `"PlacementHub" <${process.env.SMTP_USER || 'noreply@placementhub.app'}>`;
    console.log("Email From Header:", fromAddress);

    const mailOptions = {
      from: fromAddress,
      to,
      subject: 'Reset Your PlacementHub Password',
      html: buildResetEmailHTML(userName, resetUrl),
    };

    console.log("Sending email");
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");

    // In development, log the Ethereal preview URL so the email can be inspected
    if (!process.env.SMTP_HOST) {
      console.log(`\n📧 Password reset email preview: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return info;
  } catch (error) {
    console.error("Email send failed:", error);
    throw error;
  }
};

module.exports = { sendPasswordResetEmail };
