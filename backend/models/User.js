const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: function () {
        return this.authProvider === "local";
      }
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local"
    },

    role: {
      type: String,
      enum: ["passenger", "admin"],
      default: "passenger"
    },

    walletBalance: {
      type: Number,
      default: 0
    },

    passwordResetToken: {
      type: String
    },

    passwordResetExpires: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
