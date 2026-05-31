const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const socketHandler = require("./socket/socket");

dotenv.config({ quiet: true });
connectDB();

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS origin denied: ${origin}`));
    }
  }
};

app.use(cors(corsOptions));

app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/trains", require("./routes/trainRoutes"));
app.use("/api/tickets", require("./routes/ticketRoutes"));
app.use("/api/stations", require("./routes/stationRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/wallet", require("./routes/walletRoutes"));

app.get("/", (req, res) => {
  res.send("Smart Metro Backend API Running");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  }
});

app.set("io", io);

socketHandler(io);

const PORT = process.env.PORT || 5000;

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Stop the other server or set a different PORT in backend/.env.`);
    process.exit(1);
  }

  throw error;
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
