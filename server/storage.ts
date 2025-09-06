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
  private users: Map<string, User> = new Map();
  private wallets: Map<string, Wallet[]> = new Map();
  private transactions: Map<string, Transaction[]> = new Map();
  private balances: Map<string, Balance[]> = new Map();

  // User operations - authentication focused
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.emailVerificationToken === token) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const userId = userData.id || crypto.randomUUID();
    const user: User = {
      id: userId,
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
    
    this.users.set(userId, user);
    console.log(`✅ Created user in storage: ${user.email} (ID: ${userId})`);
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    if (userData.id && this.users.has(userData.id)) {
      // Update existing user
      const existingUser = this.users.get(userData.id)!;
      const updatedUser = { ...existingUser, ...userData, updatedAt: new Date() };
      this.users.set(userData.id, updatedUser);
      return updatedUser;
    } else {
      // Create new user
      return await this.createUser(userData);
    }
  }

  async updateUserLastLogin(id: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.lastLoginAt = new Date();
      user.updatedAt = new Date();
      this.users.set(id, user);
    }
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
    const user = this.users.get(id);
    if (user) {
      Object.assign(user, updates, { updatedAt: new Date() });
      this.users.set(id, user);
      console.log(`✅ Updated verification for user ${id}:`, updates);
    }
  }

  // Wallet operations - auto-generated wallets
  async getWallets(userId: string): Promise<Wallet[]> {
    return this.wallets.get(userId) || [];
  }

  async getWallet(id: string): Promise<Wallet | undefined> {
    for (const userWallets of this.wallets.values()) {
      const wallet = userWallets.find(w => w.id === id);
      if (wallet) return wallet;
    }
    return undefined;
  }

  async createWallet(wallet: InsertWallet): Promise<Wallet> {
    const newWallet: Wallet = {
      id: crypto.randomUUID(),
      userId: wallet.userId,
      address: wallet.address,
      encryptedPrivateKey: wallet.encryptedPrivateKey,
      network: wallet.network || "ethereum",
      isActive: wallet.isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const userWallets = this.wallets.get(wallet.userId) || [];
    userWallets.push(newWallet);
    this.wallets.set(wallet.userId, userWallets);
    
    console.log(`✅ Created ${newWallet.network} wallet for user ${wallet.userId}: ${newWallet.address}`);
    return newWallet;
  }

  // Transaction operations - blockchain transactions
  async getTransactions(userId: string): Promise<Transaction[]> {
    return this.transactions.get(userId) || [];
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const newTransaction: Transaction = {
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
    
    const userTransactions = this.transactions.get(transaction.userId) || [];
    userTransactions.push(newTransaction);
    this.transactions.set(transaction.userId, userTransactions);
    
    console.log(`✅ Created transaction for user ${transaction.userId}: ${newTransaction.id}`);
    return newTransaction;
  }

  async updateTransactionStatus(id: string, status: string, transactionHash?: string): Promise<void> {
    for (const userTransactions of this.transactions.values()) {
      const transaction = userTransactions.find(t => t.id === id);
      if (transaction) {
        transaction.status = status;
        if (transactionHash) {
          transaction.transactionHash = transactionHash;
        }
        transaction.updatedAt = new Date();
        console.log(`✅ Updated transaction ${id} status to ${status}`);
        return;
      }
    }
  }

  // Balance operations - crypto asset balances
  async getBalances(walletId: string): Promise<Balance[]> {
    return this.balances.get(walletId) || [];
  }

  async updateBalance(balance: InsertBalance): Promise<Balance> {
    const walletBalances = this.balances.get(balance.walletId) || [];
    
    // Find existing balance for this currency
    const existingBalance = walletBalances.find(b => b.currency === balance.currency && b.network === balance.network);
    
    if (existingBalance) {
      // Update existing balance
      existingBalance.balance = balance.balance;
      existingBalance.lastUpdated = new Date();
      return existingBalance;
    } else {
      // Create new balance record
      const newBalance: Balance = {
        id: crypto.randomUUID(),
        walletId: balance.walletId,
        currency: balance.currency,
        balance: balance.balance,
        network: balance.network,
        lastUpdated: new Date()
      };
      
      walletBalances.push(newBalance);
      this.balances.set(balance.walletId, walletBalances);
      
      return newBalance;
    }
  }
}

export const storage = new DatabaseStorage();