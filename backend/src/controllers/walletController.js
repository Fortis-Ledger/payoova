const User = require("../models/User")
const Transaction = require("../models/Transaction")
const walletService = require("../services/walletService")
const blockchainService = require("../services/blockchainService")
const priceService = require("../services/priceService")
const logger = require("../config/logger")

class WalletController {
  // Get wallet information for authenticated user
  static async getWalletInfo(req, res) {
    try {
      const user = req.user
      const { network = user.defaultNetwork } = req.query

      const walletInfo = await blockchainService.getWalletInfo(user.walletAddress, network)

      res.json({
        wallet: walletInfo,
        user: {
          id: user._id,
          walletAddress: user.walletAddress,
          defaultNetwork: user.defaultNetwork,
        },
      })
    } catch (error) {
      logger.error("Wallet info fetch error:", error)
      res.status(500).json({ error: "Failed to fetch wallet information" })
    }
  }

  // Get balance for any address (public endpoint)
  static async getBalance(req, res) {
    try {
      const { address } = req.params
      const { network = "ethereum" } = req.query

      if (!walletService.isValidAddress(address)) {
        return res.status(400).json({ error: "Invalid wallet address" })
      }

      const balance = await walletService.getBalance(address, network)

      // Get USD value
      const coinId = priceService.getNetworkCoinId(network)
      const priceData = await priceService.getPrice(coinId)
      const usdValue = priceData ? Number.parseFloat(balance.balance) * priceData.usd : null

      res.json({
        ...balance,
        usdValue,
        pricePerToken: priceData?.usd || null,
      })
    } catch (error) {
      logger.error("Balance fetch error:", error)
      res.status(500).json({ error: "Failed to fetch balance" })
    }
  }

  // Get token balance for any address
  static async getTokenBalance(req, res) {
    try {
      const { address, tokenAddress } = req.params
      const { network = "ethereum" } = req.query

      if (!walletService.isValidAddress(address) || !walletService.isValidAddress(tokenAddress)) {
        return res.status(400).json({ error: "Invalid address" })
      }

      const tokenBalance = await walletService.getTokenBalance(address, tokenAddress, network)

      res.json(tokenBalance)
    } catch (error) {
      logger.error("Token balance fetch error:", error)
      res.status(500).json({ error: "Failed to fetch token balance" })
    }
  }

  // Send native currency (ETH/MATIC)
  static async sendNativeCurrency(req, res) {
    try {
      const user = req.user
      const { toAddress, amount, network = user.defaultNetwork } = req.body

      // Validate input
      if (!walletService.isValidAddress(toAddress)) {
        return res.status(400).json({ error: "Invalid recipient address" })
      }

      if (!amount || isNaN(Number.parseFloat(amount)) || Number.parseFloat(amount) <= 0) {
        return res.status(400).json({ error: "Invalid amount" })
      }

      // Check if user has sufficient balance
      const balance = await walletService.getBalance(user.walletAddress, network)
      if (Number.parseFloat(balance.balance) < Number.parseFloat(amount)) {
        return res.status(400).json({ error: "Insufficient balance" })
      }

      // Check security settings for large transactions
      const coinId = priceService.getNetworkCoinId(network)
      const priceData = await priceService.getPrice(coinId)
      const usdValue = priceData ? Number.parseFloat(amount) * priceData.usd : 0

      if (usdValue > user.securitySettings.maxDailyTransactionLimit) {
        return res.status(400).json({
          error: "Transaction exceeds daily limit",
          limit: user.securitySettings.maxDailyTransactionLimit,
          attemptedValue: usdValue,
        })
      }

      // Send transaction
      const txResult = await walletService.sendNativeCurrency(user.encryptedPrivateKey, toAddress, amount, network)

      // Save transaction to database
      const transaction = new Transaction({
        userId: user._id,
        hash: txResult.hash,
        fromAddress: user.walletAddress,
        toAddress,
        amount,
        amountInWei: txResult.amountWei,
        network,
        type: "send",
        status: "pending",
        gasPrice: txResult.gasPrice,
        gasLimit: txResult.gasLimit,
        nonce: txResult.nonce,
        usdValue,
      })

      await transaction.save()

      logger.info(`Transaction initiated: ${txResult.hash} by user ${user._id}`)

      res.json({
        message: "Transaction sent successfully",
        transaction: {
          hash: txResult.hash,
          from: txResult.from,
          to: txResult.to,
          amount: txResult.amount,
          network: txResult.network,
          status: "pending",
          usdValue,
        },
      })
    } catch (error) {
      logger.error("Send transaction error:", error)
      res.status(500).json({ error: error.message || "Failed to send transaction" })
    }
  }

