const mongoose = require("mongoose")

const walletSchema = new mongoose.Schema(
  {
    // User reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // Wallet addresses for different networks
    addresses: {
      ethereum: {
        address: {
          type: String,
          match: /^0x[a-fA-F0-9]{40}$/,
        },
        encryptedPrivateKey: {
          type: String,
          select: false,
        },
      },
      polygon: {
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

    // Cached balances (updated periodically)
    balances: {
      ethereum: {
        native: {
          balance: String,
          balanceInWei: String,
          usdValue: Number,
          lastUpdated: Date,
        },
        tokens: [
          {
            address: String,
            symbol: String,
            name: String,
            decimals: Number,
            balance: String,
            balanceInWei: String,
            usdValue: Number,
            lastUpdated: Date,
          },
        ],
      },
      polygon: {
        native: {
          balance: String,
          balanceInWei: String,
          usdValue: Number,
          lastUpdated: Date,
        },
        tokens: [
          {
            address: String,
            symbol: String,
            name: String,
            decimals: Number,
            balance: String,
            balanceInWei: String,
            usdValue: Number,
            lastUpdated: Date,
          },
        ],
      },
    },

    // Wallet settings
    settings: {
      autoRefreshBalances: {
        type: Boolean,
        default: true,
      },
      refreshInterval: {
        type: Number,
        default: 300000, // 5 minutes in milliseconds
      },
      hideSmallBalances: {
        type: Boolean,
        default: false,
      },
      smallBalanceThreshold: {
        type: Number,
        default: 1, // USD
      },
    },

    // Security
    isLocked: {
      type: Boolean,
      default: false,
    },
    lockReason: String,
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
walletSchema.index({ userId: 1 })
walletSchema.index({ "addresses.ethereum.address": 1 })
walletSchema.index({ "addresses.polygon.address": 1 })

// Instance methods
walletSchema.methods.updateBalance = function (network, balanceData) {
  if (!this.balances[network]) {
    this.balances[network] = { native: {}, tokens: [] }
  }

  this.balances[network].native = {
    ...balanceData,
    lastUpdated: new Date(),
  }

  return this.save()
}

walletSchema.methods.addTokenBalance = function (network, tokenData) {
  if (!this.balances[network]) {
    this.balances[network] = { native: {}, tokens: [] }
  }

  const existingTokenIndex = this.balances[network].tokens.findIndex(
    (token) => token.address.toLowerCase() === tokenData.address.toLowerCase(),
  )

  if (existingTokenIndex >= 0) {
    this.balances[network].tokens[existingTokenIndex] = {
      ...tokenData,
      lastUpdated: new Date(),
    }
  } else {
    this.balances[network].tokens.push({
      ...tokenData,
      lastUpdated: new Date(),
    })
  }

  return this.save()
}

// Static methods
walletSchema.statics.findByAddress = function (address, network) {
  const query = {}
  query[`addresses.${network}.address`] = address.toLowerCase()
  return this.findOne(query)
}

module.exports = mongoose.model("Wallet", walletSchema)
