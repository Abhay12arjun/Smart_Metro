const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  loginAdmin,
  forgotPassengerPassword,
  resetPassengerPassword,
  googleLogin
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/admin/login", loginAdmin);
router.post("/forgot-password", forgotPassengerPassword);
router.post("/reset-password/:token", resetPassengerPassword);
router.post("/google", googleLogin);

module.exports = router;
