import { ethers } from 'ethers';
import axios from 'axios';
import { WalletService } from './walletService';
import { storage } from '../storage';
import type { SendTransactionRequest, InsertTransaction } from '@shared/schema';

export interface TokenBalance {
  currency: string;
  balance: string;
  decimals: number;
  contractAddress?: string;
}

export interface NetworkConfig {
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: string;
  tokens: {
    [symbol: string]: {
      address: string;
      decimals: number;
    };
  };
}

export class BlockchainService {
  private static readonly ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
  
  private static networks: Record<string, NetworkConfig> = {
    ethereum: {
      name: 'Ethereum',
      rpcUrl: this.ALCHEMY_API_KEY 
        ? `https://eth-mainnet.g.alchemy.com/v2/${this.ALCHEMY_API_KEY}`
        : 'https://mainnet.infura.io/v3/your-project-id',
      explorerUrl: 'https://etherscan.io',
      nativeCurrency: 'ETH',
      tokens: {
        USDC: {
          address: '0xA0b86a33E6441986C3F0e1C1a5d0C2F5B93d4E4E',
          decimals: 6,
        },
        USDT: {
          address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          decimals: 6,
        },
      },
    },
    polygon: {
      name: 'Polygon',
      rpcUrl: this.ALCHEMY_API_KEY 
        ? `https://polygon-mainnet.g.alchemy.com/v2/${this.ALCHEMY_API_KEY}`
        : 'https://polygon-mainnet.infura.io/v3/your-project-id',
      explorerUrl: 'https://polygonscan.com',
      nativeCurrency: 'MATIC',
      tokens: {
        USDC: {
          address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
          decimals: 6,
        },
        USDT: {
          address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
          decimals: 6,
        },
      },
    },
    bsc: {
      name: 'BNB Smart Chain',
      rpcUrl: 'https://bsc-dataseed1.binance.org/',
      explorerUrl: 'https://bscscan.com',
      nativeCurrency: 'BNB',
      tokens: {
        USDC: {
          address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
          decimals: 18,
        },
        USDT: {
          address: '0x55d398326f99059fF775485246999027B3197955',
          decimals: 18,
        },
        BUSD: {
          address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
          decimals: 18,
        },
      },
    },
  };

  static async getBalance(address: string, network: string): Promise<TokenBalance[]> {
    const config = this.networks[network];
    if (!config) {
      throw new Error(`Unsupported network: ${network}`);
    }

    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    const balances: TokenBalance[] = [];

    try {
      // Get native currency balance
      const nativeBalance = await provider.getBalance(address);
      balances.push({
        currency: config.nativeCurrency,
        balance: ethers.formatEther(nativeBalance),
        decimals: 18,
      });

      // Get token balances
      for (const [symbol, tokenConfig] of Object.entries(config.tokens)) {
        try {
          const tokenContract = new ethers.Contract(
            tokenConfig.address,
            [
              'function balanceOf(address owner) view returns (uint256)',
              'function decimals() view returns (uint8)',
            ],
            provider
          );

          const tokenBalance = await tokenContract.balanceOf(address);
          balances.push({
            currency: symbol,
            balance: ethers.formatUnits(tokenBalance, tokenConfig.decimals),
            decimals: tokenConfig.decimals,
            contractAddress: tokenConfig.address,
          });
        } catch (error) {
          console.warn(`Failed to get ${symbol} balance for ${address}:`, error);
        }
      }
    } catch (error) {
      console.error(`Failed to get balances for ${address} on ${network}:`, error);
      throw error;
    }

    return balances;
  }

  static async getTransactionHistory(address: string, network: string, limit = 20): Promise<any[]> {
    if (!this.ALCHEMY_API_KEY) {
      console.warn('Alchemy API key not configured, using basic transaction history');
      return [];
    }

    try {
      const config = this.networks[network];
      if (!config || network === 'bsc') {
        // For BSC or unsupported networks, return empty for now
        return [];
      }

      // Using Alchemy's enhanced API for transaction history
      const alchemyUrl = network === 'ethereum' 
        ? `https://eth-mainnet.g.alchemy.com/v2/${this.ALCHEMY_API_KEY}`
        : `https://polygon-mainnet.g.alchemy.com/v2/${this.ALCHEMY_API_KEY}`;

      const response = await axios.post(alchemyUrl, {
        jsonrpc: '2.0',
        method: 'alchemy_getAssetTransfers',
        params: [{
          fromBlock: '0x0',
          toBlock: 'latest',
          fromAddress: address,
          category: ['external', 'erc20'],
          maxCount: limit,
          order: 'desc'
        }],
        id: 1
      });

      return response.data.result?.transfers || [];
    } catch (error) {
      console.error(`Failed to get transaction history for ${address}:`, error);
      return [];
    }
  }

  static getSupportedNetworks(): string[] {
    return Object.keys(this.networks);
  }

  static getNetworkConfig(network: string): NetworkConfig | undefined {
    return this.networks[network];
  }

