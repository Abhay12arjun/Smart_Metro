const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    const smtpHost = process.env.SMTP_HOST?.trim();
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpUser = process.env.SMTP_USER?.trim();
    const smtpPass = process.env.SMTP_PASS?.replace(/\s+/g, "");
    const smtpFrom = process.env.SMTP_FROM?.trim() || smtpUser;

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
      console.warn("SMTP not configured. Email would be sent to:", options.to);
      console.warn("Subject:", options.subject);
      return {
        success: false,
        message: "SMTP not configured - token created but email not sent"
      };
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: smtpUser,
        pass: smtpPass
      },
      tls: {
        servername: smtpHost
      }
    });

    const info = await transporter.sendMail({
      from: smtpFrom,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    });

    console.log("Email sent:", info.messageId, "to:", options.to);

    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error("Email error:", error.message);
    if (error.code === "EAUTH") {
      error.message = "SMTP authentication failed. Check SMTP_USER and SMTP_PASS in backend environment variables.";
    }
    throw error;
  }
};

module.exports = sendEmail;
