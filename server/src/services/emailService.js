const nodemailer = require('nodemailer');
const https = require('https');

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

const RESEND_API_KEY = cleanEnvVar(process.env.RESEND_API_KEY);
const SMTP_FROM = cleanEnvVar(process.env.SMTP_FROM) || 'onboarding@resend.dev';

// ── Startup Diagnostics ──────────────────────────────────────────────────────
(() => {
  console.log("\n=== EMAIL SERVICE CONFIGURATION ===");
  console.log("RESEND_API_KEY:", RESEND_API_KEY ? `*set* (length: ${RESEND_API_KEY.length})` : "(not set - will fallback to Ethereal for local dev)");
  console.log("SMTP_FROM (Sender):", SMTP_FROM);
  console.log("===================================\n");
})();

// ── Resend API Sender ────────────────────────────────────────────────────────
const sendViaResend = (apiKey, from, to, subject, html) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      from: from || 'onboarding@resend.dev',
      to: [to],
      subject,
      html
    });

    const options = {
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(data),
      },
    };

    console.log("[Resend API] Dispatching email request to https://api.resend.com/emails...");
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve({ success: true, rawBody: body });
          }
        } else {
          reject(new Error(`Resend API Error: Status ${res.statusCode} - ${body}`));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(data);
    req.end();
  });
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
  const subject = 'Reset Your PlacementHub Password';
  const html = buildResetEmailHTML(userName, resetUrl);
  
  // Format the from address nicely
  const fromAddress = SMTP_FROM.includes('<') ? SMTP_FROM : `"PlacementHub" <${SMTP_FROM}>`;

  try {
    console.log("[Email Service] Preparing password reset email...");
    console.log("[Email Service] To Header:", to);
    console.log("[Email Service] From Header:", fromAddress);

    // Primary driver: Resend HTTPS API (to bypass SMTP blocks)
    if (RESEND_API_KEY) {
      console.log("[Email Service] Routing via Resend HTTPS API...");
      // Resend sandbox testing limit: must send from onboarding@resend.dev unless domain is verified
      const cleanFrom = fromAddress.includes('gmail.com') ? '"PlacementHub" <onboarding@resend.dev>' : fromAddress;
      const response = await sendViaResend(RESEND_API_KEY, cleanFrom, to, subject, html);
      console.log("[Email Service] Resend API Success Response:", JSON.stringify(response));
      return response;
    }

    // Development Fallback: Ethereal SMTP
    console.log("[Email Service] RESEND_API_KEY not configured. Falling back to Ethereal SMTP for local dev...");
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

    const info = await transporter.sendMail({
      from: `"PlacementHub" <noreply@placementhub.app>`,
      to,
      subject,
      html
    });
    
    console.log("[Email Service] Ethereal fallback successfully dispatched email. Message ID:", info.messageId);
    console.log(`📧 Ethereal message preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    return info;
  } catch (error) {
    console.error("[Email Service] sendPasswordResetEmail failed.");
    console.error("[Email Service] Error Message:", error.message);
    console.error("[Email Service] Full Error Stack:", error.stack);
    throw error;
  }
};

module.exports = { sendPasswordResetEmail };