  static async sendTransaction(
    walletId: string,
    userId: string,
    request: SendTransactionRequest
  ): Promise<string> {
    const { toAddress, amount, currency, network } = request;

    // Validate inputs
    if (!WalletService.validateAddress(toAddress)) {
      throw new Error('Invalid recipient address');
    }

    const config = this.networks[network];
    if (!config) {
      throw new Error(`Unsupported network: ${network}`);
    }

    // Get wallet instance
    const wallet = await WalletService.createWalletInstance(walletId, network);
    const fromAddress = wallet.address;

    let txHash: string;
    let gasPrice: string;
    let estimatedGas: bigint;

    try {
      if (currency === config.nativeCurrency) {
        // Send native currency (ETH/MATIC)
        const amountWei = WalletService.parseAmount(amount);
        
        // Estimate gas
        estimatedGas = await wallet.estimateGas({
          to: toAddress,
          value: amountWei,
        });

        // Get gas price
        const feeData = await wallet.provider!.getFeeData();
        gasPrice = feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') : '0';

        // Send transaction
        const tx = await wallet.sendTransaction({
          to: toAddress,
          value: amountWei,
          gasLimit: estimatedGas,
          gasPrice: feeData.gasPrice,
        });

        txHash = tx.hash;
      } else {
        // Send ERC-20 token
        const tokenConfig = config.tokens[currency];
        if (!tokenConfig) {
          throw new Error(`Unsupported token: ${currency}`);
        }

        const tokenContract = new ethers.Contract(
          tokenConfig.address,
          [
            'function transfer(address to, uint256 amount) returns (bool)',
            'function balanceOf(address owner) view returns (uint256)',
          ],
          wallet
        );

        const amountTokens = WalletService.parseAmount(amount, tokenConfig.decimals);

        // Check balance
        const balance = await tokenContract.balanceOf(fromAddress);
        if (balance < amountTokens) {
          throw new Error('Insufficient token balance');
        }

        // Estimate gas
        estimatedGas = await tokenContract.transfer.estimateGas(toAddress, amountTokens);

        // Get gas price
        const feeData = await wallet.provider!.getFeeData();
        gasPrice = feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') : '0';

        // Send transaction
        const tx = await tokenContract.transfer(toAddress, amountTokens, {
          gasLimit: estimatedGas,
          gasPrice: feeData.gasPrice,
        });

        txHash = tx.hash;
      }

      // Record transaction in database
      const transactionData: InsertTransaction = {
        userId,
        walletId,
        fromAddress,
        toAddress,
        amount,
        currency,
        transactionHash: txHash,
        status: 'pending',
        gasPrice,
        network,
        type: 'send',
      };

      await storage.createTransaction(transactionData);

      return txHash;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw new Error(`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async checkTransactionStatus(txHash: string, network: string): Promise<{
    status: string;
    blockNumber?: number;
    gasUsed?: number;
  }> {
    const config = this.networks[network];
    if (!config) {
      throw new Error(`Unsupported network: ${network}`);
    }

    const provider = new ethers.JsonRpcProvider(config.rpcUrl);

    try {
      const receipt = await provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return { status: 'pending' };
      }

      return {
        status: receipt.status === 1 ? 'confirmed' : 'failed',
        blockNumber: receipt.blockNumber,
        gasUsed: Number(receipt.gasUsed),
      };
    } catch (error) {
      console.error(`Failed to check transaction status for ${txHash}:`, error);
      return { status: 'pending' };
    }
  }

  static async syncWalletBalances(walletId: string, address: string, network: string): Promise<void> {
    try {
      const balances = await this.getBalance(address, network);
      
      for (const balance of balances) {
        await storage.upsertBalance({
          walletId,
          currency: balance.currency,
          balance: balance.balance,
          network,
        });
      }
    } catch (error) {
      console.error(`Failed to sync balances for wallet ${walletId}:`, error);
    }
  }

  static async estimateGasFee(network: string, transaction: any): Promise<{
    gasPrice: string;
    gasLimit: string;
    estimatedCost: string;
  }> {
    const config = this.networks[network];
    if (!config) {
      throw new Error(`Unsupported network: ${network}`);
    }

    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    
    try {
      const gasPrice = await provider.getFeeData();
      const gasLimit = await provider.estimateGas(transaction);
      
      const estimatedCostWei = gasPrice.gasPrice ? gasPrice.gasPrice * gasLimit : BigInt(0);
      const estimatedCost = ethers.formatEther(estimatedCostWei);
      
      return {
        gasPrice: gasPrice.gasPrice ? ethers.formatUnits(gasPrice.gasPrice, 'gwei') : '0',
        gasLimit: gasLimit.toString(),
        estimatedCost,
      };
    } catch (error) {
      console.error(`Failed to estimate gas for ${network}:`, error);
      return {
        gasPrice: '20', // Default fallback
        gasLimit: '21000',
        estimatedCost: '0.0004',
      };
    }
  }

  static async validateTransaction(
    walletId: string,
    request: SendTransactionRequest
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      // Validate address format
      if (!WalletService.validateAddress(request.toAddress)) {
        return { valid: false, error: 'Invalid recipient address' };
      }

      // Validate network support
      if (!this.networks[request.network]) {
        return { valid: false, error: `Unsupported network: ${request.network}` };
      }

      // Validate amount format
      try {
        WalletService.parseAmount(request.amount);
      } catch {
        return { valid: false, error: 'Invalid amount format' };
      }

      // Get wallet and check balance
      const wallet = await storage.getWallet(walletId);
      if (!wallet) {
        return { valid: false, error: 'Wallet not found' };
      }

      const balances = await this.getBalance(wallet.address, request.network);
      const currencyBalance = balances.find(b => b.currency === request.currency);
      
      if (!currencyBalance) {
        return { valid: false, error: `No ${request.currency} balance found` };
      }

      const requestAmount = parseFloat(request.amount);
      const availableBalance = parseFloat(currencyBalance.balance);
      
      if (requestAmount > availableBalance) {
        return { valid: false, error: 'Insufficient balance' };
      }

      return { valid: true };
    } catch (error) {
      console.error('Transaction validation failed:', error);
      return { valid: false, error: 'Validation failed' };
    }
  }
}
