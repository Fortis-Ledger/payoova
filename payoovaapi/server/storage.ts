import {
  users,
  wallets,
  transactions,
  apiKeys,
  balances,
  type User,
  type UpsertUser,
  type Wallet,
  type InsertWallet,
  type Transaction,
  type InsertTransaction,
  type ApiKey,
  type InsertApiKey,
  type Balance,
  type InsertBalance,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations - supports both OAuth and password authentication
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserLastLogin(id: string): Promise<void>;
  updateUserVerification(id: string, updates: {
    phone?: string | null;
    emailVerified?: boolean;
    phoneVerified?: boolean;
    emailVerificationToken?: string | null;
    phoneVerificationCode?: string | null;
    verificationCodeExpiry?: Date | null;
    autoWalletGenerated?: boolean;
  }): Promise<void>;
  
  // Wallet operations
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  getWallet(id: string): Promise<Wallet | undefined>;
  getWalletByAddress(address: string): Promise<Wallet | undefined>;
  getUserWallets(userId: string): Promise<Wallet[]>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  getUserTransactions(userId: string, limit?: number): Promise<Transaction[]>;
  getWalletTransactions(walletId: string, limit?: number): Promise<Transaction[]>;
  updateTransactionStatus(id: string, status: string, blockNumber?: number, gasUsed?: number): Promise<void>;
  
  // API Key operations
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  getApiKey(keyHash: string): Promise<ApiKey | undefined>;
  getUserApiKeys(userId: string): Promise<ApiKey[]>;
  updateApiKeyLastUsed(id: string): Promise<void>;
  
  // Balance operations
  upsertBalance(balance: InsertBalance): Promise<Balance>;
  getWalletBalances(walletId: string): Promise<Balance[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations - supports both OAuth and password authentication
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user;
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.emailVerificationToken, token));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserLastLogin(id: string): Promise<void> {
    await db
      .update(users)
      .set({
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  }

  async updateUserVerification(id: string, updates: {
    phone?: string | null;
    emailVerified?: boolean;
    phoneVerified?: boolean;
    emailVerificationToken?: string | null;
    phoneVerificationCode?: string | null;
    verificationCodeExpiry?: Date | null;
    autoWalletGenerated?: boolean;
  }): Promise<void> {
    await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  }

  // Wallet operations
  async createWallet(wallet: InsertWallet): Promise<Wallet> {
    const [createdWallet] = await db
      .insert(wallets)
      .values(wallet)
      .returning();
    return createdWallet;
  }

  async getWallet(id: string): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.id, id));
    return wallet;
  }

  async getWalletByAddress(address: string): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.address, address));
    return wallet;
  }

  async getUserWallets(userId: string): Promise<Wallet[]> {
    return db.select().from(wallets).where(eq(wallets.userId, userId));
  }

  // Transaction operations
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [createdTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return createdTransaction;
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async getUserTransactions(userId: string, limit = 20): Promise<Transaction[]> {
    return db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  async getWalletTransactions(walletId: string, limit = 20): Promise<Transaction[]> {
    return db
      .select()
      .from(transactions)
      .where(eq(transactions.walletId, walletId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  async updateTransactionStatus(
    id: string,
    status: string,
    blockNumber?: number,
    gasUsed?: number
  ): Promise<void> {
    await db
      .update(transactions)
      .set({
        status,
        blockNumber,
        gasUsed,
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, id));
  }

  // API Key operations
  async createApiKey(apiKey: InsertApiKey): Promise<ApiKey> {
    const [createdApiKey] = await db
      .insert(apiKeys)
      .values(apiKey)
      .returning();
    return createdApiKey;
  }

  async getApiKey(keyHash: string): Promise<ApiKey | undefined> {
    const [apiKey] = await db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.keyHash, keyHash), eq(apiKeys.isActive, true)));
    return apiKey;
  }

  async getUserApiKeys(userId: string): Promise<ApiKey[]> {
    return db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId))
      .orderBy(desc(apiKeys.createdAt));
  }

  async updateApiKeyLastUsed(id: string): Promise<void> {
    await db
      .update(apiKeys)
      .set({ lastUsed: new Date() })
      .where(eq(apiKeys.id, id));
  }

  // Balance operations
  async upsertBalance(balance: InsertBalance): Promise<Balance> {
    const [upsertedBalance] = await db
      .insert(balances)
      .values(balance)
      .onConflictDoUpdate({
        target: [balances.walletId, balances.currency, balances.network],
        set: {
          balance: balance.balance,
          lastUpdated: new Date(),
        },
      })
      .returning();
    return upsertedBalance;
  }

  async getWalletBalances(walletId: string): Promise<Balance[]> {
    return db
      .select()
      .from(balances)
      .where(eq(balances.walletId, walletId));
  }
}

export const storage = new DatabaseStorage();
