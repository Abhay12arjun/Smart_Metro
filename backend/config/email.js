const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    // Check if SMTP is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("⚠️  SMTP not configured. Skipping email to:", options.to);
      return {
        success: false,
        message: "SMTP not configured"
      };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✓ Email sent:", info.messageId, "to:", options.to);

    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error("❌ Email error:", error.message);
    throw error;
  }
};

module.exports = sendEmail;
