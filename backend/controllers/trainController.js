const Train = require("../models/Train");
const Station = require("../models/Station");
const Notification = require("../models/Notification");
const { ensureStationsSeeded } = require("../data/stationSeed");
const { ensureTrainsSeeded } = require("../seed/trainSeed");
const { addTimedPosition } = require("../utils/trainPosition");
const { formatDelay } = require("../utils/timeFormat");

const getStationMap = async () => {
  await ensureStationsSeeded();
  const stations = await Station.find().sort({ line: 1, sequence: 1 });

  return stations.reduce((map, station) => {
    if (!map[station.line]) {
      map[station.line] = [];
    }

    map[station.line].push(station);
    return map;
  }, {});
};

const notifiableStatuses = ["Delayed", "Maintenance", "Stopped"];

const shouldCreateTrainActivityNotification = (train, previousStatus) => {
  return notifiableStatuses.includes(train.status)
    || (["Stopped", "Maintenance", "Delayed"].includes(previousStatus) && train.status === "Running");
};

const getNotificationMessage = (train, delayLabel, previousStatus) => {
  if (previousStatus === "Stopped" && train.status === "Running") {
    return `${train.trainName} on ${train.line} line has restarted from ${train.currentStation}.`;
  }

  if (previousStatus === "Maintenance" && train.status === "Running") {
    return `${train.trainName} on ${train.line} line maintenance is complete and the train has restarted.`;
  }

  if (previousStatus === "Delayed" && train.status === "Running") {
    return `${train.trainName} on ${train.line} line is back on time.`;
  }

  if (train.status === "Delayed") {
    return `${train.trainName} on ${train.line} line is delayed${delayLabel ? ` by ${delayLabel}` : ""}.`;
  }

  if (train.status === "Maintenance") {
    return `${train.trainName} on ${train.line} line is under maintenance.`;
  }

  return `${train.trainName} on ${train.line} line has stopped at ${train.currentStation}.`;
};

const getNotificationTitle = (train, previousStatus) => {
  if (previousStatus === "Delayed" && train.status === "Running") {
    return `${train.line} Line On Time`;
  }

  if (["Stopped", "Maintenance"].includes(previousStatus) && train.status === "Running") {
    return `${train.line} Line Restarted`;
  }

  return `${train.line} Line ${train.status}`;
};

const createTrainActivityNotification = async (train, io, previousStatus) => {
  if (!shouldCreateTrainActivityNotification(train, previousStatus)) {
    return null;
  }

  const delayLabel = train.status === "Delayed" ? formatDelay(train.delayMinutes) : "";
  const isBackToRunning = train.status === "Running";
  const notification = await Notification.create({
    title: getNotificationTitle(train, previousStatus),
    message: getNotificationMessage(train, delayLabel, previousStatus),
    line: train.line,
    train: train._id,
    trainName: train.trainName,
    trainNo: train.trainNo,
    status: train.status,
    delayMinutes: train.delayMinutes || 0,
    delayLabel,
    type: train.status === "Running" ? "success" : train.status === "Delayed" ? "warning" : "info"
  });

  if (io) {
    io.emit("notification-created", notification);
  }

  return notification;
};

exports.createTrain = async (req, res) => {
  try {
    const {
      trainNo,
      trainName,
      line,
      direction,
      startStation,
      endStation,
      distance,
      status,
      delayMinutes
    } = req.body;

    if (
      !trainNo ||
      !trainName ||
      !line ||
      !direction ||
      !startStation ||
      !endStation ||
      !distance
    ) {
      return res.status(400).json({ message: "All train details are required" });
    }

    const train = await Train.create({
      trainNo,
      trainName,
      line,
      direction,
      startStation,
      endStation,
      distance,
      currentStation: startStation,
      status: status || "Running",
      delayMinutes: status === "Delayed" ? Math.max(Number(delayMinutes) || 0, 0) : 0
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("trainUpdated", train);
    }

    await createTrainActivityNotification(train, io);

    res.status(201).json(train);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTrains = async (req, res) => {
  try {
    await ensureTrainsSeeded();
    const stationMap = await getStationMap();
    const trains = await Train.find().sort({ line: 1, trainNo: 1 });
    res.json(
      trains.map((train, index) => addTimedPosition(
        train,
        stationMap,
        undefined,
        index % 2 === 0 ? "going" : "coming"
      ))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTrainById = async (req, res) => {
  try {
    const train = await Train.findById(req.params.id);

    if (!train) {
      return res.status(404).json({ message: "Train not found" });
    }

    const stationMap = await getStationMap();
    res.json(addTimedPosition(train, stationMap));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTrain = async (req, res) => {
  try {
    const { status, currentStation, arrivalTime, departureTime, delayMinutes } = req.body;
    const update = {};
    const existingTrain = await Train.findById(req.params.id);

    if (!existingTrain) {
      return res.status(404).json({ message: "Train not found" });
    }

    if (status !== undefined) {
      update.status = status;
      update.delayMinutes = status === "Delayed" ? Math.max(Number(delayMinutes) || 0, 0) : 0;
    }

    if (currentStation !== undefined) {
      update.currentStation = currentStation;
    }

    if (arrivalTime !== undefined) {
      update.arrivalTime = arrivalTime;
    }

    if (departureTime !== undefined) {
      update.departureTime = departureTime;
    }

    const train = await Train.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    if (!train) {
      return res.status(404).json({ message: "Train not found" });
    }

    const io = req.app.get("io");
    if (io) {
      io.emit("trainUpdated", train);
    }

    await createTrainActivityNotification(train, io, existingTrain.status);

    res.json(train);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTrainLocation = async (req, res) => {
  try {
    const { currentStation, status, delayMinutes } = req.body;
    const update = {};
    const existingTrain = await Train.findById(req.params.id);

    if (!existingTrain) {
      return res.status(404).json({ message: "Train not found" });
    }

    if (currentStation !== undefined) {
      update.currentStation = currentStation;
    }

    if (status !== undefined) {
      update.status = status;
      update.delayMinutes = status === "Delayed" ? Math.max(Number(delayMinutes) || 0, 0) : 0;
    }

    const train = await Train.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    const io = req.app.get("io");
    if (io) {
      io.emit("train-location-updated", train);
    }

    await createTrainActivityNotification(train, io, existingTrain.status);

    res.json(train);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTrain = async (req, res) => {
  try {
    const train = await Train.findByIdAndDelete(req.params.id);

    if (!train) {
      return res.status(404).json({ message: "Train not found" });
    }

    const io = req.app.get("io");
    if (io) {
      io.emit("trainDeleted", train._id);
    }

    res.json({ message: "Train deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
