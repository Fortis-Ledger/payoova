const mongoose = require("mongoose")
const Transaction = require("../src/models/Transaction")
const priceService = require("../src/services/priceService")
require("dotenv").config()

async function migrateTransactions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to MongoDB")

    // Find transactions without USD values
    const transactionsToUpdate = await Transaction.find({
      usdValue: { $exists: false },
      status: "confirmed",
      amount: { $exists: true },
    }).limit(1000)

    console.log(`Found ${transactionsToUpdate.length} transactions to update`)

    for (const transaction of transactionsToUpdate) {
      try {
        const coinId = priceService.getNetworkCoinId(transaction.network)
        const usdValue = await priceService.convertAmount(Number.parseFloat(transaction.amount), coinId, "usd")

        transaction.usdValue = usdValue
        await transaction.save()

        console.log(`Updated transaction ${transaction.hash} with USD value: $${usdValue}`)
      } catch (error) {
        console.warn(`Failed to update transaction ${transaction.hash}:`, error.message)
      }
    }

    console.log("Transaction migration completed")
  } catch (error) {
    console.error("Migration error:", error)
  } finally {
    await mongoose.disconnect()
  }
}

migrateTransactions()
