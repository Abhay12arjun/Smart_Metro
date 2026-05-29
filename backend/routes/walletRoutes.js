const express = require("express");
const router = express.Router();
const {
  createWalletOrder,
  verifyWalletPayment
} = require("../controllers/walletController");
const { protect } = require("../middleware/authMiddleware");

router.post("/razorpay/order", protect, createWalletOrder);
router.post("/razorpay/verify", protect, verifyWalletPayment);

module.exports = router;
