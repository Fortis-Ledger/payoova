const express = require("express")
const TransactionController = require("../controllers/transactionController")
const { authenticateUser } = require("../middleware/auth")
const { validateUserId } = require("../middleware/validation")

const router = express.Router()

// Webhook endpoint (no auth required, but verified internally)
router.post("/webhook", TransactionController.transactionWebhook)

// Protected routes (require authentication)
router.use(authenticateUser)

// Transaction history and details
router.get("/history", TransactionController.getTransactionHistory)
router.get("/stats", TransactionController.getTransactionStats)
router.get("/:txHash", TransactionController.getTransaction)
router.post("/:txHash/monitor", TransactionController.monitorTransaction)

module.exports = router
