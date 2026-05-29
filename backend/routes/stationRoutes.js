const express = require("express");
const router = express.Router();

const {
  getLineOverview,
  getStationsByLine,
  getAllStations
} = require("../controllers/stationController");

router.get("/lines", getLineOverview);
router.get("/line/:line", getStationsByLine);
router.get("/all", getAllStations);

module.exports = router;
