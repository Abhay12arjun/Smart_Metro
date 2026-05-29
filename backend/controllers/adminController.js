const User = require("../models/User");
const Ticket = require("../models/Ticket");
const Train = require("../models/Train");
const Notification = require("../models/Notification");
const WalletTransaction = require("../models/WalletTransaction");
const { ensureTrainsSeeded } = require("../seed/trainSeed");

exports.getDashboardStats = async (req, res) => {
  try {
    await ensureTrainsSeeded();

    const [
      registeredPassengers,
      totalTrains,
      runningTrains,
      delayedTrains,
      stoppedTrains,
      maintenanceTrains,
      totalTickets,
      bookedTickets,
      cancelledTickets,
      completedTickets,
      ticketsData,
      walletData,
      notificationsCount
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: "admin" } }),
      Train.countDocuments(),
      Train.countDocuments({ status: "Running" }),
      Train.countDocuments({ status: "Delayed" }),
      Train.countDocuments({ status: "Stopped" }),
      Train.countDocuments({ status: "Maintenance" }),
      Ticket.countDocuments(),
      Ticket.countDocuments({ status: "Booked" }),
      Ticket.countDocuments({ status: "Cancelled" }),
      Ticket.countDocuments({ status: "Completed" }),
      Ticket.aggregate([
        {
          $match: {
            paymentStatus: "Paid",
            status: { $ne: "Cancelled" }
          }
        },
        { $group: { _id: null, total: { $sum: "$fare" } } }
      ]),
      WalletTransaction.aggregate([
        { $match: { status: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Notification.countDocuments()
    ]);

    const totalPassengers = totalTickets;
    const ticketRevenue = ticketsData[0]?.total || 0;
    const walletTopups = walletData[0]?.total || 0;

    res.json({
      totalPassengers,
      registeredPassengers,
      totalTrains,
      runningTrains,
      delayedTrains,
      stoppedTrains,
      maintenanceTrains,
      totalTickets,
      totalRevenue: ticketRevenue,
      ticketRevenue,
      walletTopups,
      bookedTickets,
      cancelledTickets,
      completedTickets,
      notificationsCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPassengers = async (req, res) => {
  try {
    const passengers = await User.find({ role: "passenger" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(passengers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTicketStats = async (req, res) => {
  try {
    const stats = await Ticket.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$fare" }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addWalletBalance = async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid userId or amount" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { walletBalance: amount } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Wallet balance updated",
      walletBalance: user.walletBalance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
