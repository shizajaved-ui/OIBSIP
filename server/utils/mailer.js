
// Sends transactional email via Resend's HTTPS API instead of raw SMTP.
//
// Why: nodemailer + Gmail SMTP requires an outbound connection on port
// 465/587, which many hosts block entirely — the connection just hangs
// until it times out, with no way to "fix" that from the code side. Resend
// sends over normal HTTPS (the same protocol as any other API call), so
// it isn't affected by that kind of port blocking.
const RESEND_API_URL = 'https://api.resend.com/emails';

// Sandbox default until a custom domain is verified in the Resend
// dashboard — at that point this can become e.g. "Ferno <hello@yourdomain.com>".
const FROM_ADDRESS = 'Ferno <onboarding@resend.dev>';

const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.RESEND_API_KEY) {
    const msg = 'RESEND_API_KEY missing from .env';
    console.error(`❌ EMAIL ERROR: ${msg}`);
    throw new Error(msg);
  }

  const res = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_ADDRESS, to, subject, html, text }),
  });

  const data = await res.json();

  if (!res.ok) {
    // Resend's error payloads are readable on their own (e.g. "You can
    // only send testing emails to your own email address" in sandbox
    // mode) — surface that directly instead of a generic message.
    const msg = data?.message || `Resend API error (status ${res.status})`;
    console.error(`❌ EMAIL ERROR to ${to}: ${msg}`);
    throw new Error(msg);
  }

  console.log(`📧 Email sent to ${to}: ${data.id}`);
  return data;
};

const emailShell = (bodyHtml) => `
  <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #2F1F17;">
    ${bodyHtml}
    <p style="margin-top: 32px; font-size: 12px; color: #8A7566;">
      The Artisan Crust · If you didn't request this, you can safely ignore this email.
    </p>
  </div>
`;

const sendVerificationEmail = (to, token, name = '') => {
  const link = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  return sendEmail({
    to,
    subject: 'Verify your Artisan Crust account',
    html: emailShell(`
      <p>Hi${name ? ` ${name}` : ''},</p>
      <p>Thanks for signing up. Please confirm your email address to activate your account:</p>
      <p><a href="${link}" style="color:#C84E29;">Verify my email</a></p>
      <p>Or paste this link into your browser:<br>${link}</p>
    `),
    text: `Hi${name ? ` ${name}` : ''}, please verify your email by visiting: ${link}`,
  });
};

const sendResetEmail = (to, token) => {
  const link = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  return sendEmail({
    to,
    subject: 'Reset your Artisan Crust password',
    html: emailShell(`
      <p>We received a request to reset your password. This link is valid for 1 hour:</p>
      <p><a href="${link}" style="color:#C84E29;">Reset my password</a></p>
      <p>Or paste this link into your browser:<br>${link}</p>
    `),
    text: `Reset your password (valid 1 hour): ${link}`,
  });
};

const sendLowStockAlert = (itemName, stock, threshold) => {
  return sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `⚠️ Low Stock Alert: ${itemName}`,
    html: emailShell(`
      <p><b>${itemName}</b> stock has dropped to <b>${stock}</b> units,
      below the threshold of ${threshold}. Please restock soon.</p>
    `),
    text: `${itemName} stock is at ${stock}, below threshold ${threshold}.`,
  });
};

module.exports = { sendEmail, sendVerificationEmail, sendResetEmail, sendLowStockAlert };