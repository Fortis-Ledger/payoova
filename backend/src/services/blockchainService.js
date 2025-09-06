const { getProvider } = require("../config/blockchain")
const walletService = require("./walletService")
const priceService = require("./priceService")
const logger = require("../config/logger")

class BlockchainService {
  /**
   * Get comprehensive wallet information
   * @param {string} address - Wallet address
   * @param {string} network - Network name
   * @returns {Object} Complete wallet information
   */
  async getWalletInfo(address, network = "ethereum") {
    try {
      const [balance, nonce, transactionCount] = await Promise.all([
        walletService.getBalance(address, network),
        this.getNonce(address, network),
        this.getTransactionCount(address, network),
      ])

      // Get USD value
      const coinId = priceService.getNetworkCoinId(network)
      const priceData = await priceService.getPrice(coinId)
      const usdValue = priceData ? Number.parseFloat(balance.balance) * priceData.usd : null

      return {
        ...balance,
        nonce,
        transactionCount,
        usdValue,
        pricePerToken: priceData?.usd || null,
      }
    } catch (error) {
      logger.error(`Wallet info fetch error for ${address}:`, error)
      throw new Error("Failed to fetch wallet information")
    }
  }

  /**
   * Get account nonce
   * @param {string} address - Wallet address
   * @param {string} network - Network name
   * @returns {number} Account nonce
   */
  async getNonce(address, network = "ethereum") {
    try {
      const provider = getProvider(network)
      return await provider.getTransactionCount(address)
    } catch (error) {
      logger.error(`Nonce fetch error for ${address}:`, error)
      throw new Error("Failed to fetch account nonce")
    }
  }

  /**
   * Get transaction count for address
   * @param {string} address - Wallet address
   * @param {string} network - Network name
   * @returns {number} Transaction count
   */
  async getTransactionCount(address, network = "ethereum") {
    try {
      const provider = getProvider(network)
      return await provider.getTransactionCount(address, "latest")
    } catch (error) {
      logger.error(`Transaction count fetch error for ${address}:`, error)
      throw new Error("Failed to fetch transaction count")
    }
  }

  /**
   * Get current network information
   * @param {string} network - Network name
   * @returns {Object} Network information
   */
  async getNetworkInfo(network = "ethereum") {
    try {
      const provider = getProvider(network)
      const [blockNumber, gasPrice, feeData] = await Promise.all([
        provider.getBlockNumber(),
        provider.getGasPrice(),
        provider.getFeeData(),
      ])

      return {
        network,
        blockNumber,
        gasPrice: gasPrice.toString(),
        maxFeePerGas: feeData.maxFeePerGas?.toString(),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
        baseFee: feeData.gasPrice?.toString(),
      }
    } catch (error) {
      logger.error(`Network info fetch error for ${network}:`, error)
      throw new Error("Failed to fetch network information")
    }
  }

  /**
   * Monitor transaction status
   * @param {string} txHash - Transaction hash
   * @param {string} network - Network name
   * @param {number} maxWaitTime - Maximum wait time in milliseconds
   * @returns {Object} Transaction status
   */
  async monitorTransaction(txHash, network = "ethereum", maxWaitTime = 300000) {
    try {
      const provider = getProvider(network)
      const startTime = Date.now()

      while (Date.now() - startTime < maxWaitTime) {
        const receipt = await provider.getTransactionReceipt(txHash)

        if (receipt) {
          return {
            hash: txHash,
            status: receipt.status === 1 ? "confirmed" : "failed",
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
            confirmations: await receipt.confirmations(),
          }
        }

        // Wait 5 seconds before checking again
        await new Promise((resolve) => setTimeout(resolve, 5000))
      }

      return {
        hash: txHash,
        status: "timeout",
        message: "Transaction monitoring timed out",
      }
    } catch (error) {
      logger.error(`Transaction monitoring error for ${txHash}:`, error)
      throw new Error("Failed to monitor transaction")
    }
  }

  /**
   * Check for payments to an address
   * @param {string} address - Address to check
   * @param {string} network - Network name
   * @param {string} token - Token symbol or 'native'
   * @param {string} expectedAmount - Expected amount
   * @returns {Object} Payment information if found
   */
  async checkForPayment(address, network = "ethereum", token = "native", expectedAmount) {
    try {
      const provider = getProvider(network)

      if (token === "native" || token === "ETH" || token === "MATIC" || token === "BNB") {
        // Check for native coin transfers
        return await this.checkNativePayment(address, network, expectedAmount)
      } else {
        // Check for ERC-20 transfers
        return await this.checkTokenPayment(address, network, token, expectedAmount)
      }
    } catch (error) {
      logger.error(`Payment check error for ${address}:`, error)
      throw new Error("Failed to check for payment")
    }
  }

