const { ethers } = require("ethers")
const Transaction = require("../models/Transaction")
const Invoice = require("../models/Invoice")
const walletService = require("./walletService")
const blockchainService = require("./blockchainService")
const priceService = require("./priceService")
const logger = require("../config/logger")

class BackgroundServices {
  constructor() {
    this.intervals = new Map()
    this.isRunning = false
  }

  // Start all background services
  startAll() {
    if (this.isRunning) {
      logger.warn("Background services already running")
      return
    }

    this.isRunning = true
    logger.info("Starting background services...")

    // Disable background monitoring for development to avoid DB timeout issues
    // Monitor pending transactions every 5 minutes (reduced frequency)
    this.intervals.set(
      "transactionMonitor",
      setInterval(() => this.monitorPendingTransactions(), 300000),
    )

    // Monitor pending invoices for payments every 5 minutes (reduced frequency)
    this.intervals.set(
      "paymentMonitor", 
      setInterval(() => this.monitorPendingInvoices(), 300000),
    )

    // Update price cache every 5 minutes
    this.intervals.set(
      "priceUpdater",
      setInterval(() => this.updatePriceCache(), 5 * 60 * 1000),
    )

    // Clean up old logs every hour
    this.intervals.set(
      "logCleaner",
      setInterval(() => this.cleanupLogs(), 60 * 60 * 1000),
    )

    logger.info("Background services started successfully")
  }

  // Stop all background services
  stopAll() {
    if (!this.isRunning) {
      return
    }

    logger.info("Stopping background services...")

    for (const [name, interval] of this.intervals) {
      clearInterval(interval)
      logger.info(`Stopped ${name} service`)
    }

    this.intervals.clear()
    this.isRunning = false
    logger.info("All background services stopped")
  }

  // Monitor pending transactions and update their status
  async monitorPendingTransactions() {
    try {
      const pendingTransactions = await Transaction.find({ status: "pending" }).limit(50)

      if (pendingTransactions.length === 0) {
        return
      }

      logger.info(`Monitoring ${pendingTransactions.length} pending transactions`)

      const updatePromises = pendingTransactions.map(async (transaction) => {
        try {
          const receipt = await walletService.getTransactionReceipt(transaction.hash, transaction.network)

          if (receipt) {
            transaction.status = receipt.status
            transaction.blockNumber = receipt.blockNumber
            transaction.gasUsed = receipt.gasUsed
            transaction.confirmations = receipt.confirmations

            if (receipt.status === "confirmed") {
              transaction.confirmedAt = new Date()
            }

            await transaction.save()
            logger.info(`Updated transaction ${transaction.hash}: ${receipt.status}`)
          }
        } catch (error) {
          // Check if transaction is very old (>24 hours) and mark as failed
          const twentyFourHoursAgo = new Date()
          twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

          if (transaction.createdAt < twentyFourHoursAgo) {
            transaction.status = "failed"
            transaction.errorMessage = "Transaction timeout - not found on blockchain"
            await transaction.save()
            logger.warn(`Marked old transaction as failed: ${transaction.hash}`)
          }
        }
      })

      await Promise.allSettled(updatePromises)
    } catch (error) {
      logger.error("Transaction monitoring error:", error)
    }
  }

  // Monitor pending invoices for payments
  async monitorPendingInvoices() {
    try {
      const pendingInvoices = await Invoice.findPendingInvoices().limit(20)

      if (pendingInvoices.length === 0) {
        return
      }

      logger.info(`Monitoring ${pendingInvoices.length} pending invoices`)

      const updatePromises = pendingInvoices.map(async (invoice) => {
        try {
          const payment = await blockchainService.checkForPayment(
            invoice.address,
            invoice.chain,
            invoice.token,
            invoice.amount
          )

          if (payment) {
            // Mark invoice as paid
            await invoice.markAsPaid(payment.txHash)

            // Create transaction record
            const transaction = new Transaction({
              userId: invoice.userId,
              hash: payment.txHash,
              fromAddress: payment.from,
              toAddress: invoice.address,
              amount: payment.amount,
              amountInWei: ethers.parseEther(payment.amount).toString(),
              network: invoice.chain,
              tokenAddress: payment.tokenAddress || null,
              tokenSymbol: invoice.token,
              direction: "receive",
              status: "confirmed",
              confirmations: payment.confirmations,
              usdValue: 0, // TODO: calculate USD value
            })

            await transaction.save()

            logger.info(`Invoice ${invoice.invoiceId} marked as paid with tx ${payment.txHash}`)
          }
        } catch (error) {
          logger.error(`Invoice monitoring error for ${invoice.invoiceId}:`, error)
        }
      })

      await Promise.allSettled(updatePromises)
    } catch (error) {
      logger.error("Invoice monitoring error:", error)
    }
  }

  // Update price cache to ensure fresh data
  async updatePriceCache() {
    try {
      logger.info("Updating price cache...")

      // Update prices for major cryptocurrencies
      const majorCoins = ["ethereum", "matic-network", "bitcoin", "binancecoin"]
      await priceService.getPrices(majorCoins, "usd")

      // Clear old cache entries
      priceService.clearCache()

      logger.info("Price cache updated successfully")
    } catch (error) {
      logger.error("Price cache update error:", error)
    }
  }

  // Clean up old log files and temporary data
  async cleanupLogs() {
    try {
      logger.info("Performing log cleanup...")

      // Clean up old transactions (older than 1 year) with failed status
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

      const deletedCount = await Transaction.deleteMany({
        status: "failed",
        createdAt: { $lt: oneYearAgo },
      })

      if (deletedCount.deletedCount > 0) {
        logger.info(`Cleaned up ${deletedCount.deletedCount} old failed transactions`)
      }

      logger.info("Log cleanup completed")
    } catch (error) {
      logger.error("Log cleanup error:", error)
    }
  }

  // Get service status
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeServices: Array.from(this.intervals.keys()),
      startedAt: this.startedAt,
    }
  }
}

module.exports = new BackgroundServices()
