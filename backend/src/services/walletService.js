const { ethers } = require("ethers")
const CryptoJS = require("crypto-js")
const { getProvider } = require("../config/blockchain")
const logger = require("../config/logger")

class WalletService {
  constructor() {
    this.encryptionKey = process.env.ENCRYPTION_KEY
    if (!this.encryptionKey) {
      throw new Error("ENCRYPTION_KEY environment variable is required")
    }
  }

  /**
   * Generate a new wallet with encrypted private key
   * @returns {Object} { address, encryptedPrivateKey }
   */
  async generateWallet() {
    try {
      // Generate random wallet
      const wallet = ethers.Wallet.createRandom()

      // Encrypt private key
      const encryptedPrivateKey = this.encryptPrivateKey(wallet.privateKey)

      logger.info(`Generated new wallet: ${wallet.address}`)

      return {
        address: wallet.address,
        encryptedPrivateKey,
        publicKey: wallet.publicKey,
      }
    } catch (error) {
      logger.error("Wallet generation error:", error)
      throw new Error("Failed to generate wallet")
    }
  }

  /**
   * Encrypt private key using AES encryption
   * @param {string} privateKey - The private key to encrypt
   * @returns {string} Encrypted private key
   */
  encryptPrivateKey(privateKey) {
    try {
      return CryptoJS.AES.encrypt(privateKey, this.encryptionKey).toString()
    } catch (error) {
      logger.error("Private key encryption error:", error)
      throw new Error("Failed to encrypt private key")
    }
  }

