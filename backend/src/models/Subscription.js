const mongoose = require("mongoose")

const subscriptionSchema = new mongoose.Schema(
  {
    // User reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Subscription details
    type: {
      type: String,
      enum: ["free", "premium", "enterprise"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired", "pending"],
      default: "pending",
      index: true,
    },

    // Billing information
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
    price: {
      amount: Number,
      currency: {
        type: String,
        default: "USD",
      },
    },

    // Subscription period
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    nextBillingDate: Date,

    // Payment information
    paymentMethod: {
      type: String,
      enum: ["stripe", "crypto", "paypal"],
    },
    paymentId: String, // External payment system ID
    lastPaymentDate: Date,
    lastPaymentAmount: Number,

    // Features and limits
    features: {
      maxTransactionsPerMonth: {
        type: Number,
        default: 100,
      },
      maxWallets: {
        type: Number,
        default: 1,
      },
      advancedAnalytics: {
        type: Boolean,
        default: false,
      },
      prioritySupport: {
        type: Boolean,
        default: false,
      },
      apiAccess: {
        type: Boolean,
        default: false,
      },
    },

    // Usage tracking
    usage: {
      transactionsThisMonth: {
        type: Number,
        default: 0,
      },
      lastResetDate: {
        type: Date,
        default: Date.now,
      },
    },

    // Cancellation information
    cancelledAt: Date,
    cancellationReason: String,
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
subscriptionSchema.index({ userId: 1, status: 1 })
subscriptionSchema.index({ endDate: 1, status: 1 })
subscriptionSchema.index({ nextBillingDate: 1, status: 1 })

// Instance methods
subscriptionSchema.methods.isActive = function () {
  return this.status === "active" && this.endDate > new Date()
}

subscriptionSchema.methods.cancel = function (reason) {
  this.status = "cancelled"
  this.cancelledAt = new Date()
  this.cancellationReason = reason
  return this.save()
}

subscriptionSchema.methods.renew = function (endDate) {
  this.endDate = endDate
  this.nextBillingDate = endDate
  this.status = "active"
  return this.save()
}

// Static methods
subscriptionSchema.statics.findActiveSubscriptions = function () {
  return this.find({
    status: "active",
    endDate: { $gt: new Date() },
  })
}

subscriptionSchema.statics.findExpiringSubscriptions = function (days = 7) {
  const expirationDate = new Date()
  expirationDate.setDate(expirationDate.getDate() + days)

  return this.find({
    status: "active",
    endDate: { $lte: expirationDate, $gt: new Date() },
  })
}

module.exports = mongoose.model("Subscription", subscriptionSchema)
