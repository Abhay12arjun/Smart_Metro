const mongoose = require("mongoose");

const stationSchema = new mongoose.Schema(
  {
    stationName: {
      type: String,
      required: true
    },

    stationCode: {
      type: String,
      required: true,
      unique: true
    },

    city: {
      type: String,
      required: true
    },

    line: {
      type: String,
      required: true
    },

    lineColor: {
      type: String,
      required: true
    },

    sequence: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Station", stationSchema);