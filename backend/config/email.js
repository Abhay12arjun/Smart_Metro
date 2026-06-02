const nodemailer = require("nodemailer");

const isProduction = process.env.NODE_ENV === "production";

const hasSmtpConfig = () =>
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS;

const sendEmail = async ({ to, subject, text, html }) => {
  if (!hasSmtpConfig()) {
    console.warn("⚠️ SMTP not configured. Env check:");
    console.warn(`  SMTP_HOST: ${process.env.SMTP_HOST ? "✓" : "✗ missing"}`);
    console.warn(`  SMTP_PORT: ${process.env.SMTP_PORT ? "✓" : "✗ missing"}`);
    console.warn(`  SMTP_USER: ${process.env.SMTP_USER ? "✓" : "✗ missing"}`);
    console.warn(`  SMTP_PASS: ${process.env.SMTP_PASS ? "✓" : "✗ missing"}`);

    if (isProduction) {
      console.error("❌ Production mode detected but SMTP is not configured");
      throw new Error(
        "Email service is not available. Please configure SMTP in backend environment."
      );
    }

    // Local dev: use Ethereal test account
    console.warn("Using Ethereal test account for local development...");
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    const info = await transporter.sendMail({
      from: "Smart Metro <no-reply@smartmetro.local>",
      to,
      subject,
      text,
      html
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log("📧 Email preview (local dev):", previewUrl);
    return;
  }

  const transporter = nodemailer.createTransport({
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

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html
    });
    console.log("✓ Email sent successfully:", info.messageId);
  } catch (smtpError) {
    console.error("❌ SMTP send error:", smtpError.message);
    throw smtpError;
  }
};

module.exports = sendEmail;