  // Send ERC-20 tokens
  static async sendToken(req, res) {
    try {
      const user = req.user
      const { toAddress, tokenAddress, amount, network = user.defaultNetwork } = req.body

      // Validate input
      if (!walletService.isValidAddress(toAddress) || !walletService.isValidAddress(tokenAddress)) {
        return res.status(400).json({ error: "Invalid address" })
      }

      if (!amount || isNaN(Number.parseFloat(amount)) || Number.parseFloat(amount) <= 0) {
        return res.status(400).json({ error: "Invalid amount" })
      }

      // Check token balance
      const tokenBalance = await walletService.getTokenBalance(user.walletAddress, tokenAddress, network)
      if (Number.parseFloat(tokenBalance.balance) < Number.parseFloat(amount)) {
        return res.status(400).json({ error: "Insufficient token balance" })
      }

      // Send token transaction
      const txResult = await walletService.sendToken(user.encryptedPrivateKey, toAddress, tokenAddress, amount, network)

      // Save transaction to database
      const transaction = new Transaction({
        userId: user._id,
        hash: txResult.hash,
        fromAddress: user.walletAddress,
        toAddress,
        amount,
        amountInWei: txResult.amountWei,
        network,
        tokenAddress,
        tokenSymbol: tokenBalance.symbol,
        tokenDecimals: tokenBalance.decimals,
        type: "send",
        status: "pending",
        gasPrice: txResult.gasPrice,
        gasLimit: txResult.gasLimit,
        nonce: txResult.nonce,
      })

      await transaction.save()

      logger.info(`Token transfer initiated: ${txResult.hash} by user ${user._id}`)

      res.json({
        message: "Token transfer sent successfully",
        transaction: {
          hash: txResult.hash,
          from: txResult.from,
          to: txResult.to,
          amount: txResult.amount,
          tokenAddress,
          tokenSymbol: tokenBalance.symbol,
          network: txResult.network,
          status: "pending",
        },
      })
    } catch (error) {
      logger.error("Token transfer error:", error)
      res.status(500).json({ error: error.message || "Failed to send token" })
    }
  }

  // Estimate gas for transaction
  static async estimateGas(req, res) {
    try {
      const user = req.user
      const { toAddress, amount, network = user.defaultNetwork, tokenAddress } = req.body

      if (!walletService.isValidAddress(toAddress)) {
        return res.status(400).json({ error: "Invalid recipient address" })
      }

      const gasEstimate = await walletService.estimateGas(user.walletAddress, toAddress, amount, network, tokenAddress)

      res.json(gasEstimate)
    } catch (error) {
      logger.error("Gas estimation error:", error)
      res.status(500).json({ error: "Failed to estimate gas" })
    }
  }

  // Get popular tokens for a network
  static async getPopularTokens(req, res) {
    try {
      const { network = "ethereum" } = req.query
      const tokens = blockchainService.getPopularTokens(network)

      res.json({
        network,
        tokens,
      })
    } catch (error) {
      logger.error("Popular tokens fetch error:", error)
      res.status(500).json({ error: "Failed to fetch popular tokens" })
    }
  }

  // Get network information
  static async getNetworkInfo(req, res) {
    try {
      const { network = "ethereum" } = req.query
      const networkInfo = await blockchainService.getNetworkInfo(network)

      res.json(networkInfo)
    } catch (error) {
      logger.error("Network info fetch error:", error)
      res.status(500).json({ error: "Failed to fetch network information" })
    }
  }

  // Get wallet portfolio (all balances across networks)
  static async getPortfolio(req, res) {
    try {
      const user = req.user
      const networks = ["ethereum", "polygon"]

      const portfolioPromises = networks.map(async (network) => {
        try {
          const balance = await walletService.getBalance(user.walletAddress, network)
          const coinId = priceService.getNetworkCoinId(network)
          const priceData = await priceService.getPrice(coinId)
          const usdValue = priceData ? Number.parseFloat(balance.balance) * priceData.usd : 0

          return {
            network,
            currency: balance.currency,
            balance: balance.balance,
            usdValue,
            pricePerToken: priceData?.usd || null,
          }
        } catch (error) {
          logger.warn(`Failed to fetch balance for ${network}:`, error)
          return {
            network,
            currency: network === "polygon" ? "MATIC" : "ETH",
            balance: "0",
            usdValue: 0,
            pricePerToken: null,
            error: "Failed to fetch balance",
          }
        }
      })

      const portfolio = await Promise.all(portfolioPromises)
      const totalValue = portfolio.reduce((sum, item) => sum + (item.usdValue || 0), 0)

      res.json({
        walletAddress: user.walletAddress,
        totalValue,
        currency: user.currency,
        networks: portfolio,
        lastUpdated: new Date(),
      })
    } catch (error) {
      logger.error("Portfolio fetch error:", error)
      res.status(500).json({ error: "Failed to fetch portfolio" })
    }
  }

  // Validate wallet address
  static async validateAddress(req, res) {
    try {
      const { address } = req.params

      const isValid = walletService.isValidAddress(address)

      res.json({
        address,
        isValid,
        format: isValid ? "valid_ethereum_address" : "invalid",
      })
    } catch (error) {
      logger.error("Address validation error:", error)
      res.status(500).json({ error: "Failed to validate address" })
    }
  }
}

module.exports = WalletController
