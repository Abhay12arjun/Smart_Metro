const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const connectDB = require("../config/db");
const User = require("../models/User");

dotenv.config({ path: path.join(__dirname, "..", ".env"), quiet: true });

const ADMIN_NAME = "Admin";
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin123";

const registerAdmin = async () => {
  const email = ADMIN_EMAIL.trim().toLowerCase();

  if (!email || !ADMIN_PASSWORD) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required.");
  }

  const connected = await connectDB();

  if (!connected) {
    throw new Error("MongoDB is not connected. Fix MONGO_URI or Atlas Network Access, then run again.");
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const existingAdmin = await User.findOne({ email });

  if (existingAdmin) {
    existingAdmin.name = existingAdmin.name || ADMIN_NAME;
    existingAdmin.password = hashedPassword;
    existingAdmin.role = "admin";
    existingAdmin.authProvider = "local";
    existingAdmin.googleId = undefined;
    await existingAdmin.save();

    console.log(`Admin updated successfully: ${email}`);
    return;
  }

  await User.create({
    name: ADMIN_NAME,
    email,
    password: hashedPassword,
    role: "admin",
    authProvider: "local"
  });

  console.log(`Admin registered successfully: ${email}`);
};

registerAdmin()
  .catch((error) => {
    console.error("Admin registration failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
