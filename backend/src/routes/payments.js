const express = require("express")
const PaymentController = require("../controllers/paymentController")
const { authenticateUser } = require("../middleware/auth")
const { validateCreatePayment } = require("../middleware/validation")

const router = express.Router()

// Protected routes (require authentication)
router.use(authenticateUser)

// Create payment link
router.post("/create", validateCreatePayment, PaymentController.createPayment)

// Get payment status
router.get("/:invoiceId", PaymentController.getPaymentStatus)

module.exports = router