const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    passenger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    train: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Train"
    },

    line: {
      type: String,
      required: true
    },

    lineColor: {
      type: String
    },

    source: {
      type: String,
      required: true
    },

    destination: {
      type: String,
      required: true
    },

    fare: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ["Booked", "Cancelled", "Completed"],
      default: "Booked"
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Refunded"],
      default: "Pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);