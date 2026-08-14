const axios = require('axios');

// Sends transactional email via Brevo's HTTPS API.
// This is the most reliable way to send emails on cloud hosts like Railway.
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const sendEmail = async ({ to, subject, html, text }) => {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.error('❌ EMAIL ERROR: BREVO_API_KEY is missing in Railway variables.');
    return;
  }

  try {
    const { data } = await axios.post(
      BREVO_API_URL,
      {
        sender: {
            name: "The Artisan Crust",
            email: process.env.SMTP_USER // Use your verified Brevo sender email
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html,
        textContent: text,
      },
      {
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      }
    );
    console.log(`📧 Email success to ${to}: ${data.messageId}`);
    return data;
  } catch (err) {
    const errorDetail = err.response?.data?.message || err.message;
    console.error(`❌ Brevo API Error to ${to}:`, errorDetail);

    if (err.response?.status === 401) {
      console.error('💡 TIP: Your BREVO_API_KEY is likely invalid or inactive.');
    }
  }
};

const emailShell = (bodyHtml) => `
  <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #2F1F17; border: 1px solid #eee; padding: 40px; border-radius: 24px; background: #FFFBF9;">
    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #C84E29; margin: 0;">The Artisan Crust</h1>
    </div>
    ${bodyHtml}
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #8A7566; text-align: center;">
      © 2026 The Artisan Crust Pizza · Stone-fired & Built by You
    </div>
  </div>
`;

const sendVerificationEmail = (to, token, name = '') => {
  const link = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  return sendEmail({
    to,
    subject: '🍕 Verify your Artisan Crust account',
    html: emailShell(`
      <h2 style="font-size: 20px;">Welcome, ${name || 'Pizza Lover'}!</h2>
      <p>Thanks for joining us. Please verify your email to start building your perfect pizza:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${link}" style="background-color: #C84E29; color: white; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: bold; display: inline-block;">Verify My Email</a>
      </div>
      <p style="font-size: 12px; color: #8A7566;">Or copy this link: <br> ${link}</p>
    `),
    text: `Hi ${name}, please verify your account at: ${link}`,
  });
};

const sendResetEmail = (to, token) => {
  const link = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  return sendEmail({
    to,
    subject: '🔑 Reset your Artisan Crust password',
    html: emailShell(`
      <h2 style="font-size: 20px;">Password Reset Request</h2>
      <p>We received a request to reset your password. If you didn't do this, you can ignore this email.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${link}" style="background-color: #2F1F17; color: white; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: bold; display: inline-block;">Reset Password</a>
      </div>
      <p style="color: #8A7566; font-size: 13px;">This link is valid for 1 hour.</p>
    `),
    text: `Reset your password here: ${link}`,
  });
};

const sendLowStockAlert = (itemName, stock, threshold) => {
  return sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `⚠️ Low Stock Alert: ${itemName}`,
    html: emailShell(`
      <h2 style="color: #D66B45;">Inventory Alert</h2>
      <p><b>${itemName}</b> stock has dropped to <span style="color: #C84E29; font-weight: bold;">${stock}</span> units.</p>
      <p>This is below your threshold of ${threshold}. Please restock soon.</p>
    `),
    text: `Low stock alert: ${itemName} is at ${stock}.`,
  });
};

module.exports = { sendEmail, sendVerificationEmail, sendResetEmail, sendLowStockAlert };
