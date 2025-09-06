const mongoose = require("mongoose")

const transactionSchema = new mongoose.Schema(
  {
    // User reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Transaction identifiers
    hash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    blockNumber: {
      type: Number,
      index: true,
    },
    blockHash: String,
    transactionIndex: Number,

    // Addresses
    fromAddress: {
      type: String,
      required: true,
      match: /^0x[a-fA-F0-9]{40}$/,
      index: true,
    },
    toAddress: {
      type: String,
      required: true,
      match: /^0x[a-fA-F0-9]{40}$/,
      index: true,
    },

    // Transaction details
    amount: {
      type: String, // Use string to avoid precision issues
      required: true,
    },
    amountInWei: {
      type: String,
      required: true,
    },
    gasPrice: String,
    gasUsed: String,
    gasLimit: String,
    nonce: Number,

    // Network and token information
    network: {
      type: String,
      enum: ["ethereum", "polygon", "sepolia", "mumbai"],
      required: true,
      index: true,
    },
    tokenAddress: {
      type: String,
      match: /^0x[a-fA-F0-9]{40}$/,
      default: null, // null for native currency (ETH/MATIC)
    },
    tokenSymbol: {
      type: String,
      default: null,
    },
    tokenDecimals: {
      type: Number,
      default: 18,
    },

    // Transaction direction
    direction: {
      type: String,
      enum: ["send", "receive"],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "failed", "cancelled"],
      default: "pending",
      index: true,
    },
    confirmations: {
      type: Number,
      default: 0,
    },

    // USD value at time of transaction
    usdValue: {
      type: Number,
      default: null,
    },
    exchangeRate: {
      type: Number,
      default: null,
    },

    // Transaction metadata
    description: String,
    tags: [String],
    isInternal: {
      type: Boolean,
      default: false, // Internal transfers between platform users
    },

    // Error information (for failed transactions)
    errorMessage: String,
    errorCode: String,

    // Timestamps
    blockTimestamp: Date,
    confirmedAt: Date,
  },
  {
    timestamps: true,
  },
)

// Compound indexes for efficient queries
transactionSchema.index({ userId: 1, createdAt: -1 })
transactionSchema.index({ userId: 1, direction: 1, status: 1 })
transactionSchema.index({ fromAddress: 1, toAddress: 1 })
transactionSchema.index({ network: 1, status: 1 })
transactionSchema.index({ blockNumber: 1, network: 1 })
transactionSchema.index({ hash: 1, network: 1 })

// Instance methods
transactionSchema.methods.markAsConfirmed = function (blockNumber, gasUsed) {
  this.status = "confirmed"
  this.blockNumber = blockNumber
  this.gasUsed = gasUsed
  this.confirmedAt = new Date()
  return this.save()
}

transactionSchema.methods.markAsFailed = function (errorMessage) {
  this.status = "failed"
  this.errorMessage = errorMessage
  return this.save()
}

// Static methods
transactionSchema.statics.findByUser = function (userId, options = {}) {
  const query = this.find({ userId })

  if (options.status) query.where("status").equals(options.status)
  if (options.direction) query.where("direction").equals(options.direction)
  if (options.network) query.where("network").equals(options.network)

  return query.sort({ createdAt: -1 }).limit(options.limit || 50)
}

transactionSchema.statics.findByHash = function (hash, network) {
  return this.findOne({ hash, network })
}

transactionSchema.statics.getPendingTransactions = function (network) {
  return this.find({ status: "pending", network })
}

module.exports = mongoose.model("Transaction", transactionSchema)
