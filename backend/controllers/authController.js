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
    const normalizedEmail = req.body.email?.trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user || user.role !== "passenger") {
      return res.json({
        message: "If a passenger account exists, a password reset link has been sent."
      });
    }

    if (user.authProvider !== "local") {
      return res.status(400).json({ message: "This account uses Google login." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl.replace(/\/$/, "")}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Smart Metro Password Reset",
      text: `Reset your Smart Metro passenger password using this link: ${resetUrl}\n\nThis link expires in 15 minutes.`,
      html: `
        <p>Reset your Smart Metro passenger password using this link:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link expires in 15 minutes.</p>
      `
    });

    res.json({
      message: "If a passenger account exists, a password reset link has been sent."
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassengerPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
      role: "passenger"
    });

    if (!user) {
      return res.status(400).json({ message: "Password reset link is invalid or expired" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.authProvider = "local";
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfully. Please login with your new password." });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
