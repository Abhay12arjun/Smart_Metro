const Station = require("../models/Station");
const { ensureStationsSeeded } = require("../data/stationSeed");

exports.getLineOverview = async (req, res) => {
  try {
    await ensureStationsSeeded();

    const lines = await Station.aggregate([
      {
        $group: {
          _id: "$line",
          lineColor: { $first: "$lineColor" },
          stationCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const formatted = lines.map((line) => ({
      line: line._id,
      displayName: line._id.charAt(0).toUpperCase() + line._id.slice(1),
      lineColor: line.lineColor,
      stationCount: line.stationCount
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStationsByLine = async (req, res) => {
  try {
    await ensureStationsSeeded();

    const line = req.params.line?.trim().toLowerCase();
    if (!line) {
      return res.status(400).json({ message: "Line name is required" });
    }

    const stations = await Station.find({ line }).sort({ sequence: 1 });

    if (!stations.length) {
      return res.status(404).json({ message: "Line not found" });
    }

    res.json(stations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllStations = async (req, res) => {
  try {
    await ensureStationsSeeded();

    const stations = await Station.find().sort({ line: 1, sequence: 1 });
    res.json(stations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
