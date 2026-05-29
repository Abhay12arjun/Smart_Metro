const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getPassengers,
  getTicketStats,
  addWalletBalance
} = require("../controllers/adminController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/dashboard", protect, adminOnly, getDashboardStats);
router.get("/passengers", protect, adminOnly, getPassengers);
router.get("/tickets/stats", protect, adminOnly, getTicketStats);
router.post("/wallet/add", protect, adminOnly, addWalletBalance);

module.exports = router;