  /**
   * Check for native coin payments
   * @param {string} address - Address to check
   * @param {string} network - Network name
   * @param {string} expectedAmount - Expected amount
   * @returns {Object} Payment information if found
   */
  async checkNativePayment(address, network, expectedAmount) {
    try {
      const provider = getProvider(network)
      const currentBlock = await provider.getBlockNumber()
      const fromBlock = currentBlock - 100 // Check last 100 blocks

      const filter = {
        address: null,
        topics: null,
        fromBlock,
        toBlock: currentBlock,
      }

      const logs = await provider.getLogs(filter)

      for (const log of logs) {
        const tx = await provider.getTransaction(log.transactionHash)
        if (tx && tx.to && tx.to.toLowerCase() === address.toLowerCase()) {
          const receipt = await provider.getTransactionReceipt(log.transactionHash)
          if (receipt && receipt.status === 1) {
            const amount = ethers.formatEther(tx.value)
            if (Number(amount) >= Number(expectedAmount)) {
              return {
                txHash: log.transactionHash,
                amount,
                from: tx.from,
                to: tx.to,
                blockNumber: receipt.blockNumber,
                confirmations: currentBlock - receipt.blockNumber,
              }
            }
          }
        }
      }

      return null
    } catch (error) {
      logger.error(`Native payment check error for ${address}:`, error)
      throw new Error("Failed to check native payment")
    }
  }

  /**
   * Check for ERC-20 token payments
   * @param {string} address - Address to check
   * @param {string} network - Network name
   * @param {string} token - Token symbol
   * @param {string} expectedAmount - Expected amount
   * @returns {Object} Payment information if found
   */
  async checkTokenPayment(address, network, token, expectedAmount) {
    try {
      const provider = getProvider(network)
      const currentBlock = await provider.getBlockNumber()
      const fromBlock = currentBlock - 100 // Check last 100 blocks

      // ERC-20 Transfer event signature
      const transferTopic = ethers.id("Transfer(address,address,uint256)")

      const filter = {
        topics: [transferTopic, null, ethers.zeroPadValue(address, 32)],
        fromBlock,
        toBlock: currentBlock,
      }

      const logs = await provider.getLogs(filter)

      for (const log of logs) {
        const contract = new ethers.Contract(log.address, ["function decimals() view returns (uint8)"], provider)
        const decimals = await contract.decimals()
        const amount = ethers.formatUnits(log.data, decimals)

        if (Number(amount) >= Number(expectedAmount)) {
          return {
            txHash: log.transactionHash,
            amount,
            tokenAddress: log.address,
            from: ethers.getAddress("0x" + log.topics[1].slice(26)),
            to: ethers.getAddress("0x" + log.topics[2].slice(26)),
            blockNumber: log.blockNumber,
            confirmations: currentBlock - log.blockNumber,
          }
        }
      }

      return null
    } catch (error) {
      logger.error(`Token payment check error for ${address}:`, error)
      throw new Error("Failed to check token payment")
    }
  }

  /**
   * Get popular ERC-20 tokens for a network
   * @param {string} network - Network name
   * @returns {Array} Popular token addresses and info
   */
  getPopularTokens(network = "ethereum") {
    const tokens = {
      ethereum: [
        {
          address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
          symbol: "USDT",
          name: "Tether USD",
          decimals: 6,
        },
        {
          address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          symbol: "USDC",
          name: "USD Coin",
          decimals: 6,
        },
        {
          address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
          symbol: "LINK",
          name: "Chainlink",
          decimals: 18,
        },
      ],
      polygon: [
        {
          address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
          symbol: "USDT",
          name: "Tether USD",
          decimals: 6,
        },
        {
          address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
          symbol: "USDC",
          name: "USD Coin",
          decimals: 6,
        },
        {
          address: "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39",
          symbol: "LINK",
          name: "Chainlink",
          decimals: 18,
        },
      ],
    }

    return tokens[network] || []
  }
}

module.exports = new BlockchainService()
