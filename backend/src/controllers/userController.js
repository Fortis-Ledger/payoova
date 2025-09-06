const User = require("../models/User")
const Transaction = require("../models/Transaction")
const Subscription = require("../models/Subscription")
const walletService = require("../services/walletService")
const blockchainService = require("../services/blockchainService")
const logger = require("../config/logger")

class UserController {
  // Get user dashboard data
  static async getDashboard(req, res) {
    try {
      const user = req.user

      // Get wallet information
      const walletInfo = await blockchainService.getWalletInfo(user.walletAddress, user.defaultNetwork)

      // Get recent transactions
      const recentTransactions = await Transaction.findByUser(user._id, { limit: 10 })

      // Get subscription info
      const subscription = await Subscription.findOne({ userId: user._id, status: "active" })

      // Calculate total portfolio value (simplified)
      const portfolioValue = walletInfo.usdValue || 0

      res.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          walletAddress: user.walletAddress,
          defaultNetwork: user.defaultNetwork,
          isVerified: user.isVerified,
          subscription: subscription?.type || "free",
        },
        wallet: walletInfo,
        recentTransactions,
        portfolio: {
          totalValue: portfolioValue,
          currency: user.currency,
        },
        subscription: subscription
          ? {
              type: subscription.type,
              status: subscription.status,
              endDate: subscription.endDate,
              features: subscription.features,
            }
          : null,
      })
    } catch (error) {
      logger.error("Dashboard fetch error:", error)
      res.status(500).json({ error: "Failed to fetch dashboard data" })
    }
  }

  // Update user preferences
  static async updatePreferences(req, res) {
    try {
      const { defaultNetwork, currency, securitySettings } = req.body
      const user = req.user

      // Update preferences
      if (defaultNetwork) user.defaultNetwork = defaultNetwork
      if (currency) user.currency = currency
      if (securitySettings) {
        user.securitySettings = { ...user.securitySettings, ...securitySettings }
      }

      await user.save()

      res.json({
        message: "Preferences updated successfully",
        user: {
          id: user._id,
          defaultNetwork: user.defaultNetwork,
          currency: user.currency,
          securitySettings: user.securitySettings,
        },
      })
    } catch (error) {
      logger.error("Preferences update error:", error)
      res.status(500).json({ error: "Failed to update preferences" })
    }
  }

  // Get user statistics
  static async getStatistics(req, res) {
    try {
      const user = req.user

      // Get transaction statistics
      const [totalTransactions, sentTransactions, receivedTransactions, failedTransactions] = await Promise.all([
        Transaction.countDocuments({ userId: user._id }),
        Transaction.countDocuments({ userId: user._id, type: "send", status: "confirmed" }),
        Transaction.countDocuments({ userId: user._id, type: "receive", status: "confirmed" }),
        Transaction.countDocuments({ userId: user._id, status: "failed" }),
      ])

      // Get monthly transaction volume
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const monthlyTransactions = await Transaction.find({
        userId: user._id,
        createdAt: { $gte: thirtyDaysAgo },
        status: "confirmed",
      })

      const monthlyVolume = monthlyTransactions.reduce((sum, tx) => {
        return sum + (tx.usdValue || 0)
      }, 0)

      res.json({
        transactions: {
          total: totalTransactions,
          sent: sentTransactions,
          received: receivedTransactions,
          failed: failedTransactions,
          successRate: totalTransactions > 0 ? ((totalTransactions - failedTransactions) / totalTransactions) * 100 : 0,
        },
        volume: {
          monthly: monthlyVolume,
          currency: user.currency,
        },
        account: {
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
          isVerified: user.isVerified,
          subscriptionType: user.subscription?.type || "free",
        },
      })
    } catch (error) {
      logger.error("Statistics fetch error:", error)
      res.status(500).json({ error: "Failed to fetch user statistics" })
    }
  }

  // Delete user account
  static async deleteAccount(req, res) {
    try {
      const user = req.user
      const { confirmation } = req.body

      if (confirmation !== "DELETE_MY_ACCOUNT") {
        return res.status(400).json({ error: "Invalid confirmation text" })
      }

      // Check if user has any pending transactions
      const pendingTransactions = await Transaction.countDocuments({
        userId: user._id,
        status: "pending",
      })

      if (pendingTransactions > 0) {
        return res.status(400).json({
          error: "Cannot delete account with pending transactions",
          pendingCount: pendingTransactions,
        })
      }

      // Soft delete - mark as inactive instead of hard delete
      user.isActive = false
      user.email = `deleted_${Date.now()}_${user.email}`
      await user.save()

      logger.info(`User account deleted: ${user._id}`)

      res.json({
        message: "Account deleted successfully",
        deletedAt: new Date(),
      })
    } catch (error) {
      logger.error("Account deletion error:", error)
      res.status(500).json({ error: "Failed to delete account" })
    }
  }

  // Export user data (GDPR compliance)
  static async exportData(req, res) {
    try {
      const user = req.user

      // Get all user data
      const [transactions, subscription] = await Promise.all([
        Transaction.find({ userId: user._id }).lean(),
        Subscription.findOne({ userId: user._id }).lean(),
      ])

      const exportData = {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          walletAddress: user.walletAddress,
          defaultNetwork: user.defaultNetwork,
          currency: user.currency,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
          isVerified: user.isVerified,
          securitySettings: user.securitySettings,
        },
        transactions,
        subscription,
        exportedAt: new Date(),
      }

      res.setHeader("Content-Type", "application/json")
      res.setHeader("Content-Disposition", `attachment; filename="user-data-${user._id}.json"`)
      res.json(exportData)

      logger.info(`Data export requested by user: ${user._id}`)
    } catch (error) {
      logger.error("Data export error:", error)
      res.status(500).json({ error: "Failed to export user data" })
    }
  }
}

module.exports = UserController
