const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP credentials missing');
  }

  const info = await transporter.sendMail({
    from: `"The Artisan Crust" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  });
  console.log(`📧 Email sent to ${to}: ${info.messageId}`);
  return info;
};

const sendVerificationEmail = (to, token, name) => {
  const link = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  return sendEmail({
    to,
    subject: 'Verify your Artisan Crust account',
    text: `Hi ${name || 'there'},\n\nWelcome to The Artisan Crust! Please verify your email by clicking the link below:\n\n${link}`,
    html: `<h3>Hi ${name || 'there'},</h3>
           <p>Welcome to <b>The Artisan Crust</b>! Please verify your email by clicking the link below:</p>
           <a href="${link}" style="display:inline-block; background:#C84E29; color:white; padding:10px 20px; border-radius:5px; text-decoration:none;">Verify Email</a>
           <p style="font-size:12px; color:#666; margin-top:20px;">If the button doesn't work, copy and paste this link: <br/> ${link}</p>`,
  });
};

const sendResetEmail = (to, token) => {
  const link = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  return sendEmail({
    to,
    subject: 'Reset your Artisan Crust password',
    text: `Click the link below to reset your password. This link is valid for 1 hour:\n\n${link}`,
    html: `<h3>Reset your password</h3>
           <p>Click below to reset your password (valid for 1 hour):</p>
           <a href="${link}" style="display:inline-block; background:#C84E29; color:white; padding:10px 20px; border-radius:5px; text-decoration:none;">Reset Password</a>`,
  });
};

const sendLowStockAlert = (itemName, stock, threshold) => {
  return sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `⚠️ Low Stock Alert: ${itemName}`,
    text: `Low Stock Alert: ${itemName} stock has dropped to ${stock} units, below the threshold of ${threshold}. Please restock soon.`,
    html: `<p><b>${itemName}</b> stock has dropped to <b>${stock}</b> units,
           below the threshold of ${threshold}. Please restock soon.</p>`,
  });
};

module.exports = { sendEmail, sendVerificationEmail, sendResetEmail, sendLowStockAlert };
