const nodemailer = require("nodemailer");

const hasSmtpConfig = () =>
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS;

const sendEmail = async ({ to, subject, text, html }) => {
  let transporter;
  let usingTestAccount = false;

  if (hasSmtpConfig()) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== "false"
      }
    });
  } else {
    usingTestAccount = true;
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    console.warn("SMTP is not configured. Using Ethereal test account for local email preview.");
    console.warn(`Ethereal user: ${testAccount.user}`);
    console.warn(`Ethereal pass: ${testAccount.pass}`);
  }

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@smartmetro.local",
    to,
    subject,
    text,
    html
  });

  if (usingTestAccount) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.warn("Password reset email preview URL:", previewUrl);
  }
};

module.exports = sendEmail;
