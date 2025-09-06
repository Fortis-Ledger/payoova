const mongoose = require("mongoose")

const invoiceSchema = new mongoose.Schema(
  {
    // Invoice identifier
    invoiceId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // User reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Blockchain information
    chain: {
      type: String,
      enum: ["ethereum", "polygon", "bnb"],
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true, // e.g., "ETH", "USDT", "USDC"
    },

    // Payment details
    amount: {
      type: String, // Use string to avoid precision issues
      required: true,
    },
    address: {
      type: String,
      required: true,
      match: /^0x[a-fA-F0-9]{40}$/,
      index: true,
    },

    // Additional info
    memo: {
      type: String,
      default: null,
    },

    // Status
    status: {
      type: String,
      enum: ["pending", "paid", "expired", "cancelled"],
      default: "pending",
      index: true,
    },

    // Transaction hash when paid
    txHash: {
      type: String,
      default: null,
      index: true,
    },

    // Expiration
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for performance
invoiceSchema.index({ userId: 1, createdAt: -1 })
invoiceSchema.index({ status: 1, expiresAt: 1 })
invoiceSchema.index({ chain: 1, status: 1 })

// Instance methods
invoiceSchema.methods.markAsPaid = function (txHash) {
  this.status = "paid"
  this.txHash = txHash
  return this.save()
}

invoiceSchema.methods.markAsExpired = function () {
  this.status = "expired"
  return this.save()
}

// Static methods
invoiceSchema.statics.findByInvoiceId = function (invoiceId) {
  return this.findOne({ invoiceId })
}

invoiceSchema.statics.findPendingInvoices = function () {
  return this.find({ status: "pending" })
}

invoiceSchema.statics.findExpiredInvoices = function () {
  return this.find({
    status: "pending",
    expiresAt: { $lt: new Date() },
  })
}

module.exports = mongoose.model("Invoice", invoiceSchema)