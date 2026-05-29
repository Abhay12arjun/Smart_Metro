const mongoose = require("mongoose");

const trainSchema = new mongoose.Schema(
  {
    trainNo: {
      type: String,
      required: true,
      unique: true
    },

    trainName: {
      type: String,
      required: true
    },

    line: {
      type: String,
      required: true,
      enum: ["Purple", "Green", "Yellow"]
    },

    direction: {
      type: String,
      required: true
    },

    startStation: {
      type: String,
      required: true
    },

    endStation: {
      type: String,
      required: true
    },

    distance: {
      type: Number,
      required: true
    },

    currentStation: {
      type: String,
      default: "Not Started"
    },

    status: {
      type: String,
      enum: ["Running", "Stopped", "Delayed", "Maintenance"],
      default: "Running"
    },

    delayMinutes: {
      type: Number,
      default: 0,
      min: 0
    },

    arrivalTime: {
      type: String
    },

    departureTime: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Train", trainSchema);
