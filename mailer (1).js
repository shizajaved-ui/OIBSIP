const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Without these, a blocked or unreachable SMTP connection (common on
  // sandboxed/free-tier hosts that block outbound port 465/587) just hangs
  // instead of failing — which hangs the whole request, which hangs the
  // frontend button waiting on it. Fail loud and fast instead.
  connectionTimeout: 10_000, // time to establish the TCP connection
  greetingTimeout: 10_000, // time to receive the SMTP server's greeting
  socketTimeout: 15_000, // time for the overall send to complete
});

const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    const msg = 'SMTP credentials missing (SMTP_USER / SMTP_PASS not set in .env)';
    console.error(`❌ EMAIL ERROR: ${msg}`);
    throw new Error(msg);
  }

  const info = await transporter.sendMail({
    from: `"The Artisan Crust" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    // A plain-text part alongside the HTML significantly reduces the odds
    // of landing in spam — an HTML-only email with a single link and no
    // text alternative is a strong spam signal on its own.
    text,
  });
  console.log(`📧 Email sent to ${to}: ${info.messageId}`);
  return info;
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
