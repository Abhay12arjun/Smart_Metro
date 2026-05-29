const express = require("express");
const router = express.Router();

const {
  bookTicket,
  getMyTickets,
  getAllTickets,
  cancelTicket
} = require("../controllers/ticketController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/book", protect, bookTicket);
router.get("/my", protect, getMyTickets);
router.get("/all", protect, adminOnly, getAllTickets);
router.put("/cancel/:id", protect, cancelTicket);

module.exports = router;