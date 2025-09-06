const { ethers } = require("ethers")

// Ethereum mainnet provider
const providerEth = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL)

// BNB Smart Chain provider (using Polygon as placeholder, update RPC URL for BNB)
const providerBnb = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL)

// Test networks (for development)
const sepoliaProvider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL)
const mumbaiProvider = new ethers.JsonRpcProvider(process.env.MUMBAI_RPC_URL)

const getProvider = (network = "ethereum") => {
  switch (network.toLowerCase()) {
    case "ethereum":
      return providerEth
    case "polygon":
    case "bnb":
      return providerBnb
    case "sepolia":
      return sepoliaProvider
    case "mumbai":
      return mumbaiProvider
    default:
      return providerEth
  }
}

module.exports = {
  providerEth,
  providerBnb,
  sepoliaProvider,
  mumbaiProvider,
  getProvider,
}
