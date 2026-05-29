const Ticket = require("../models/Ticket");
const User = require("../models/User");
const Station = require("../models/Station");

exports.bookTicket = async (req, res) => {
  try {
    const { line, source, destination } = req.body;

    if (!line || !source || !destination) {
      return res.status(400).json({ message: "Line, source, and destination are required" });
    }

    const normalizedLine = line.trim().toLowerCase();
    const stations = await Station.find({ line: normalizedLine }).sort({ sequence: 1 });

    if (!stations.length) {
      return res.status(400).json({ message: "Invalid metro line selected" });
    }

    const sourceStation = stations.find(
      (station) => station.stationName.toLowerCase() === source.trim().toLowerCase() || station.stationCode.toLowerCase() === source.trim().toLowerCase()
    );

    const destinationStation = stations.find(
      (station) => station.stationName.toLowerCase() === destination.trim().toLowerCase() || station.stationCode.toLowerCase() === destination.trim().toLowerCase()
    );

    if (!sourceStation || !destinationStation) {
      return res.status(400).json({ message: "Source and destination must be valid stations on the selected line" });
    }

    if (sourceStation.stationCode === destinationStation.stationCode) {
      return res.status(400).json({ message: "Source and destination cannot be the same station" });
    }

    const stopDifference = Math.abs(destinationStation.sequence - sourceStation.sequence);
    const fare = Math.max(20, 20 + stopDifference * 15);

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.walletBalance < fare) {
      return res.status(400).json({ message: "Insufficient wallet balance" });
    }

    const ticket = await Ticket.create({
      passenger: req.user._id,
      line: normalizedLine,
      lineColor: sourceStation.lineColor,
      source: sourceStation.stationName,
      destination: destinationStation.stationName,
      fare,
      paymentStatus: "Paid",
      status: "Booked"
    });

    user.walletBalance -= fare;
    await user.save();

    const io = req.app.get("io");
    if (io) {
      io.emit("newTicket", {
        ticket,
        userWallet: user.walletBalance,
        fare
      });
    }

    res.status(201).json({
      message: "Ticket booked successfully",
      ticket,
      walletBalance: user.walletBalance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ passenger: req.user._id })
      .populate("train")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("passenger", "name email role")
      .populate("train")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (ticket.status === "Cancelled") {
      return res.status(400).json({ message: "Ticket is already cancelled" });
    }

    if (ticket.status !== "Booked") {
      return res.status(400).json({ message: "Only booked tickets can be cancelled" });
    }

    // Refund amount to wallet
    const user = await User.findById(ticket.passenger);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.walletBalance += ticket.fare;
    await user.save();

    // Cancel the ticket
    ticket.status = "Cancelled";
    ticket.paymentStatus = "Refunded";
    await ticket.save();

    // Emit socket event for admin
    const io = req.app.get("io");
    if (io) {
      io.emit("ticketCancelled", {
        ticket,
        refundAmount: ticket.fare,
        userWallet: user.walletBalance
      });
    }

    res.json({
      message: "Ticket cancelled successfully",
      ticket,
      walletBalance: user.walletBalance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
