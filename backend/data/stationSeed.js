const Station = require("../models/Station");

const stationSeed = [
  // Green line stations (North-South corridor)
  { stationName: "Nagasandra", stationCode: "G01", city: "Bengaluru", line: "green", lineColor: "#22c55e", sequence: 1 },
  { stationName: "Dasarahalli", stationCode: "G02", city: "Bengaluru", line: "green", lineColor: "#22c55e", sequence: 2 },
  { stationName: "Jalahalli", stationCode: "G03", city: "Bengaluru", line: "green", lineColor: "#22c55e", sequence: 3 },
  { stationName: "Peenya Industry", stationCode: "G04", city: "Bengaluru", line: "green", lineColor: "#22c55e", sequence: 4 },
  { stationName: "Peenya", stationCode: "G05", city: "Bengaluru", line: "green", lineColor: "#22c55e", sequence: 5 },
  { stationName: "Yeshwanthpur", stationCode: "G06", city: "Bengaluru", line: "green", lineColor: "#22c55e", sequence: 6 },
  { stationName: "Sandal Soap Factory", stationCode: "G07", city: "Bengaluru", line: "green", lineColor: "#22c55e", sequence: 7 },
  { stationName: "Mahalakshmi", stationCode: "G08", city: "Bengaluru", line: "green", lineColor: "#22c55e", sequence: 8 },
  { stationName: "Rajajinagar", stationCode: "G09", city: "Bengaluru", line: "green", lineColor: "#22c55e", sequence: 9 },
  { stationName: "Malleshwaram", stationCode: "G10", city: "Bengaluru", line: "green", lineColor: "#22c55e", sequence: 10 },
  { stationName: "Kempegowda Majestic", stationCode: "G11", city: "Bengaluru", line: "green", lineColor: "#22c55e", sequence: 11 },
  { stationName: "Chickpet", stationCode: "G12", city: "Bengaluru", line: "green", lineColor: "#22c55e", sequence: 12 },
  { stationName: "KR Market", stationCode: "G13", city: "Bengaluru", line: "green", lineColor: "#22c55e", sequence: 13 },
  { stationName: "National College", stationCode: "G14", city: "Bengaluru", line: "green", lineColor: "#22c55e", sequence: 14 },
  { stationName: "Lalbagh", stationCode: "G15", city: "Bengaluru", line: "green", lineColor: "#22c55e", sequence: 15 },
  { stationName: "South End Circle", stationCode: "G16", city: "Bengaluru", line: "green", lineColor: "#22c55e", sequence: 16 },
  { stationName: "Jayanagar", stationCode: "G17", city: "Bengaluru", line: "green", lineColor: "#22c55e", sequence: 17 },
  { stationName: "Banashankari", stationCode: "G18", city: "Bengaluru", line: "green", lineColor: "#22c55e", sequence: 18 },
  { stationName: "Banashankari East", stationCode: "G19", city: "Bengaluru", line: "green", lineColor: "#22c55e", sequence: 19 },
  { stationName: "Jayadeva Hospital", stationCode: "G20", city: "Bengaluru", line: "green", lineColor: "#22c55e", sequence: 20 },
  { stationName: "Outer Ring Road", stationCode: "G21", city: "Bengaluru", line: "green", lineColor: "#22c55e", sequence: 21 },
  { stationName: "BTM Layout", stationCode: "G22", city: "Bengaluru", line: "green", lineColor: "#22c55e", sequence: 22 },
  { stationName: "HSR Layout", stationCode: "G23", city: "Bengaluru", line: "green", lineColor: "#22c55e", sequence: 23 },
  { stationName: "Silk Board", stationCode: "G24", city: "Bengaluru", line: "green", lineColor: "#22c55e", sequence: 24 },
  { stationName: "Electronic City", stationCode: "G25", city: "Bengaluru", line: "green", lineColor: "#22c55e", sequence: 25 },
  { stationName: "Agara", stationCode: "G26", city: "Bengaluru", line: "green", lineColor: "#22c55e", sequence: 26 },
  { stationName: "Konappana Agrahara", stationCode: "G27", city: "Bengaluru", line: "green", lineColor: "#22c55e", sequence: 27 },
  { stationName: "Anjanapura", stationCode: "G28", city: "Bengaluru", line: "green", lineColor: "#22c55e", sequence: 28 },
  { stationName: "Jigani", stationCode: "G29", city: "Bengaluru", line: "green", lineColor: "#22c55e", sequence: 29 },
  { stationName: "Attibele", stationCode: "G30", city: "Bengaluru", line: "green", lineColor: "#22c55e", sequence: 30 },
  { stationName: "Hosur Road", stationCode: "G31", city: "Bengaluru", line: "green", lineColor: "#22c55e", sequence: 31 },
  { stationName: "Green Terminal", stationCode: "G32", city: "Bengaluru", line: "green", lineColor: "#22c55e", sequence: 32 },

  // Purple line stations (East-West corridor)
  { stationName: "Kengeri", stationCode: "P01", city: "Bengaluru", line: "purple", lineColor: "#8b5cf6", sequence: 1 },
  { stationName: "Kengeri Bus Terminal", stationCode: "P02", city: "Bengaluru", line: "purple", lineColor: "#8b5cf6", sequence: 2 },
  { stationName: "Mysore Road", stationCode: "P03", city: "Bengaluru", line: "purple", lineColor: "#8b5cf6", sequence: 3 },
  { stationName: "Nayandahalli", stationCode: "P04", city: "Bengaluru", line: "purple", lineColor: "#8b5cf6", sequence: 4 },
  { stationName: "Banashankari", stationCode: "P05", city: "Bengaluru", line: "purple", lineColor: "#8b5cf6", sequence: 5 },
  { stationName: "Jnanabharati", stationCode: "P06", city: "Bengaluru", line: "purple", lineColor: "#8b5cf6", sequence: 6 },
  { stationName: "Deepanjali Nagar", stationCode: "P07", city: "Bengaluru", line: "purple", lineColor: "#8b5cf6", sequence: 7 },
  { stationName: "Hosahalli", stationCode: "P08", city: "Bengaluru", line: "purple", lineColor: "#8b5cf6", sequence: 8 },
  { stationName: "Vijayanagar", stationCode: "P09", city: "Bengaluru", line: "purple", lineColor: "#8b5cf6", sequence: 9 },
  { stationName: "Magadi Road", stationCode: "P10", city: "Bengaluru", line: "purple", lineColor: "#8b5cf6", sequence: 10 },
  { stationName: "Rajajinagar", stationCode: "P11", city: "Bengaluru", line: "purple", lineColor: "#8b5cf6", sequence: 11 },
  { stationName: "City Market", stationCode: "P12", city: "Bengaluru", line: "purple", lineColor: "#8b5cf6", sequence: 12 },
  { stationName: "Seshadripuram", stationCode: "P13", city: "Bengaluru", line: "purple", lineColor: "#8b5cf6", sequence: 13 },
  { stationName: "Central College", stationCode: "P14", city: "Bengaluru", line: "purple", lineColor: "#8b5cf6", sequence: 14 },
  { stationName: "Kempegowda Majestic", stationCode: "P15", city: "Bengaluru", line: "purple", lineColor: "#8b5cf6", sequence: 15 },
  { stationName: "Cubbon Park", stationCode: "P16", city: "Bengaluru", line: "purple", lineColor: "#8b5cf6", sequence: 16 },
  { stationName: "M.G. Road", stationCode: "P17", city: "Bengaluru", line: "purple", lineColor: "#8b5cf6", sequence: 17 },
  { stationName: "Trinity", stationCode: "P18", city: "Bengaluru", line: "purple", lineColor: "#8b5cf6", sequence: 18 },
  { stationName: "Halasuru", stationCode: "P19", city: "Bengaluru", line: "purple", lineColor: "#8b5cf6", sequence: 19 },
  { stationName: "Indiranagar", stationCode: "P20", city: "Bengaluru", line: "purple", lineColor: "#8b5cf6", sequence: 20 },
  { stationName: "Swami Vivekananda Road", stationCode: "P21", city: "Bengaluru", line: "purple", lineColor: "#8b5cf6", sequence: 21 },
  { stationName: "Baiyappanahalli", stationCode: "P22", city: "Bengaluru", line: "purple", lineColor: "#8b5cf6", sequence: 22 },
  { stationName: "Whitefield", stationCode: "P23", city: "Bengaluru", line: "purple", lineColor: "#8b5cf6", sequence: 23 },
  { stationName: "Hoodi", stationCode: "P24", city: "Bengaluru", line: "purple", lineColor: "#8b5cf6", sequence: 24 },
  { stationName: "KR Puram", stationCode: "P25", city: "Bengaluru", line: "purple", lineColor: "#8b5cf6", sequence: 25 },
  { stationName: "Hebbal", stationCode: "P26", city: "Bengaluru", line: "purple", lineColor: "#8b5cf6", sequence: 26 },
  { stationName: "Yelahanka", stationCode: "P27", city: "Bengaluru", line: "purple", lineColor: "#8b5cf6", sequence: 27 },
  { stationName: "Yelahanka South", stationCode: "P28", city: "Bengaluru", line: "purple", lineColor: "#8b5cf6", sequence: 28 },
  { stationName: "Raja Rajeshwari Nagar", stationCode: "P29", city: "Bengaluru", line: "purple", lineColor: "#8b5cf6", sequence: 29 },
  { stationName: "Saptagiri Layout", stationCode: "P30", city: "Bengaluru", line: "purple", lineColor: "#8b5cf6", sequence: 30 },
  { stationName: "Mysuru Road East", stationCode: "P31", city: "Bengaluru", line: "purple", lineColor: "#8b5cf6", sequence: 31 },
  { stationName: "RR Nagar", stationCode: "P32", city: "Bengaluru", line: "purple", lineColor: "#8b5cf6", sequence: 32 },
  { stationName: "Vijayanagar West", stationCode: "P33", city: "Bengaluru", line: "purple", lineColor: "#8b5cf6", sequence: 33 },
  { stationName: "Metro City", stationCode: "P34", city: "Bengaluru", line: "purple", lineColor: "#8b5cf6", sequence: 34 },
  { stationName: "City Center", stationCode: "P35", city: "Bengaluru", line: "purple", lineColor: "#8b5cf6", sequence: 35 },
  { stationName: "Railway Station", stationCode: "P36", city: "Bengaluru", line: "purple", lineColor: "#8b5cf6", sequence: 36 },
  { stationName: "Purple Terminal", stationCode: "P37", city: "Bengaluru", line: "purple", lineColor: "#8b5cf6", sequence: 37 },

  // Yellow line stations (RV Road to Bommasandra corridor)
  { stationName: "RV Road", stationCode: "Y01", city: "Bengaluru", line: "yellow", lineColor: "#eab308", sequence: 1 },
  { stationName: "JP Nagar East", stationCode: "Y02", city: "Bengaluru", line: "yellow", lineColor: "#eab308", sequence: 2 },
  { stationName: "JP Nagar 4th Phase", stationCode: "Y03", city: "Bengaluru", line: "yellow", lineColor: "#eab308", sequence: 3 },
  { stationName: "Konanakunte Cross", stationCode: "Y04", city: "Bengaluru", line: "yellow", lineColor: "#eab308", sequence: 4 },
  { stationName: "Bommasandra", stationCode: "Y05", city: "Bengaluru", line: "yellow", lineColor: "#eab308", sequence: 5 },
  { stationName: "NICE Road", stationCode: "Y06", city: "Bengaluru", line: "yellow", lineColor: "#eab308", sequence: 6 },
  { stationName: "Hulimavu Gate", stationCode: "Y07", city: "Bengaluru", line: "yellow", lineColor: "#eab308", sequence: 7 },
  { stationName: "Bommenahalli", stationCode: "Y08", city: "Bengaluru", line: "yellow", lineColor: "#eab308", sequence: 8 },
  { stationName: "Electronic City Phase 1", stationCode: "Y09", city: "Bengaluru", line: "yellow", lineColor: "#eab308", sequence: 9 },
  { stationName: "Electronic City Phase 2", stationCode: "Y10", city: "Bengaluru", line: "yellow", lineColor: "#eab308", sequence: 10 },
  { stationName: "Konappana Agrahara", stationCode: "Y11", city: "Bengaluru", line: "yellow", lineColor: "#eab308", sequence: 11 },
  { stationName: "Hosur Road", stationCode: "Y12", city: "Bengaluru", line: "yellow", lineColor: "#eab308", sequence: 12 },
  { stationName: "Bellandur", stationCode: "Y13", city: "Bengaluru", line: "yellow", lineColor: "#eab308", sequence: 13 },
  { stationName: "KR Puram East", stationCode: "Y14", city: "Bengaluru", line: "yellow", lineColor: "#eab308", sequence: 14 },
  { stationName: "Kadanayakanahalli", stationCode: "Y15", city: "Bengaluru", line: "yellow", lineColor: "#eab308", sequence: 15 },
  { stationName: "Yellow Terminal", stationCode: "Y16", city: "Bengaluru", line: "yellow", lineColor: "#eab308", sequence: 16 }
];

const ensureStationsSeeded = async () => {
  const count = await Station.countDocuments();

  if (count !== stationSeed.length) {
    await Station.deleteMany({});
    await Station.insertMany(stationSeed);
  }
};

module.exports = {
  stationSeed,
  ensureStationsSeeded
};
