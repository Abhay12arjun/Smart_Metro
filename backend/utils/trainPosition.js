const MINUTES_PER_HOUR = 60;
const { formatDelay } = require("./timeFormat");

const lineSpeedsKmph = {
  Purple: 34,
  Green: 32,
  Yellow: 30
};

const getTrainOffset = (trainNo) => {
  const numericPart = Number(String(trainNo).match(/\d+/)?.[0] || 0);
  return Number.isFinite(numericPart) ? numericPart : 0;
};

const roundTo = (value, places = 1) => {
  const multiplier = 10 ** places;
  return Math.round(value * multiplier) / multiplier;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getTimedTrainPosition = (train, stations, now = new Date(), requestedDirectionType) => {
  const directionTypeOverride = ["going", "coming"].includes(requestedDirectionType)
    ? requestedDirectionType
    : null;
  const delayMinutes = Math.max(Number(train.delayMinutes) || 0, 0);
  const delayLabel = formatDelay(delayMinutes);

  if (!stations.length) {
    return {
      currentStation: train.currentStation,
      nextStation: train.endStation,
      movementDirection: train.direction,
      directionType: directionTypeOverride || "going",
      routeFrom: train.startStation,
      routeTo: train.endStation,
      displayStartStation: train.startStation,
      displayEndStation: train.endStation,
      trainMarkerPosition: 0,
      progressPercent: 0,
      segmentProgressPercent: 0,
      distanceCoveredKm: 0,
      distanceToNextStationKm: 0,
      minutesToNextStation: 0,
      delayMinutes,
      delayLabel,
      routeStations: []
    };
  }

  const orderedStations = stations
    .slice()
    .sort((a, b) => a.sequence - b.sequence)
    .map((station) => station.stationName);

  const routeFrom = orderedStations[0];
  const routeTo = orderedStations[orderedStations.length - 1];
  const lineDistanceKm = Number(train.distance) || 1;
  const segmentCount = Math.max(orderedStations.length - 1, 1);
  const segmentDistanceKm = lineDistanceKm / segmentCount;

  if (["Stopped", "Maintenance"].includes(train.status)) {
    const storedStationIndex = orderedStations.findIndex(
      (stationName) => stationName === train.currentStation
    );
    const currentStationIndex = storedStationIndex >= 0 ? storedStationIndex : 0;
    const isGoing = directionTypeOverride !== "coming";
    const markerPositionPercent = roundTo((currentStationIndex / segmentCount) * 100);
    const tripProgressPercent = isGoing ? markerPositionPercent : roundTo(100 - markerPositionPercent);

    return {
      currentStation: orderedStations[currentStationIndex],
      nextStation: orderedStations[currentStationIndex],
      movementDirection: isGoing
        ? `${routeFrom} to ${routeTo}`
        : `${routeTo} to ${routeFrom}`,
      directionType: isGoing ? "going" : "coming",
      routeFrom,
      routeTo,
      displayStartStation: routeFrom,
      displayEndStation: routeTo,
      trainMarkerPosition: markerPositionPercent,
      progressPercent: tripProgressPercent,
      segmentProgressPercent: 0,
      distanceCoveredKm: roundTo(currentStationIndex * segmentDistanceKm),
      distanceToNextStationKm: 0,
      minutesToNextStation: 0,
      delayMinutes,
      delayLabel,
      routeStations: orderedStations
    };
  }

  const speedKmph = lineSpeedsKmph[train.line] || 32;
  const hoursSinceEpoch = now.getTime() / (1000 * 60 * 60);

  // Spread trains on the route by distance so they do not stack at one station.
  const offsetKm = getTrainOffset(train.trainNo) * segmentDistanceKm * 1.7;
  const cycleDistanceKm = (hoursSinceEpoch * speedKmph + offsetKm) % lineDistanceKm;
  const isGoing = directionTypeOverride
    ? directionTypeOverride === "going"
    : cycleDistanceKm <= lineDistanceKm / 2;
  const distanceAlongRouteKm = isGoing ? cycleDistanceKm : lineDistanceKm - cycleDistanceKm;
  const rawStationIndex = Math.floor(distanceAlongRouteKm / segmentDistanceKm);
  const currentStationIndex = clamp(rawStationIndex, 0, orderedStations.length - 1);
  const nextStationIndex = isGoing
    ? clamp(currentStationIndex + 1, 0, orderedStations.length - 1)
    : clamp(currentStationIndex - 1, 0, orderedStations.length - 1);
  const stationStartDistanceKm = currentStationIndex * segmentDistanceKm;
  const distanceIntoSegmentKm = clamp(distanceAlongRouteKm - stationStartDistanceKm, 0, segmentDistanceKm);
  const distanceToNextStationKm = currentStationIndex === nextStationIndex
    ? 0
    : isGoing
      ? segmentDistanceKm - distanceIntoSegmentKm
      : distanceIntoSegmentKm;
  const minutesToNextStation = (distanceToNextStationKm / speedKmph) * MINUTES_PER_HOUR;
  const tripDistanceCoveredKm = isGoing
    ? distanceAlongRouteKm
    : lineDistanceKm - distanceAlongRouteKm;
  const markerPositionPercent = roundTo((distanceAlongRouteKm / lineDistanceKm) * 100);
  const tripProgressPercent = roundTo((tripDistanceCoveredKm / lineDistanceKm) * 100);

  return {
    currentStation: orderedStations[currentStationIndex],
    nextStation: orderedStations[nextStationIndex],
    movementDirection: isGoing
      ? `${routeFrom} to ${routeTo}`
      : `${routeTo} to ${routeFrom}`,
    directionType: isGoing ? "going" : "coming",
    routeFrom,
    routeTo,
    displayStartStation: routeFrom,
    displayEndStation: routeTo,
    trainMarkerPosition: markerPositionPercent,
    progressPercent: tripProgressPercent,
    segmentProgressPercent: roundTo((distanceIntoSegmentKm / segmentDistanceKm) * 100),
    distanceCoveredKm: roundTo(tripDistanceCoveredKm),
    distanceToNextStationKm: roundTo(distanceToNextStationKm),
    minutesToNextStation: roundTo(minutesToNextStation + delayMinutes),
    delayMinutes,
    delayLabel,
    routeStations: orderedStations
  };
};

const addTimedPosition = (train, stationMap, now = new Date(), requestedDirectionType) => {
  const trainData = train.toObject ? train.toObject() : train;
  const lineKey = String(trainData.line || "").toLowerCase();
  const position = getTimedTrainPosition(trainData, stationMap[lineKey] || [], now, requestedDirectionType);

  return {
    ...trainData,
    startStation: position.routeFrom,
    endStation: position.routeTo,
    displayStartStation: position.displayStartStation,
    displayEndStation: position.displayEndStation,
    currentStation: position.currentStation,
    nextStation: position.nextStation,
    direction: position.movementDirection,
    movementDirection: position.movementDirection,
    directionType: position.directionType,
    trainMarkerPosition: position.trainMarkerPosition,
    progressPercent: position.progressPercent,
    segmentProgressPercent: position.segmentProgressPercent,
    distanceCoveredKm: position.distanceCoveredKm,
    distanceToNextStationKm: position.distanceToNextStationKm,
    minutesToNextStation: position.minutesToNextStation,
    delayMinutes: position.delayMinutes,
    delayLabel: position.delayLabel,
    routeStations: position.routeStations
  };
};

module.exports = {
  addTimedPosition
};
