import { ethers } from 'ethers';
import { EncryptionService } from './encryptionService';
import { storage } from '../storage';
import type { InsertWallet } from '@shared/schema';

export class WalletService {
  static async generateWallet(userId: string, network: string = 'ethereum'): Promise<{ address: string; walletId: string }> {
    // Generate new wallet
    const wallet = ethers.Wallet.createRandom();
    
    // Encrypt the private key before storing
    const encryptedPrivateKey = EncryptionService.encrypt(wallet.privateKey);
    
    // Create wallet record
    const walletData: InsertWallet = {
      userId,
      address: wallet.address,
      encryptedPrivateKey,
      network,
      isActive: true,
    };
    
    const createdWallet = await storage.createWallet(walletData);
    
    return {
      address: wallet.address,
      walletId: createdWallet.id,
    };
  }

  static async getWalletPrivateKey(walletId: string): Promise<string> {
    const wallet = await storage.getWallet(walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }
    
    return EncryptionService.decrypt(wallet.encryptedPrivateKey);
  }

  static async createWalletInstance(walletId: string, network: string): Promise<ethers.Wallet> {
    const privateKey = await this.getWalletPrivateKey(walletId);
    
    // Create provider based on network
    let provider: ethers.JsonRpcProvider;
    
    if (network === 'ethereum') {
      provider = new ethers.JsonRpcProvider(
        process.env.ETHEREUM_RPC_URL || 
        process.env.INFURA_URL || 
        'https://mainnet.infura.io/v3/your-project-id'
      );
    } else if (network === 'polygon') {
      provider = new ethers.JsonRpcProvider(
        process.env.POLYGON_RPC_URL || 
        'https://polygon-mainnet.infura.io/v3/your-project-id'
      );
    } else {
      throw new Error(`Unsupported network: ${network}`);
    }
    
    return new ethers.Wallet(privateKey, provider);
  }

  static validateAddress(address: string): boolean {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  }

  static parseAmount(amount: string, decimals: number = 18): bigint {
    try {
      return ethers.parseUnits(amount, decimals);
    } catch (error) {
      throw new Error(`Invalid amount: ${amount}`);
    }
  }

  static formatAmount(amount: bigint, decimals: number = 18): string {
    return ethers.formatUnits(amount, decimals);
  }
}
