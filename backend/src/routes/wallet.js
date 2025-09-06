const express = require("express")
const WalletController = require("../controllers/walletController")
const { authenticateUser, optionalAuth } = require("../middleware/auth")
const { validateWalletSend, validateAddress } = require("../middleware/validation")
const { transactionLimiter, balanceLimiter } = require("../middleware/rateLimiting")

const router = express.Router()

// Public routes (no authentication required)
router.get("/balance/:address", balanceLimiter, validateAddress, WalletController.getBalance)
router.get("/token/:address/:tokenAddress", balanceLimiter, validateAddress, WalletController.getTokenBalance)
router.get("/validate/:address", validateAddress, WalletController.validateAddress)
router.get("/popular-tokens", WalletController.getPopularTokens)
router.get("/network-info", WalletController.getNetworkInfo)

// Protected routes (require authentication)
router.use(authenticateUser)

// Wallet information
router.get("/info", WalletController.getWalletInfo)
router.get("/portfolio", WalletController.getPortfolio)

// Transaction operations
router.post("/send", transactionLimiter, validateWalletSend, WalletController.sendNativeCurrency)
router.post("/send-token", transactionLimiter, WalletController.sendToken)
router.post("/estimate-gas", WalletController.estimateGas)

module.exports = router
