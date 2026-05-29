const express = require("express");
const router = express.Router();

const {
  createTrain,
  getTrains,
  getTrainById,
  updateTrain,
  updateTrainLocation,
  deleteTrain
} = require("../controllers/trainController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", getTrains);
router.get("/:id", getTrainById);
router.post("/", protect, adminOnly, createTrain);
router.put("/:id", protect, adminOnly, updateTrain);
router.put("/:id/location", protect, adminOnly, updateTrainLocation);
router.delete("/:id", protect, adminOnly, deleteTrain);

module.exports = router;