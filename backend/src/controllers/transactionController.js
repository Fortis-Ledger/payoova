const Transaction = require("../models/Transaction")
const walletService = require("../services/walletService")
const blockchainService = require("../services/blockchainService")
const logger = require("../config/logger")

class TransactionController {
  // Get user's transaction history
  static async getTransactionHistory(req, res) {
    try {
      const user = req.user
      const { page = 1, limit = 20, status, type, network, startDate, endDate } = req.query

      const skip = (page - 1) * limit
      const query = { userId: user._id }

      // Apply filters
      if (status) query.status = status
      if (type) query.type = type
      if (network) query.network = network

      if (startDate || endDate) {
        query.createdAt = {}
        if (startDate) query.createdAt.$gte = new Date(startDate)
        if (endDate) query.createdAt.$lte = new Date(endDate)
      }

      const [transactions, total] = await Promise.all([
        Transaction.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number.parseInt(limit)).lean(),
        Transaction.countDocuments(query),
      ])

      res.json({
        transactions,
        pagination: {
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
        filters: {
          status,
          type,
          network,
          startDate,
          endDate,
        },
      })
    } catch (error) {
      logger.error("Transaction history fetch error:", error)
      res.status(500).json({ error: "Failed to fetch transaction history" })
    }
  }

  // Get specific transaction details
  static async getTransaction(req, res) {
    try {
      const user = req.user
      const { txHash } = req.params

      const transaction = await Transaction.findOne({
        $or: [
          { userId: user._id, hash: txHash },
          { fromAddress: user.walletAddress, hash: txHash },
          { toAddress: user.walletAddress, hash: txHash },
        ],
      })

      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" })
      }

      // Get latest blockchain status
      try {
        const receipt = await walletService.getTransactionReceipt(txHash, transaction.network)
        if (receipt && transaction.status === "pending") {
          // Update transaction status
          transaction.status = receipt.status
          transaction.blockNumber = receipt.blockNumber
          transaction.gasUsed = receipt.gasUsed
          transaction.confirmations = receipt.confirmations
          transaction.confirmedAt = new Date()
          await transaction.save()
        }
      } catch (receiptError) {
        logger.warn(`Failed to fetch receipt for ${txHash}:`, receiptError)
      }

      res.json({
        transaction,
        isUserTransaction: transaction.userId?.toString() === user._id.toString(),
      })
    } catch (error) {
      logger.error("Transaction fetch error:", error)
      res.status(500).json({ error: "Failed to fetch transaction" })
    }
  }

  // Get transaction statistics for user
  static async getTransactionStats(req, res) {
    try {
      const user = req.user
      const { days = 30 } = req.query

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - Number.parseInt(days))

      const stats = await Transaction.aggregate([
        {
          $match: {
            userId: user._id,
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              status: "$status",
              type: "$type",
              network: "$network",
            },
            count: { $sum: 1 },
            totalValue: { $sum: { $ifNull: ["$usdValue", 0] } },
          },
        },
      ])

      // Calculate summary statistics
      const summary = {
        totalTransactions: 0,
        totalValue: 0,
        byStatus: {},
        byType: {},
        byNetwork: {},
      }

      stats.forEach((stat) => {
        summary.totalTransactions += stat.count
        summary.totalValue += stat.totalValue

        // Group by status
        if (!summary.byStatus[stat._id.status]) {
          summary.byStatus[stat._id.status] = { count: 0, value: 0 }
        }
        summary.byStatus[stat._id.status].count += stat.count
        summary.byStatus[stat._id.status].value += stat.totalValue

        // Group by type
        if (!summary.byType[stat._id.type]) {
          summary.byType[stat._id.type] = { count: 0, value: 0 }
        }
        summary.byType[stat._id.type].count += stat.count
        summary.byType[stat._id.type].value += stat.totalValue

        // Group by network
        if (!summary.byNetwork[stat._id.network]) {
          summary.byNetwork[stat._id.network] = { count: 0, value: 0 }
        }
        summary.byNetwork[stat._id.network].count += stat.count
        summary.byNetwork[stat._id.network].value += stat.totalValue
      })

      res.json({
        period: {
          days: Number.parseInt(days),
          startDate,
          endDate: new Date(),
        },
        summary,
        currency: user.currency,
      })
    } catch (error) {
      logger.error("Transaction stats error:", error)
      res.status(500).json({ error: "Failed to fetch transaction statistics" })
    }
  }

  // Monitor pending transactions
  static async monitorTransaction(req, res) {
    try {
      const user = req.user
      const { txHash } = req.params

      const transaction = await Transaction.findOne({
        userId: user._id,
        hash: txHash,
        status: "pending",
      })

      if (!transaction) {
        return res.status(404).json({ error: "Pending transaction not found" })
      }

      // Monitor the transaction
      const result = await blockchainService.monitorTransaction(
        txHash,
        transaction.network,
        60000, // 1 minute timeout
      )

      // Update transaction status
      if (result.status === "confirmed") {
        transaction.status = "confirmed"
        transaction.blockNumber = result.blockNumber
        transaction.gasUsed = result.gasUsed
        transaction.confirmations = result.confirmations
        transaction.confirmedAt = new Date()
        await transaction.save()
      } else if (result.status === "failed") {
        transaction.status = "failed"
        transaction.errorMessage = "Transaction failed on blockchain"
        await transaction.save()
      }

      res.json({
        hash: txHash,
        status: result.status,
        blockNumber: result.blockNumber,
        confirmations: result.confirmations,
        gasUsed: result.gasUsed,
        updatedAt: new Date(),
      })
    } catch (error) {
      logger.error("Transaction monitoring error:", error)
      res.status(500).json({ error: "Failed to monitor transaction" })
    }
  }

  // Webhook for transaction confirmations (for external services)
  static async transactionWebhook(req, res) {
    try {
      const { txHash, status, blockNumber, gasUsed, network } = req.body

      // Verify webhook authenticity (implement your own verification)
      const webhookSecret = req.headers["x-webhook-secret"]
      if (webhookSecret !== process.env.WEBHOOK_SECRET) {
        return res.status(401).json({ error: "Unauthorized webhook" })
      }

      const transaction = await Transaction.findOne({ hash: txHash, network })

      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" })
      }

      // Update transaction status
      transaction.status = status
      if (blockNumber) transaction.blockNumber = blockNumber
      if (gasUsed) transaction.gasUsed = gasUsed
      if (status === "confirmed") transaction.confirmedAt = new Date()

      await transaction.save()

      logger.info(`Transaction ${txHash} updated via webhook: ${status}`)

      res.json({ message: "Transaction updated successfully" })
    } catch (error) {
      logger.error("Webhook processing error:", error)
      res.status(500).json({ error: "Failed to process webhook" })
    }
  }
}

module.exports = TransactionController
