const priceService = require("../services/priceService")
const walletService = require("../services/walletService")
const logger = require("../config/logger")

class PriceController {
  // Get current prices for multiple cryptocurrencies
  static async getCurrentPrices(req, res) {
    try {
      const { symbols = "eth,usdt,usdc,bnb", currency = "usd" } = req.query
      const symbolsList = symbols.split(",").map((symbol) => symbol.trim().toLowerCase())
      const coinIds = symbolsList.map((symbol) => PriceController.mapSymbolToCoinId(symbol))

      const prices = await priceService.getPrices(coinIds, currency)

      res.json({
        prices,
        currency: currency.toUpperCase(),
        timestamp: new Date(),
      })
    } catch (error) {
      logger.error("Current prices fetch error:", error)
      res.status(500).json({ error: "Failed to fetch current prices" })
    }
  }

  // Map symbol to CoinGecko coin ID
  static mapSymbolToCoinId(symbol) {
    const symbolMap = {
      eth: "ethereum",
      usdt: "tether",
      usdc: "usd-coin",
      bnb: "binancecoin",
      matic: "matic-network",
    }
    return symbolMap[symbol] || symbol
  }

  // Get price for a specific cryptocurrency
  static async getPrice(req, res) {
    try {
      const { coinId } = req.params
      const { currency = "usd" } = req.query

      const price = await priceService.getPrice(coinId, currency)

      if (!price) {
        return res.status(404).json({ error: "Price not found for the specified coin" })
      }

      res.json({
        coinId,
        price,
        currency: currency.toUpperCase(),
        timestamp: new Date(),
      })
    } catch (error) {
      logger.error("Price fetch error:", error)
      res.status(500).json({ error: "Failed to fetch price" })
    }
  }

  // Get historical prices
  static async getHistoricalPrices(req, res) {
    try {
      const { coinId } = req.params
      const { days = 7, currency = "usd" } = req.query

      const historicalData = await priceService.getHistoricalPrices(coinId, Number.parseInt(days), currency)

      res.json({
        coinId,
        currency: currency.toUpperCase(),
        days: Number.parseInt(days),
        data: historicalData,
        timestamp: new Date(),
      })
    } catch (error) {
      logger.error("Historical prices fetch error:", error)
      res.status(500).json({ error: "Failed to fetch historical prices" })
    }
  }

  // Get supported cryptocurrencies
  static async getSupportedCoins(req, res) {
    try {
      const coins = await priceService.getSupportedCoins()

      res.json({
        count: coins.length,
        coins: coins.slice(0, 100), // Limit to first 100 for performance
        timestamp: new Date(),
      })
    } catch (error) {
      logger.error("Supported coins fetch error:", error)
      res.status(500).json({ error: "Failed to fetch supported coins" })
    }
  }

  // Convert currency amounts
  static async convertCurrency(req, res) {
    try {
      const { amount, fromCoin, toCurrency = "usd" } = req.body

      if (!amount || !fromCoin) {
        return res.status(400).json({ error: "Amount and fromCoin are required" })
      }

      const convertedAmount = await priceService.convertAmount(Number.parseFloat(amount), fromCoin, toCurrency)

      res.json({
        originalAmount: Number.parseFloat(amount),
        fromCoin,
        toCurrency: toCurrency.toUpperCase(),
        convertedAmount,
        timestamp: new Date(),
      })
    } catch (error) {
      logger.error("Currency conversion error:", error)
      res.status(500).json({ error: "Failed to convert currency" })
    }
  }

  // Get portfolio value (requires authentication)
  static async getPortfolioValue(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" })
      }

      const user = req.user
      const { currency = user.currency } = req.query
      const networks = ["ethereum", "polygon"]

      const portfolioPromises = networks.map(async (network) => {
        try {
          const balance = await walletService.getBalance(user.walletAddress, network)
          const coinId = priceService.getNetworkCoinId(network)
          const convertedValue = await priceService.convertAmount(Number.parseFloat(balance.balance), coinId, currency)

          return {
            network,
            balance: balance.balance,
            currency: balance.currency,
            value: convertedValue,
            targetCurrency: currency.toUpperCase(),
          }
        } catch (error) {
          logger.warn(`Portfolio value calculation failed for ${network}:`, error)
          return {
            network,
            balance: "0",
            value: 0,
            error: "Failed to calculate value",
          }
        }
      })

      const portfolio = await Promise.all(portfolioPromises)
      const totalValue = portfolio.reduce((sum, item) => sum + (item.value || 0), 0)

      res.json({
        walletAddress: user.walletAddress,
        totalValue,
        currency: currency.toUpperCase(),
        breakdown: portfolio,
        timestamp: new Date(),
      })
    } catch (error) {
      logger.error("Portfolio value calculation error:", error)
      res.status(500).json({ error: "Failed to calculate portfolio value" })
    }
  }
}

module.exports = PriceController
