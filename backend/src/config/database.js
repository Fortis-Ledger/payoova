const mongoose = require("mongoose")
const logger = require("./logger")

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    })

    logger.info(`MongoDB Connected: ${conn.connection.host}`)
    console.log(`📦 MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    logger.error("Database connection error:", error)
    console.error("Database connection error:", error)
    // For development, don't exit on DB connection error
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    }
  }
}

module.exports = connectDB
