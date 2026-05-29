const Train = require("../models/Train");

// Trains are provisioned based on a simplified line model:
// Round Trip Time = 2 × End-to-End Time + Rest Time
// Trains Needed = Round Trip Time / Frequency
// This project uses the suggested counts for each line.
const seededTrains = [];

const createTrainBatch = ({ prefix, count, line, distance, startStation, endStation, direction }) => {
  for (let i = 0; i < count; i += 1) {
    const number = `${prefix}-${101 + i}`;
    seededTrains.push({
      trainNo: number,
      trainName: `${line} Line ${number}`,
      line,
      direction,
      startStation,
      endStation,
      distance,
      currentStation: startStation,
      status: "Running"
    });
  }
};

createTrainBatch({
  prefix: "P",
  count: 9,
  line: "Purple",
  distance: 43.35,
  startStation: "Kengeri",
  endStation: "Purple Terminal",
  direction: "Kengeri to Purple Terminal"
});

createTrainBatch({
  prefix: "G",
  count: 7,
  line: "Green",
  distance: 33.5,
  startStation: "Nagasandra",
  endStation: "Green Terminal",
  direction: "Nagasandra to Green Terminal"
});

createTrainBatch({
  prefix: "Y",
  count: 4,
  line: "Yellow",
  distance: 19.15,
  startStation: "RV Road",
  endStation: "Yellow Terminal",
  direction: "RV Road to Yellow Terminal"
});

const ensureTrainsSeeded = async () => {
  const count = await Train.countDocuments();
  const expectedCount = seededTrains.length;
  const firstSeededTrain = await Train.findOne({ trainNo: seededTrains[0].trainNo });
  const seedChanged = !firstSeededTrain || firstSeededTrain.endStation !== seededTrains[0].endStation;

  if (count !== expectedCount || seedChanged) {
    await Train.deleteMany({});
    await Train.insertMany(seededTrains);
  }
};

module.exports = {
  ensureTrainsSeeded
};
