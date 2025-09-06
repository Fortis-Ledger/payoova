const mongoose = require("mongoose")
const User = require("../src/models/User")
const Invoice = require("../src/models/Invoice")
const WalletService = require("../src/services/walletService")
require("dotenv").config()

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to MongoDB")

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await User.deleteMany({})
    // await Invoice.deleteMany({})
    // console.log("Cleared existing data")

    console.log("Database ready for seeding!")
    console.log("No demo data created - you can now create your own account through Auth0")

  } catch (error) {
    console.error("Seeding error:", error)
  } finally {
    await mongoose.disconnect()
    console.log("Disconnected from MongoDB")
  }
}

seedDatabase()