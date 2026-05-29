const mongoose = require("mongoose");

mongoose.set("bufferCommands", false);

const connectOptions = {
  serverSelectionTimeoutMS: 5000
};

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("MongoDB connection failed: MONGO_URI is missing in backend/.env.");
    return false;
  }

  try {
    await mongoose.connect(mongoUri, connectOptions);
    console.log("✅ MongoDB connected successfully to Atlas");
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    
    if (error.message.includes("querySrv") || error.code === "ECONNREFUSED") {
      console.error("\n⚠️  MongoDB Atlas SRV lookup failed (DNS/Network issue)");
      console.error("📋 Troubleshooting steps:");
      console.error("  1. Check internet connection: ping 8.8.8.8");
      console.error("  2. Verify MONGO_URI in backend/.env is correct");
      console.error("  3. Check MongoDB Atlas network access settings");
      console.error("  4. Ensure cluster is active and running\n");
    }

    if (process.env.NODE_ENV === "production") {
      console.error("Production mode: Exiting due to MongoDB connection failure");
      process.exit(1);
    }

    console.warn("⚠️  Continuing without MongoDB in development mode.");
    return false;
  }
};

module.exports = connectDB;
