const axios = require('axios');

// Sends transactional email via Courier's HTTPS API.
// This uses your connected Gmail account as a bridge.
const COURIER_API_URL = 'https://api.courier.com/send';

const sendEmail = async ({ to, subject, body }) => {
  const authToken = process.env.COURIER_AUTH_TOKEN;

  if (!authToken) {
    console.error('❌ EMAIL ERROR: COURIER_AUTH_TOKEN is missing in Railway variables.');
    return;
  }

  try {
    const { data } = await axios.post(
      COURIER_API_URL,
      {
        message: {
          to: { email: to },
          content: {
            title: subject,
            body: body
          },
          routing: { method: "single", channels: ["email"] }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(`📧 Email success via Courier to ${to}: ${data.requestId}`);
    return data;
  } catch (err) {
    const detail = err.response?.data?.message || err.message;
    console.error(`❌ Courier API Error to ${to}:`, detail);
    throw new Error(detail);
  }
};

const sendVerificationEmail = (to, token, name = '') => {
  const link = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  return sendEmail({
    to,
    subject: '🍕 Verify your Artisan Crust account',
    body: `
# Welcome, ${name || 'Pizza Lover'}!

Thanks for joining **The Artisan Crust**. We're excited to have you!

Please verify your email address to start building your perfect pizza:

[Verify My Email Address](${link})

***
*If the button doesn't work, copy and paste this link into your browser:*
${link}
    `
  });
};

const sendResetEmail = (to, token) => {
  const link = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  return sendEmail({
    to,
    subject: '🔑 Reset your Artisan Crust password',
    body: `
# Password Reset Request

We received a request to reset the password for your **Artisan Crust** account.

Click the link below to set a new password:

[Reset My Password](${link})

*This link is valid for 1 hour. If you didn't request this, you can safely ignore this email.*
    `
  });
};

const sendLowStockAlert = (itemName, stock, threshold) => {
  return sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `⚠️ Low Stock Alert: ${itemName}`,
    body: `
# ⚠️ Inventory Alert

The stock for **${itemName}** has dropped to **${stock}** units.

This is below your set threshold of **${threshold}**. Please restock this item soon to keep the oven running!
    `
  });
};

module.exports = { sendEmail, sendVerificationEmail, sendResetEmail, sendLowStockAlert };
