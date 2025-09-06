const express = require("express")
const PriceController = require("../controllers/priceController")
const { optionalAuth } = require("../middleware/auth")
const { balanceLimiter } = require("../middleware/rateLimiting")

const router = express.Router()

// Public price endpoints with rate limiting
router.get("/current", balanceLimiter, PriceController.getCurrentPrices)
router.get("/current/:coinId", balanceLimiter, PriceController.getPrice)
router.get("/historical/:coinId", balanceLimiter, PriceController.getHistoricalPrices)
router.get("/supported-coins", PriceController.getSupportedCoins)
router.post("/convert", balanceLimiter, PriceController.convertCurrency)

// Protected endpoints (optional auth for personalized features)
router.use(optionalAuth)
router.get("/portfolio-value", PriceController.getPortfolioValue)

module.exports = router
