import type {
  User,
  UpsertUser,
  Wallet,
  InsertWallet,
  Transaction,
  InsertTransaction,
  Balance,
  InsertBalance,
} from "@shared/schema";

export interface IStorage {
  // User operations - authentication focused
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  createUser(userData: UpsertUser): Promise<User>;
  upsertUser(userData: UpsertUser): Promise<User>;
  updateUserLastLogin(id: string): Promise<void>;
  updateUserVerification(id: string, updates: {
    emailVerified?: boolean;
    phoneVerified?: boolean;
    emailVerificationToken?: string | null;
    phoneVerificationCode?: string | null;
    verificationCodeExpiry?: Date | null;
    phone?: string;
    autoWalletGenerated?: boolean;
  }): Promise<void>;

  // Wallet operations - auto-generated wallets
  getWallets(userId: string): Promise<Wallet[]>;
  getWallet(id: string): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;

  // Transaction operations - blockchain transactions
  getTransactions(userId: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(id: string, status: string, transactionHash?: string): Promise<void>;

  // Balance operations - crypto asset balances
  getBalances(walletId: string): Promise<Balance[]>;
  updateBalance(balance: InsertBalance): Promise<Balance>;
}

export class DatabaseStorage implements IStorage {
  // User operations - authentication focused
  async getUser(id: string): Promise<User | undefined> {
    // Mock implementation - will be replaced with database calls
    return {
      id,
      email: "demo@payoova.com",
      password: null,
      phone: null,
      firstName: "Demo",
      lastName: "User",
      profileImageUrl: null,
      emailVerified: true,
      phoneVerified: false,
      emailVerificationToken: null,
      phoneVerificationCode: null,
      verificationCodeExpiry: null,
      autoWalletGenerated: false,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    // Mock implementation
    if (email === "demo@payoova.com") {
      return await this.getUser("demo-user-id");
    }
    return undefined;
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    // Mock implementation
    return await this.getUser("demo-user-id");
  }

  async createUser(userData: UpsertUser): Promise<User> {
    // Mock implementation
    return {
      id: crypto.randomUUID(),
      email: userData.email || null,
      password: userData.password || null,
      phone: userData.phone || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      emailVerified: userData.emailVerified || false,
      phoneVerified: userData.phoneVerified || false,
      emailVerificationToken: userData.emailVerificationToken || null,
      phoneVerificationCode: userData.phoneVerificationCode || null,
      verificationCodeExpiry: userData.verificationCodeExpiry || null,
      autoWalletGenerated: userData.autoWalletGenerated || false,
      lastLoginAt: userData.lastLoginAt || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // For demo, just create user
    return await this.createUser(userData);
  }

  async updateUserLastLogin(id: string): Promise<void> {
    // Mock implementation
    console.log(`Updated last login for user: ${id}`);
  }

  async updateUserVerification(id: string, updates: {
    emailVerified?: boolean;
    phoneVerified?: boolean;
    emailVerificationToken?: string | null;
    phoneVerificationCode?: string | null;
    verificationCodeExpiry?: Date | null;
    phone?: string;
    autoWalletGenerated?: boolean;
  }): Promise<void> {
    // Mock implementation
    console.log(`Updated verification for user ${id}:`, updates);
  }

  // Wallet operations - auto-generated wallets
  async getWallets(userId: string): Promise<Wallet[]> {
    // Mock implementation
    return [];
  }

  async getWallet(id: string): Promise<Wallet | undefined> {
    // Mock implementation
    return undefined;
  }

  async createWallet(wallet: InsertWallet): Promise<Wallet> {
    // Mock implementation
    return {
      id: crypto.randomUUID(),
      userId: wallet.userId,
      address: wallet.address,
      encryptedPrivateKey: wallet.encryptedPrivateKey,
      network: wallet.network || "ethereum",
      isActive: wallet.isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Transaction operations - blockchain transactions
  async getTransactions(userId: string): Promise<Transaction[]> {
    // Mock implementation
    return [];
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    // Mock implementation
    return {
      id: crypto.randomUUID(),
      userId: transaction.userId,
      walletId: transaction.walletId,
      fromAddress: transaction.fromAddress,
      toAddress: transaction.toAddress,
      amount: transaction.amount,
      currency: transaction.currency,
      transactionHash: transaction.transactionHash || null,
      status: transaction.status || "pending",
      gasPrice: transaction.gasPrice || null,
      gasUsed: transaction.gasUsed || null,
      blockNumber: transaction.blockNumber || null,
      network: transaction.network,
      type: transaction.type,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async updateTransactionStatus(id: string, status: string, transactionHash?: string): Promise<void> {
    // Mock implementation
    console.log(`Updated transaction ${id} status to ${status}`);
  }

  // Balance operations - crypto asset balances
  async getBalances(walletId: string): Promise<Balance[]> {
    // Mock implementation
    return [];
  }

  async updateBalance(balance: InsertBalance): Promise<Balance> {
    // Mock implementation
    return {
      id: crypto.randomUUID(),
      walletId: balance.walletId,
      currency: balance.currency,
      balance: balance.balance,
      network: balance.network,
      lastUpdated: new Date()
    };
  }
}

export const storage = new DatabaseStorage();