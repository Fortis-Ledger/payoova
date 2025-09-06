const axios = require("axios")
const logger = require("../config/logger")

class PriceService {
  constructor() {
    this.baseURL = "https://api.coingecko.com/api/v3"
    this.cache = new Map()
    this.cacheTimeout = 60 * 1000 // 60 seconds
  }

  /**
   * Get cryptocurrency prices
   * @param {Array} coinIds - Array of CoinGecko coin IDs
   * @param {string} vsCurrency - Currency to get prices in
   * @returns {Object} Price data
   */
  async getPrices(coinIds = ["ethereum", "matic-network"], vsCurrency = "usd") {
    try {
      const cacheKey = `prices_${coinIds.join(",")}_${vsCurrency}`
      const cached = this.cache.get(cacheKey)

      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data
      }

      const response = await axios.get(`${this.baseURL}/simple/price`, {
        params: {
          ids: coinIds.join(","),
          vs_currencies: vsCurrency,
          include_24hr_change: true,
          include_market_cap: true,
          include_24hr_vol: true,
        },
        timeout: 10000,
      })

      const priceData = response.data

      // Cache the result
      this.cache.set(cacheKey, {
        data: priceData,
        timestamp: Date.now(),
      })

      logger.info(`Fetched prices for ${coinIds.length} coins`)
      return priceData
    } catch (error) {
      logger.error("Price fetch error:", error)

      // Return cached data if available, even if expired
      const cacheKey = `prices_${coinIds.join(",")}_${vsCurrency}`
      const cached = this.cache.get(cacheKey)
      if (cached) {
        logger.warn("Using expired price cache due to API error")
        return cached.data
      }

      throw new Error("Failed to fetch cryptocurrency prices")
    }
  }

  /**
   * Get price for a specific cryptocurrency
   * @param {string} coinId - CoinGecko coin ID
   * @param {string} vsCurrency - Currency to get price in
   * @returns {Object} Price data for single coin
   */
  async getPrice(coinId, vsCurrency = "usd") {
    const prices = await this.getPrices([coinId], vsCurrency)
    return prices[coinId] || null
  }

  /**
   * Convert amount from one currency to another using current rates
   * @param {number} amount - Amount to convert
   * @param {string} fromCoin - Source coin ID
   * @param {string} toCurrency - Target currency
   * @returns {number} Converted amount
   */
  async convertAmount(amount, fromCoin, toCurrency = "usd") {
    try {
      const priceData = await this.getPrice(fromCoin, toCurrency)
      if (!priceData || !priceData[toCurrency]) {
        throw new Error(`Price not available for ${fromCoin} in ${toCurrency}`)
      }

      return amount * priceData[toCurrency]
    } catch (error) {
      logger.error("Currency conversion error:", error)
      throw new Error("Failed to convert currency")
    }
  }

  /**
   * Get historical price data
   * @param {string} coinId - CoinGecko coin ID
   * @param {number} days - Number of days of history
   * @param {string} vsCurrency - Currency to get prices in
   * @returns {Array} Historical price data
   */
  async getHistoricalPrices(coinId, days = 7, vsCurrency = "usd") {
    try {
      const response = await axios.get(`${this.baseURL}/coins/${coinId}/market_chart`, {
        params: {
          vs_currency: vsCurrency,
          days,
          interval: days <= 1 ? "hourly" : "daily",
        },
        timeout: 15000,
      })

      return {
        prices: response.data.prices,
        market_caps: response.data.market_caps,
        total_volumes: response.data.total_volumes,
      }
    } catch (error) {
      logger.error("Historical price fetch error:", error)
      throw new Error("Failed to fetch historical prices")
    }
  }

  /**
   * Get supported cryptocurrencies list
   * @returns {Array} List of supported coins
   */
  async getSupportedCoins() {
    try {
      const cacheKey = "supported_coins"
      const cached = this.cache.get(cacheKey)

      if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
        // 24 hours
        return cached.data
      }

      const response = await axios.get(`${this.baseURL}/coins/list`, {
        timeout: 10000,
      })

      const coins = response.data

      // Cache for 24 hours
      this.cache.set(cacheKey, {
        data: coins,
        timestamp: Date.now(),
      })

      return coins
    } catch (error) {
      logger.error("Supported coins fetch error:", error)
      throw new Error("Failed to fetch supported coins")
    }
  }

  /**
   * Clear price cache
   */
  clearCache() {
    this.cache.clear()
    logger.info("Price cache cleared")
  }

  /**
   * Get network native currency coin ID
   * @param {string} network - Network name
   * @returns {string} CoinGecko coin ID
   */
  getNetworkCoinId(network) {
    const networkMap = {
      ethereum: "ethereum",
      polygon: "matic-network",
      sepolia: "ethereum", // Testnet uses same token
      mumbai: "matic-network", // Testnet uses same token
    }

    return networkMap[network] || "ethereum"
  }
}

module.exports = new PriceService()
