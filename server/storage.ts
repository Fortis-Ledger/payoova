import {
  users,
  cryptoAssets,
  transactions,
  linkedCards,
  virtualCards,
  physicalCardApplications,
  walletAddresses,
  paymentRequests,
  cardTransactions,
  type User,
  type UpsertUser,
  type CryptoAsset,
  type InsertCryptoAsset,
  type Transaction,
  type InsertTransaction,
  type LinkedCard,
  type InsertLinkedCard,
  type VirtualCard,
  type InsertVirtualCard,
  type PhysicalCardApplication,
  type InsertPhysicalCardApplication,
  type WalletAddress,
  type InsertWalletAddress,
  type PaymentRequest,
  type InsertPaymentRequest,
  type CardTransaction,
  type InsertCardTransaction,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  
  // Crypto asset operations
  getUserCryptoAssets(userId: string): Promise<CryptoAsset[]>;
  createCryptoAsset(asset: InsertCryptoAsset): Promise<CryptoAsset>;
  updateCryptoAsset(id: string, updates: Partial<InsertCryptoAsset>): Promise<CryptoAsset>;
  
  // Transaction operations
  getUserTransactions(userId: string, limit?: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Linked card operations
  getUserLinkedCards(userId: string): Promise<LinkedCard[]>;
  createLinkedCard(card: InsertLinkedCard): Promise<LinkedCard>;
  deleteLinkedCard(id: string): Promise<void>;
  
  // Virtual card operations
  getUserVirtualCards(userId: string): Promise<VirtualCard[]>;
  createVirtualCard(card: InsertVirtualCard): Promise<VirtualCard>;
  updateVirtualCard(id: string, updates: Partial<InsertVirtualCard>): Promise<VirtualCard>;
  deleteVirtualCard(id: string): Promise<void>;
  
  // Physical card application operations
  getUserPhysicalCardApplications(userId: string): Promise<PhysicalCardApplication[]>;
  createPhysicalCardApplication(application: InsertPhysicalCardApplication): Promise<PhysicalCardApplication>;
  updatePhysicalCardApplication(id: string, updates: Partial<InsertPhysicalCardApplication>): Promise<PhysicalCardApplication>;
  
  // Wallet address operations
  getUserWalletAddresses(userId: string): Promise<WalletAddress[]>;
  createWalletAddress(address: InsertWalletAddress): Promise<WalletAddress>;
  updateWalletAddress(id: string, updates: Partial<InsertWalletAddress>): Promise<WalletAddress>;
  
  // Payment request operations
  getUserPaymentRequests(userId: string): Promise<PaymentRequest[]>;
  createPaymentRequest(request: InsertPaymentRequest): Promise<PaymentRequest>;
  updatePaymentRequest(id: string, updates: Partial<InsertPaymentRequest>): Promise<PaymentRequest>;
  getPaymentRequestByLink(link: string): Promise<PaymentRequest | undefined>;
  
  // Card transaction operations
  getCardTransactions(cardId: string, limit?: number): Promise<CardTransaction[]>;
  createCardTransaction(transaction: InsertCardTransaction): Promise<CardTransaction>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
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

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Crypto asset operations
  async getUserCryptoAssets(userId: string): Promise<CryptoAsset[]> {
    return await db
      .select()
      .from(cryptoAssets)
      .where(eq(cryptoAssets.userId, userId))
      .orderBy(desc(cryptoAssets.usdValue));
  }

  async createCryptoAsset(asset: InsertCryptoAsset): Promise<CryptoAsset> {
    const [newAsset] = await db.insert(cryptoAssets).values(asset).returning();
    return newAsset;
  }

  async updateCryptoAsset(id: string, updates: Partial<InsertCryptoAsset>): Promise<CryptoAsset> {
    const [updatedAsset] = await db
      .update(cryptoAssets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(cryptoAssets.id, id))
      .returning();
    return updatedAsset;
  }

  // Transaction operations
  async getUserTransactions(userId: string, limit = 10): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  // Linked card operations
  async getUserLinkedCards(userId: string): Promise<LinkedCard[]> {
    return await db
      .select()
      .from(linkedCards)
      .where(and(eq(linkedCards.userId, userId), eq(linkedCards.isActive, true)));
  }

  async createLinkedCard(card: InsertLinkedCard): Promise<LinkedCard> {
    const [newCard] = await db.insert(linkedCards).values(card).returning();
    return newCard;
  }

  async deleteLinkedCard(id: string): Promise<void> {
    await db
      .update(linkedCards)
      .set({ isActive: false })
      .where(eq(linkedCards.id, id));
  }

  // Virtual card operations
  async getUserVirtualCards(userId: string): Promise<VirtualCard[]> {
    return await db
      .select()
      .from(virtualCards)
      .where(eq(virtualCards.userId, userId))
      .orderBy(desc(virtualCards.createdAt));
  }

  async createVirtualCard(card: InsertVirtualCard): Promise<VirtualCard> {
    const [newCard] = await db.insert(virtualCards).values(card).returning();
    return newCard;
  }

  async updateVirtualCard(id: string, updates: Partial<InsertVirtualCard>): Promise<VirtualCard> {
    const [updatedCard] = await db
      .update(virtualCards)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(virtualCards.id, id))
      .returning();
    return updatedCard;
  }

  async deleteVirtualCard(id: string): Promise<void> {
    await db
      .update(virtualCards)
      .set({ status: 'cancelled' })
      .where(eq(virtualCards.id, id));
  }

  // Physical card application operations
  async getUserPhysicalCardApplications(userId: string): Promise<PhysicalCardApplication[]> {
    return await db
      .select()
      .from(physicalCardApplications)
      .where(eq(physicalCardApplications.userId, userId))
      .orderBy(desc(physicalCardApplications.createdAt));
  }

  async createPhysicalCardApplication(application: InsertPhysicalCardApplication): Promise<PhysicalCardApplication> {
    const [newApplication] = await db.insert(physicalCardApplications).values(application).returning();
    return newApplication;
  }

  async updatePhysicalCardApplication(id: string, updates: Partial<InsertPhysicalCardApplication>): Promise<PhysicalCardApplication> {
    const [updatedApplication] = await db
      .update(physicalCardApplications)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(physicalCardApplications.id, id))
      .returning();
    return updatedApplication;
  }

  // Wallet address operations
  async getUserWalletAddresses(userId: string): Promise<WalletAddress[]> {
    return await db
      .select()
      .from(walletAddresses)
      .where(and(eq(walletAddresses.userId, userId), eq(walletAddresses.isActive, true)))
      .orderBy(desc(walletAddresses.createdAt));
  }

  async createWalletAddress(address: InsertWalletAddress): Promise<WalletAddress> {
    const [newAddress] = await db.insert(walletAddresses).values(address).returning();
    return newAddress;
  }

  async updateWalletAddress(id: string, updates: Partial<InsertWalletAddress>): Promise<WalletAddress> {
    const [updatedAddress] = await db
      .update(walletAddresses)
      .set(updates)
      .where(eq(walletAddresses.id, id))
      .returning();
    return updatedAddress;
  }

  // Payment request operations
  async getUserPaymentRequests(userId: string): Promise<PaymentRequest[]> {
    return await db
      .select()
      .from(paymentRequests)
      .where(eq(paymentRequests.userId, userId))
      .orderBy(desc(paymentRequests.createdAt));
  }

  async createPaymentRequest(request: InsertPaymentRequest): Promise<PaymentRequest> {
    const [newRequest] = await db.insert(paymentRequests).values(request).returning();
    return newRequest;
  }

  async updatePaymentRequest(id: string, updates: Partial<InsertPaymentRequest>): Promise<PaymentRequest> {
    const [updatedRequest] = await db
      .update(paymentRequests)
      .set(updates)
      .where(eq(paymentRequests.id, id))
      .returning();
    return updatedRequest;
  }

  async getPaymentRequestByLink(link: string): Promise<PaymentRequest | undefined> {
    const [request] = await db
      .select()
      .from(paymentRequests)
      .where(eq(paymentRequests.paymentLink, link));
    return request;
  }

  // Card transaction operations
  async getCardTransactions(cardId: string, limit = 10): Promise<CardTransaction[]> {
    return await db
      .select()
      .from(cardTransactions)
      .where(eq(cardTransactions.cardId, cardId))
      .orderBy(desc(cardTransactions.createdAt))
      .limit(limit);
  }

  async createCardTransaction(transaction: InsertCardTransaction): Promise<CardTransaction> {
    const [newTransaction] = await db.insert(cardTransactions).values(transaction).returning();
    return newTransaction;
  }
}

export const storage = new DatabaseStorage();
