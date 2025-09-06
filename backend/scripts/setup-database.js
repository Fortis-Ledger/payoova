const mongoose = require("mongoose")
const User = require("../src/models/User")
const Transaction = require("../src/models/Transaction")
const Subscription = require("../src/models/Subscription")
require("dotenv").config()

async function setupDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to MongoDB")

    // Create indexes for better performance
    console.log("Creating database indexes...")

    await User.createIndexes()
    await Transaction.createIndexes()
    await Subscription.createIndexes()

    console.log("Database indexes created successfully")

    // Create admin user if specified
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_AUTH0_ID) {
      const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL })

      if (!existingAdmin) {
        const adminUser = new User({
          auth0Id: process.env.ADMIN_AUTH0_ID,
          email: process.env.ADMIN_EMAIL,
          name: "Admin User",
          walletAddress: "0x0000000000000000000000000000000000000000", // Placeholder
          encryptedPrivateKey: "admin_placeholder",
          isVerified: true,
        })

        await adminUser.save()
        console.log("Admin user created successfully")
      } else {
        console.log("Admin user already exists")
      }
    }

    console.log("Database setup completed successfully")
  } catch (error) {
    console.error("Database setup error:", error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
  }
}

setupDatabase()
