const { v4: uuidv4 } = require("uuid")
const qrcode = require("qrcode")
const Invoice = require("../models/Invoice")
const User = require("../models/User")
const logger = require("../config/logger")

class PaymentController {
  // Create payment link
  static async createPayment(req, res) {
    try {
      const user = req.user
      const { chain, token, amount, memo, expiresInMinutes = 60 } = req.body

      // Get user's wallet address for the chain
      const walletAddress = chain === "bnb" ? user.wallets.bnb.address : user.wallets.eth.address

      // Generate invoice ID
      const invoiceId = uuidv4()

      // Calculate expiration
      const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000)

      // Create invoice
      const invoice = new Invoice({
        invoiceId,
        userId: user._id,
        chain,
        token,
        amount,
        address: walletAddress,
        memo,
        expiresAt,
      })

      await invoice.save()

      // Generate payment URL
      const payUrl = `${process.env.FRONTEND_URL}/pay/${invoiceId}`

      // Generate QR code
      const qrCodeData = await qrcode.toDataURL(payUrl)

      logger.info(`Payment link created: ${invoiceId} by user ${user._id}`)

      res.json({
        invoiceId,
        payUrl,
        qrPngBase64: qrCodeData,
        address: walletAddress,
      })
    } catch (error) {
      logger.error("Create payment error:", error)
      res.status(500).json({ error: "Failed to create payment link" })
    }
  }

  // Get payment status
  static async getPaymentStatus(req, res) {
    try {
      const { invoiceId } = req.params

      const invoice = await Invoice.findByInvoiceId(invoiceId)

      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" })
      }

      // Check if expired
      if (invoice.status === "pending" && new Date() > invoice.expiresAt) {
        await invoice.markAsExpired()
        invoice.status = "expired"
      }

      res.json({
        invoiceId: invoice.invoiceId,
        status: invoice.status,
        chain: invoice.chain,
        token: invoice.token,
        amount: invoice.amount,
        address: invoice.address,
        memo: invoice.memo,
        txHash: invoice.txHash,
        expiresAt: invoice.expiresAt,
        createdAt: invoice.createdAt,
      })
    } catch (error) {
      logger.error("Get payment status error:", error)
      res.status(500).json({ error: "Failed to fetch payment status" })
    }
  }
}

module.exports = PaymentController