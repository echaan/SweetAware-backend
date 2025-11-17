const mongoose = require("mongoose");
const config = require("../config");

const connectDB = async () => {
  try {
    if (process.env.NODE_ENV === "development-no-db") {
      console.log("Running in development mode without database");
      return;
    }

    await mongoose.connect(config.mongodbUri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    console.warn("Warning: API will run without database functionality");
    // Don't exit the process, let the API run without DB
  }
};

module.exports = connectDB;
