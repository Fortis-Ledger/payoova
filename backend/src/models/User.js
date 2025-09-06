const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema(
  {
    // Firebase integration
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    picture: {
      type: String,
      default: null,
    },

    // Wallet information
    wallets: {
      eth: {
        address: {
          type: String,
          match: /^0x[a-fA-F0-9]{40}$/,
        },
        encryptedPrivateKey: {
          type: String,
          select: false,
        },
      },
      bnb: {
        address: {
          type: String,
          match: /^0x[a-fA-F0-9]{40}$/,
        },
        encryptedPrivateKey: {
          type: String,
          select: false,
        },
      },
    },

    // User preferences
    defaultNetwork: {
      type: String,
      enum: ["ethereum", "polygon", "sepolia", "mumbai"],
      default: "ethereum",
    },
    currency: {
      type: String,
      enum: ["USD", "EUR", "GBP", "BTC", "ETH"],
      default: "USD",
    },

    // Account status
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    kycStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },

    // Subscription information
    subscription: {
      type: {
        type: String,
        enum: ["free", "premium", "enterprise"],
        default: "free",
      },
      startDate: Date,
      endDate: Date,
      isActive: {
        type: Boolean,
        default: false,
      },
    },

    // Security settings
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    securitySettings: {
      requireConfirmationForLargeTransactions: {
        type: Boolean,
        default: true,
      },
      maxDailyTransactionLimit: {
        type: Number,
        default: 10000, // USD equivalent
      },
    },

    // Metadata
    metadata: {
      signupSource: String,
      referralCode: String,
      ipAddress: String,
      userAgent: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.wallets?.eth?.encryptedPrivateKey
        delete ret.wallets?.bnb?.encryptedPrivateKey
        delete ret.__v
        return ret
      },
    },
  },
)

// Indexes for performance
userSchema.index({ firebaseUid: 1 })
userSchema.index({ email: 1 })
userSchema.index({ "wallets.eth.address": 1 })
userSchema.index({ "wallets.bnb.address": 1 })
userSchema.index({ createdAt: -1 })
userSchema.index({ "subscription.type": 1, "subscription.isActive": 1 })

// Instance methods
userSchema.methods.updateLastLogin = function () {
  this.lastLoginAt = new Date()
  return this.save()
}

userSchema.methods.isPremiumUser = function () {
  return this.subscription.type !== "free" && this.subscription.isActive
}

// Static methods
userSchema.statics.findByFirebaseUid = function (firebaseUid) {
  return this.findOne({ firebaseUid })
}

userSchema.statics.findByWalletAddress = function (address) {
  return this.findOne({ walletAddress: address.toLowerCase() })
}

module.exports = mongoose.model("User", userSchema)
