const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"The Artisan Crust" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    // Don't crash the request if email fails — log and move on
    console.error('Email send failed:', err.message);
  }
};

const sendVerificationEmail = (to, token) => {
  const link = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  return sendEmail({
    to,
    subject: 'Verify your Artisan Crust account',
    html: `<p>Welcome! Click below to verify your email:</p>
           <a href="${link}">${link}</a>`,
  });
};

const sendResetEmail = (to, token) => {
  const link = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  return sendEmail({
    to,
    subject: 'Reset your Artisan Crust password',
    html: `<p>Click below to reset your password (valid for 1 hour):</p>
           <a href="${link}">${link}</a>`,
  });
};

const sendLowStockAlert = (itemName, stock, threshold) => {
  return sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `⚠️ Low Stock Alert: ${itemName}`,
    html: `<p><b>${itemName}</b> stock has dropped to <b>${stock}</b> units,
           below the threshold of ${threshold}. Please restock soon.</p>`,
  });
};

module.exports = { sendEmail, sendVerificationEmail, sendResetEmail, sendLowStockAlert };