  /**
   * Decrypt private key
   * @param {string} encryptedPrivateKey - The encrypted private key
   * @returns {string} Decrypted private key
   */
  decryptPrivateKey(encryptedPrivateKey) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedPrivateKey, this.encryptionKey)
      return bytes.toString(CryptoJS.enc.Utf8)
    } catch (error) {
      logger.error("Private key decryption error:", error)
      throw new Error("Failed to decrypt private key")
    }
  }

  /**
   * Create wallet instance from encrypted private key
   * @param {string} encryptedPrivateKey - Encrypted private key
   * @param {string} network - Network name
   * @returns {ethers.Wallet} Wallet instance connected to provider
   */
  createWalletInstance(encryptedPrivateKey, network = "ethereum") {
    try {
      const privateKey = this.decryptPrivateKey(encryptedPrivateKey)
      const provider = getProvider(network)
      return new ethers.Wallet(privateKey, provider)
    } catch (error) {
      logger.error("Wallet instance creation error:", error)
      throw new Error("Failed to create wallet instance")
    }
  }

  /**
   * Get wallet balance for native currency
   * @param {string} address - Wallet address
   * @param {string} network - Network name
   * @returns {Object} Balance information
   */
  async getBalance(address, network = "ethereum") {
    try {
      const provider = getProvider(network)
      const balanceWei = await provider.getBalance(address)
      const balance = ethers.formatEther(balanceWei)

      return {
        address,
        network,
        balance,
        balanceWei: balanceWei.toString(),
        currency: network === "polygon" ? "MATIC" : "ETH",
      }
    } catch (error) {
      logger.error(`Balance fetch error for ${address} on ${network}:`, error)
      throw new Error("Failed to fetch balance")
    }
  }

  /**
   * Get ERC-20 token balance
   * @param {string} walletAddress - Wallet address
   * @param {string} tokenAddress - Token contract address
   * @param {string} network - Network name
   * @returns {Object} Token balance information
   */
  async getTokenBalance(walletAddress, tokenAddress, network = "ethereum") {
    try {
      const provider = getProvider(network)

      // ERC-20 ABI for balanceOf and decimals
      const erc20Abi = [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)",
        "function name() view returns (string)",
      ]

      const contract = new ethers.Contract(tokenAddress, erc20Abi, provider)

      const [balance, decimals, symbol, name] = await Promise.all([
        contract.balanceOf(walletAddress),
        contract.decimals(),
        contract.symbol(),
        contract.name(),
      ])

      const formattedBalance = ethers.formatUnits(balance, decimals)

      return {
        address: tokenAddress,
        name,
        symbol,
        decimals,
        balance: formattedBalance,
        balanceWei: balance.toString(),
        walletAddress,
        network,
      }
    } catch (error) {
      logger.error(`Token balance fetch error for ${tokenAddress}:`, error)
      throw new Error("Failed to fetch token balance")
    }
  }

  /**
   * Send native currency (ETH/MATIC)
   * @param {string} encryptedPrivateKey - Sender's encrypted private key
   * @param {string} toAddress - Recipient address
   * @param {string} amount - Amount to send (in ETH/MATIC)
   * @param {string} network - Network name
   * @returns {Object} Transaction result
   */
  async sendNativeCurrency(encryptedPrivateKey, toAddress, amount, network = "ethereum") {
    try {
      const wallet = this.createWalletInstance(encryptedPrivateKey, network)

      // Validate addresses
      if (!ethers.isAddress(toAddress)) {
        throw new Error("Invalid recipient address")
      }

      // Convert amount to Wei
      const amountWei = ethers.parseEther(amount)

      // Get current gas price
      const provider = getProvider(network)
      const feeData = await provider.getFeeData()

      // Prepare transaction
      const transaction = {
        to: toAddress,
        value: amountWei,
        gasLimit: 21000, // Standard gas limit for ETH transfer
        gasPrice: feeData.gasPrice,
      }

      // Send transaction
      const txResponse = await wallet.sendTransaction(transaction)

      logger.info(`Transaction sent: ${txResponse.hash} on ${network}`)

      return {
        hash: txResponse.hash,
        from: wallet.address,
        to: toAddress,
        amount,
        amountWei: amountWei.toString(),
        network,
        gasPrice: feeData.gasPrice.toString(),
        gasLimit: transaction.gasLimit.toString(),
        nonce: txResponse.nonce,
        status: "pending",
      }
    } catch (error) {
      logger.error("Send transaction error:", error)
      throw new Error(`Failed to send transaction: ${error.message}`)
    }
  }

  /**
   * Send ERC-20 tokens
   * @param {string} encryptedPrivateKey - Sender's encrypted private key
   * @param {string} toAddress - Recipient address
   * @param {string} tokenAddress - Token contract address
   * @param {string} amount - Amount to send
   * @param {string} network - Network name
   * @returns {Object} Transaction result
   */
  async sendToken(encryptedPrivateKey, toAddress, tokenAddress, amount, network = "ethereum") {
    try {
      const wallet = this.createWalletInstance(encryptedPrivateKey, network)

      // Validate addresses
      if (!ethers.isAddress(toAddress) || !ethers.isAddress(tokenAddress)) {
        throw new Error("Invalid address")
      }

      // ERC-20 contract interface
      const erc20Abi = [
        "function transfer(address to, uint256 amount) returns (bool)",
        "function decimals() view returns (uint8)",
      ]

      const contract = new ethers.Contract(tokenAddress, erc20Abi, wallet)

      // Get token decimals
      const decimals = await contract.decimals()
      const amountWei = ethers.parseUnits(amount, decimals)

      // Send token transfer transaction
      const txResponse = await contract.transfer(toAddress, amountWei)

      logger.info(`Token transfer sent: ${txResponse.hash} on ${network}`)

      return {
        hash: txResponse.hash,
        from: wallet.address,
        to: toAddress,
        tokenAddress,
        amount,
        amountWei: amountWei.toString(),
        network,
        gasPrice: txResponse.gasPrice?.toString(),
        gasLimit: txResponse.gasLimit?.toString(),
        nonce: txResponse.nonce,
        status: "pending",
      }
    } catch (error) {
      logger.error("Token transfer error:", error)
      throw new Error(`Failed to send token: ${error.message}`)
    }
  }

  /**
   * Estimate gas for a transaction
   * @param {string} from - Sender address
   * @param {string} to - Recipient address
   * @param {string} amount - Amount to send
   * @param {string} network - Network name
   * @param {string} tokenAddress - Token address (optional)
   * @returns {Object} Gas estimation
   */
  async estimateGas(from, to, amount, network = "ethereum", tokenAddress = null) {
    try {
      const provider = getProvider(network)
      let gasEstimate

      if (tokenAddress) {
        // Estimate gas for token transfer
        const erc20Abi = [
          "function transfer(address to, uint256 amount) returns (bool)",
          "function decimals() view returns (uint8)",
        ]

        const contract = new ethers.Contract(tokenAddress, erc20Abi, provider)
        const decimals = await contract.decimals()
        const amountWei = ethers.parseUnits(amount, decimals)

        gasEstimate = await contract.transfer.estimateGas(to, amountWei, { from })
      } else {
        // Estimate gas for native currency transfer
        const amountWei = ethers.parseEther(amount)
        gasEstimate = await provider.estimateGas({
          from,
          to,
          value: amountWei,
        })
      }

      const feeData = await provider.getFeeData()
      const gasCost = gasEstimate * feeData.gasPrice

      return {
        gasLimit: gasEstimate.toString(),
        gasPrice: feeData.gasPrice.toString(),
        gasCost: gasCost.toString(),
        gasCostEth: ethers.formatEther(gasCost),
        network,
      }
    } catch (error) {
      logger.error("Gas estimation error:", error)
      throw new Error("Failed to estimate gas")
    }
  }

  /**
   * Get transaction receipt
   * @param {string} txHash - Transaction hash
   * @param {string} network - Network name
   * @returns {Object} Transaction receipt
   */
  async getTransactionReceipt(txHash, network = "ethereum") {
    try {
      const provider = getProvider(network)
      const receipt = await provider.getTransactionReceipt(txHash)

      if (!receipt) {
        return null
      }

      return {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        blockHash: receipt.blockHash,
        transactionIndex: receipt.index,
        from: receipt.from,
        to: receipt.to,
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: receipt.gasPrice?.toString(),
        status: receipt.status === 1 ? "confirmed" : "failed",
        confirmations: await receipt.confirmations(),
        network,
      }
    } catch (error) {
      logger.error("Transaction receipt error:", error)
      throw new Error("Failed to get transaction receipt")
    }
  }

  /**
   * Validate Ethereum address
   * @param {string} address - Address to validate
   * @returns {boolean} Is valid address
   */
  isValidAddress(address) {
    return ethers.isAddress(address)
  }

  /**
   * Get supported networks
   * @returns {Array} Supported network names
   */
  async getSupportedNetworks() {
    return ['ethereum', 'polygon', 'binance-smart-chain'];
  }
}

module.exports = new WalletService()
