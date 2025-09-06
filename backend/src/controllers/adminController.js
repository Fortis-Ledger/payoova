const User = require("../models/User")
const Transaction = require("../models/Transaction")
const Subscription = require("../models/Subscription")
const logger = require("../config/logger")

class AdminController {
  // Middleware to check admin permissions
  static async checkAdminPermissions(req, res, next) {
    try {
      const user = req.user

      // Check if user has admin role (you can implement role-based access)
      const adminEmails = (process.env.ADMIN_EMAILS || "").split(",")

      if (!adminEmails.includes(user.email)) {
        return res.status(403).json({ error: "Admin access required" })
      }

      next()
    } catch (error) {
      logger.error("Admin permission check error:", error)
      res.status(500).json({ error: "Permission check failed" })
    }
  }

  // Get platform statistics
  static async getPlatformStats(req, res) {
    try {
      const [totalUsers, activeUsers, totalTransactions, pendingTransactions, totalVolume, premiumUsers] =
        await Promise.all([
          User.countDocuments({}),
          User.countDocuments({ isActive: true }),
          Transaction.countDocuments({}),
          Transaction.countDocuments({ status: "pending" }),
          Transaction.aggregate([
            { $match: { status: "confirmed", usdValue: { $exists: true } } },
            { $group: { _id: null, total: { $sum: "$usdValue" } } },
          ]),
          Subscription.countDocuments({ status: "active", type: { $ne: "free" } }),
        ])

      // Get recent activity
      const recentUsers = await User.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("email name createdAt walletAddress")

      const recentTransactions = await Transaction.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("userId", "email name")

      res.json({
        stats: {
          users: {
            total: totalUsers,
            active: activeUsers,
            premium: premiumUsers,
          },
          transactions: {
            total: totalTransactions,
            pending: pendingTransactions,
          },
          volume: {
            total: totalVolume[0]?.total || 0,
            currency: "USD",
          },
        },
        recent: {
          users: recentUsers,
          transactions: recentTransactions,
        },
      })
    } catch (error) {
      logger.error("Platform stats error:", error)
      res.status(500).json({ error: "Failed to fetch platform statistics" })
    }
  }

  // Get all users with pagination
  static async getUsers(req, res) {
    try {
      const { page = 1, limit = 20, search, status } = req.query
      const skip = (page - 1) * limit

      // Build query
      const query = {}
      if (search) {
        query.$or = [
          { email: { $regex: search, $options: "i" } },
          { name: { $regex: search, $options: "i" } },
          { walletAddress: { $regex: search, $options: "i" } },
        ]
      }
      if (status) {
        query.isActive = status === "active"
      }

      const [users, total] = await Promise.all([
        User.find(query)
          .select("-encryptedPrivateKey")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number.parseInt(limit)),
        User.countDocuments(query),
      ])

      res.json({
        users,
        pagination: {
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      })
    } catch (error) {
      logger.error("Users fetch error:", error)
      res.status(500).json({ error: "Failed to fetch users" })
    }
  }

  // Update user status
  static async updateUserStatus(req, res) {
    try {
      const { userId } = req.params
      const { isActive, isVerified } = req.body

      const user = await User.findById(userId)
      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      if (typeof isActive === "boolean") user.isActive = isActive
      if (typeof isVerified === "boolean") user.isVerified = isVerified

      await user.save()

      logger.info(`User ${userId} status updated by admin`)

      res.json({
        message: "User status updated successfully",
        user: {
          id: user._id,
          email: user.email,
          isActive: user.isActive,
          isVerified: user.isVerified,
        },
      })
    } catch (error) {
      logger.error("User status update error:", error)
      res.status(500).json({ error: "Failed to update user status" })
    }
  }

  // Get transaction analytics
  static async getTransactionAnalytics(req, res) {
    try {
      const { days = 30 } = req.query
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - Number.parseInt(days))

      // Daily transaction counts
      const dailyStats = await Transaction.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              status: "$status",
            },
            count: { $sum: 1 },
            volume: { $sum: { $ifNull: ["$usdValue", 0] } },
          },
        },
        { $sort: { "_id.date": 1 } },
      ])

      // Network distribution
      const networkStats = await Transaction.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: "$network",
            count: { $sum: 1 },
            volume: { $sum: { $ifNull: ["$usdValue", 0] } },
          },
        },
      ])

      res.json({
        period: {
          days: Number.parseInt(days),
          startDate,
          endDate: new Date(),
        },
        daily: dailyStats,
        networks: networkStats,
      })
    } catch (error) {
      logger.error("Transaction analytics error:", error)
      res.status(500).json({ error: "Failed to fetch transaction analytics" })
    }
  }
}

module.exports = AdminController
