const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const sendEmail = require("../config/email");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
};

const sendAuthResponse = (res, message, user) => {
  const safeUser = user.toObject ? user.toObject() : { ...user };
  delete safeUser.password;

  res.json({
    message,
    token: generateToken(safeUser._id),
    user: safeUser
  });
};

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: "passenger",
      authProvider: "local"
    });

    res.status(201);
    sendAuthResponse(res, "User registered successfully", user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(403).json({ message: "Use the admin login page" });
    }

    if (user.authProvider !== "local" || !user.password) {
      return res.status(400).json({ message: "Please login with Google" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    sendAuthResponse(res, "Login successful", user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    if (!user.password) {
      return res.status(400).json({ message: "Admin password is not configured" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    sendAuthResponse(res, "Admin login successful", user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.forgotPassengerPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: "Passenger user not found with this email." });
    }

    if (user.role !== "passenger") {
      return res.status(403).json({ message: "Password reset is available only for passenger users." });
    }

    if (user.authProvider === "google") {
      return res.status(400).json({
        message: "This account uses Google login. Please login with Google."
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    // Build reset URL
    const frontendUrl =
      process.env.FRONTEND_URL ||
      process.env.CLIENT_URL ||
      `${req.protocol}://${req.get("host")}`;
    const resetLink = `${frontendUrl.replace(/\/$/, "")}/#/reset-password/${resetToken}`;

    // Send email. If delivery fails, clear the token so stale links cannot be used.
    try {
      const emailResult = await sendEmail({
        to: user.email,
        subject: "Smart Metro - Password Reset Request",
        html: `
          <h2>Password Reset Request</h2>
          <p>Hi ${user.name},</p>
          <p>You requested a password reset for your Smart Metro account.</p>
          <p>Click the link below to reset your password (valid for 15 minutes):</p>
          <p><a href="${resetLink}" style="background-color: #1f2937; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
          <p>Or copy this link: ${resetLink}</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Regards,<br>Smart Metro Team</p>
        `,
        text: `Password Reset Request\n\nClick the link to reset your password (valid for 15 minutes): ${resetLink}`
      });

      if (!emailResult?.success) {
        user.resetToken = undefined;
        user.resetTokenExpires = undefined;
        await user.save();

        return res.status(500).json({
          message: "Email service is not configured. Password reset email was not sent."
        });
      }

      console.log(`✓ Password reset email sent to ${user.email}`);
    } catch (emailError) {
      user.resetToken = undefined;
      user.resetTokenExpires = undefined;
      await user.save();

      console.warn(`Email failed for ${user.email}: ${emailError.message}`);
      return res.status(500).json({
        message: "Failed to send password reset email. Please check SMTP settings."
      });
      console.warn(`⚠️ Email failed for ${user.email}: ${emailError.message}`);
      console.warn(`Reset link: ${resetLink}`);
      // Don't fail the request if email service is unavailable
    }

    res.json({
      message: "Password reset email sent successfully. Please check your email."
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.resetPassengerPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const { token } = req.params;

    if (!password || !confirmPassword) {
      return res.status(400).json({ message: "Password and confirmation are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Find user with valid reset token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpires: { $gt: new Date() },
      role: "passenger"
    });

    if (!user) {
      return res.status(400).json({
        message: "Password reset link is invalid or has expired. Please request a new one."
      });
    }

    // Update password
    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    console.log(`✓ Password reset successfully for ${user.email}`);

    res.json({
      message: "Password reset successfully. You can now login with your new password."
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: "Google login is not configured" });
    }

    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    if (!payload?.email || !payload.email_verified) {
      return res.status(400).json({ message: "Google account email not found" });
    }

    const normalizedEmail = payload.email.trim().toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });

    if (user?.role === "admin") {
      return res.status(403).json({ message: "Admins must use the admin login page" });
    }

    if (user?.googleId && user.googleId !== payload.sub) {
      return res.status(409).json({ message: "This email is already linked to another Google account" });
    }

    if (!user) {
      user = await User.create({
        name: payload.name || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        googleId: payload.sub,
        role: "passenger",
        authProvider: "google"
      });
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      await user.save();
    }

    sendAuthResponse(res, "Google login successful", user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
