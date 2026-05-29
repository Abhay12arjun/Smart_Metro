const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: String,
    message: String,
    line: {
      type: String,
      enum: ["Green", "Yellow", "Purple"],
      required: true
    },
    train: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Train"
    },
    trainName: String,
    trainNo: String,
    status: {
      type: String,
      enum: ["Delayed", "Stopped", "Maintenance", "Running"],
      required: true
    },
    delayMinutes: {
      type: Number,
      default: 0
    },
    delayLabel: {
      type: String,
      default: ""
    },
    type: {
      type: String,
      enum: ["info", "warning", "success"],
      default: "info"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
