const nodemailer = require("nodemailer");

const hasSmtpConfig = () =>
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS;

const sendEmail = async ({ to, subject, text, html }) => {
  if (!hasSmtpConfig()) {
    console.warn("SMTP is not configured. Email content for local testing:");
    console.warn(`To: ${to}`);
    console.warn(`Subject: ${subject}`);
    console.warn(text);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html
  });
};

module.exports = sendEmail;
