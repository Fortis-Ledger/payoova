import type {
  User,
  CryptoAsset,
  InsertCryptoAsset,
  Transaction,
  InsertTransaction,
  LinkedCard,
  InsertLinkedCard,
  VirtualCard,
  InsertVirtualCard,
  PhysicalCardApplication,
  InsertPhysicalCardApplication,
  WalletAddress,
  InsertWalletAddress,
  PaymentRequest,
  InsertPaymentRequest,
  CardTransaction,
  InsertCardTransaction,
} from "@shared/schema";

// Define UpsertUser type manually
type UpsertUser = {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string | null;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
  address?: string | null;
};

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(userData: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;

  // Crypto asset operations
  getCryptoAssets(userId: string): Promise<CryptoAsset[]>;
  addCryptoAsset(asset: InsertCryptoAsset): Promise<CryptoAsset>;

  // Transaction operations
  getTransactions(userId: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;

  // Linked card operations
  getLinkedCards(userId: string): Promise<LinkedCard[]>;
  linkCard(card: InsertLinkedCard): Promise<LinkedCard>;

  // Virtual card operations
  getVirtualCards(userId: string): Promise<VirtualCard[]>;
  createVirtualCard(card: InsertVirtualCard): Promise<VirtualCard>;

  // Physical card application operations
  getPhysicalCardApplications(userId: string): Promise<PhysicalCardApplication[]>;
  createPhysicalCardApplication(application: InsertPhysicalCardApplication): Promise<PhysicalCardApplication>;

  // Wallet address operations
  getWalletAddresses(userId: string): Promise<WalletAddress[]>;
  createWalletAddress(address: InsertWalletAddress): Promise<WalletAddress>;

  // Payment request operations
  getPaymentRequests(userId: string): Promise<PaymentRequest[]>;
  createPaymentRequest(request: InsertPaymentRequest): Promise<PaymentRequest>;

  // Card transaction operations
  getCardTransactions(cardId: string): Promise<CardTransaction[]>;
  createCardTransaction(transaction: InsertCardTransaction): Promise<CardTransaction>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    // Mock user for demo
    return {
      id,
      email: "demo@payoova.com",
      firstName: "Demo",
      lastName: "User",
      profileImageUrl: null,
      phoneNumber: null,
      dateOfBirth: null,
      address: null,
      kycStatus: "pending" as const,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Mock user creation for demo
    return {
      id: String(userData.id || crypto.randomUUID()),
      email: String(userData.email || "demo@payoova.com"),
      firstName: String(userData.firstName || "Demo"),
      lastName: String(userData.lastName || "User"),
      profileImageUrl: userData.profileImageUrl || null,
      phoneNumber: userData.phoneNumber || null,
      dateOfBirth: userData.dateOfBirth || null,
      address: userData.address || null,
      kycStatus: "pending" as const,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    // Mock user update for demo
    return {
      id,
      email: "demo@payoova.com",
      firstName: "Demo",
      lastName: "User",
      profileImageUrl: null,
      phoneNumber: null,
      dateOfBirth: null,
      address: null,
      kycStatus: "pending" as const,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Mock all other methods for demo
  async getCryptoAssets(userId: string): Promise<CryptoAsset[]> {
    return [];
  }

  async addCryptoAsset(asset: InsertCryptoAsset): Promise<CryptoAsset> {
    return {
      id: crypto.randomUUID(),
      userId: String(asset.userId || "demo-user"),
      symbol: String(asset.symbol || "BTC"),
      name: String(asset.name || "Bitcoin"),
      balance: String(asset.balance || "0.0"),
      usdValue: String(asset.usdValue || "0.0"),
      priceChange24h: String(asset.priceChange24h || "0.0"),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async getTransactions(userId: string): Promise<Transaction[]> {
    return [];
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    return {
      id: crypto.randomUUID(),
      userId: String(transaction.userId || "demo-user"),
      type: String(transaction.type || "send"),
      amount: String(transaction.amount || "0.0"),
      asset: String(transaction.asset || "USD"),
      status: String(transaction.status || "pending"),
      description: String(transaction.description || null),
      usdValue: String(transaction.usdValue || "0.0"),
      fromAddress: String(transaction.fromAddress || null),
      toAddress: String(transaction.toAddress || null),
      createdAt: new Date()
    };
  }

  async getLinkedCards(userId: string): Promise<LinkedCard[]> {
    return [];
  }

  async linkCard(card: InsertLinkedCard): Promise<LinkedCard> {
    return {
      id: crypto.randomUUID(),
      userId: String(card.userId || "demo-user"),
      lastFourDigits: String(card.lastFourDigits || "1234"),
      cardType: String(card.cardType || "visa"),
      isActive: Boolean(card.isActive || true),
      createdAt: new Date()
    };
  }

  async getVirtualCards(userId: string): Promise<VirtualCard[]> {
    return [];
  }

  async createVirtualCard(card: InsertVirtualCard): Promise<VirtualCard> {
    return {
      id: crypto.randomUUID(),
      userId: String(card.userId || "demo-user"),
      cardNumber: String(card.cardNumber || "****5678"),
      expiryMonth: String(card.expiryMonth || "12"),
      expiryYear: String(card.expiryYear || "25"),
      cvv: String(card.cvv || "123"),
      cardholderName: String(card.cardholderName || "Demo User"),
      nickname: String(card.nickname || null),
      spendingLimit: String(card.spendingLimit || "1000.0"),
      balance: String(card.balance || "0.0"),
      status: String(card.status || "active"),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async getPhysicalCardApplications(userId: string): Promise<PhysicalCardApplication[]> {
    return [];
  }

  async createPhysicalCardApplication(application: InsertPhysicalCardApplication): Promise<PhysicalCardApplication> {
    return {
      id: crypto.randomUUID(),
      userId: String(application.userId || "demo-user"),
      cardType: String(application.cardType || "standard"),
      status: String(application.status || "pending"),
      shippingAddress: String(application.shippingAddress || "123 Demo St"),
      applicationFee: String(application.applicationFee || "0.0"),
      trackingNumber: String(application.trackingNumber || null),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async getWalletAddresses(userId: string): Promise<WalletAddress[]> {
    return [];
  }

  async createWalletAddress(address: InsertWalletAddress): Promise<WalletAddress> {
    return {
      id: crypto.randomUUID(),
      userId: String(address.userId || "demo-user"),
      address: String(address.address || "0x1234567890abcdef"),
      blockchain: String(address.blockchain || "ethereum"),
      isActive: Boolean(address.isActive || true),
      privateKey: String(address.privateKey || null),
      createdAt: new Date()
    };
  }

  async getPaymentRequests(userId: string): Promise<PaymentRequest[]> {
    return [];
  }

  async createPaymentRequest(request: InsertPaymentRequest): Promise<PaymentRequest> {
    return {
      id: crypto.randomUUID(),
      userId: String(request.userId || "demo-user"),
      amount: String(request.amount || "0.0"),
      currency: String(request.currency || "USD"),
      description: String(request.description || null),
      status: String(request.status || "pending"),
      paymentLink: String(request.paymentLink || null),
      recipientEmail: String(request.recipientEmail || null),
      expiresAt: request.expiresAt instanceof Date ? request.expiresAt : null,
      createdAt: new Date()
    };
  }

  async getCardTransactions(cardId: string): Promise<CardTransaction[]> {
    return [];
  }

  async createCardTransaction(transaction: InsertCardTransaction): Promise<CardTransaction> {
    return {
      id: crypto.randomUUID(),
      cardId: String(transaction.cardId || "demo-card"),
      amount: String(transaction.amount || "0.0"),
      currency: String(transaction.currency || "USD"),
      description: String(transaction.description || null),
      status: String(transaction.status || "completed"),
      merchantName: String(transaction.merchantName || "Demo Merchant"),
      category: String(transaction.category || null),
      createdAt: new Date()
    };
  }
}

export const storage = new DatabaseStorage();