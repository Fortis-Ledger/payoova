import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  decimal,
  text,
  boolean,
} from "drizzle-orm/pg-core";
import {
  sqliteTable,
  text as sqliteText,
  integer,
  real,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phoneNumber: varchar("phone_number"),
  dateOfBirth: varchar("date_of_birth"),
  address: text("address"),
  kycStatus: varchar("kyc_status").default('pending'), // 'pending', 'verified', 'rejected'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Crypto assets table
export const cryptoAssets = pgTable("crypto_assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  symbol: varchar("symbol").notNull(), // BTC, ETH, SOL
  name: varchar("name").notNull(), // Bitcoin, Ethereum, Solana
  balance: decimal("balance", { precision: 18, scale: 8 }).notNull().default('0'),
  usdValue: decimal("usd_value", { precision: 12, scale: 2 }).notNull().default('0'),
  priceChange24h: decimal("price_change_24h", { precision: 5, scale: 2 }).notNull().default('0'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // 'send', 'receive', 'purchase', 'trade'
  asset: varchar("asset").notNull(), // BTC, ETH, USD, etc.
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  usdValue: decimal("usd_value", { precision: 12, scale: 2 }).notNull(),
  fromAddress: varchar("from_address"),
  toAddress: varchar("to_address"),
  description: text("description"),
  status: varchar("status").notNull().default('completed'), // 'pending', 'completed', 'failed'
  createdAt: timestamp("created_at").defaultNow(),
});

// Linked cards table
export const linkedCards = pgTable("linked_cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  cardType: varchar("card_type").notNull(), // 'visa', 'mastercard'
  lastFourDigits: varchar("last_four_digits").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Virtual cards table
export const virtualCards = pgTable("virtual_cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  cardNumber: varchar("card_number").notNull(),
  expiryMonth: varchar("expiry_month").notNull(),
  expiryYear: varchar("expiry_year").notNull(),
  cvv: varchar("cvv").notNull(),
  cardholderName: varchar("cardholder_name").notNull(),
  nickname: varchar("nickname"),
  balance: decimal("balance", { precision: 12, scale: 2 }).notNull().default('0'),
  spendingLimit: decimal("spending_limit", { precision: 12, scale: 2 }).notNull().default('1000'),
  status: varchar("status").notNull().default('active'), // 'active', 'frozen', 'cancelled'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Physical card applications table
export const physicalCardApplications = pgTable("physical_card_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  cardType: varchar("card_type").notNull(), // 'standard', 'premium', 'metal'
  shippingAddress: text("shipping_address").notNull(),
  status: varchar("status").notNull().default('pending'), // 'pending', 'approved', 'shipped', 'delivered', 'rejected'
  applicationFee: decimal("application_fee", { precision: 8, scale: 2 }).notNull().default('0'),
  trackingNumber: varchar("tracking_number"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Wallet addresses table for different blockchains
export const walletAddresses = pgTable("wallet_addresses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  blockchain: varchar("blockchain").notNull(), // 'ethereum', 'bsc', 'polygon', 'bitcoin'
  address: varchar("address").notNull().unique(),
  privateKey: varchar("private_key"), // Encrypted
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payment requests/invoices table
export const paymentRequests = pgTable("payment_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  recipientEmail: varchar("recipient_email"),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  currency: varchar("currency").notNull(), // 'ETH', 'BTC', 'USD'
  description: text("description"),
  expiresAt: timestamp("expires_at"),
  status: varchar("status").notNull().default('pending'), // 'pending', 'paid', 'expired', 'cancelled'
  paymentLink: varchar("payment_link").unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Card transactions table
export const cardTransactions = pgTable("card_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cardId: varchar("card_id").notNull().references(() => virtualCards.id),
  merchantName: varchar("merchant_name").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency").notNull().default('USD'),
  category: varchar("category"), // 'food', 'shopping', 'transport', etc.
  status: varchar("status").notNull().default('completed'),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema exports
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertCryptoAssetSchema = createInsertSchema(cryptoAssets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertLinkedCardSchema = createInsertSchema(linkedCards).omit({
  id: true,
  createdAt: true,
});

export const insertVirtualCardSchema = createInsertSchema(virtualCards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPhysicalCardApplicationSchema = createInsertSchema(physicalCardApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWalletAddressSchema = createInsertSchema(walletAddresses).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentRequestSchema = createInsertSchema(paymentRequests).omit({
  id: true,
  createdAt: true,
});

export const insertCardTransactionSchema = createInsertSchema(cardTransactions).omit({
  id: true,
  createdAt: true,
});

// Type exports
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type CryptoAsset = typeof cryptoAssets.$inferSelect;
export type InsertCryptoAsset = z.infer<typeof insertCryptoAssetSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type LinkedCard = typeof linkedCards.$inferSelect;
export type InsertLinkedCard = z.infer<typeof insertLinkedCardSchema>;
export type VirtualCard = typeof virtualCards.$inferSelect;
export type InsertVirtualCard = z.infer<typeof insertVirtualCardSchema>;
export type PhysicalCardApplication = typeof physicalCardApplications.$inferSelect;
export type InsertPhysicalCardApplication = z.infer<typeof insertPhysicalCardApplicationSchema>;
export type WalletAddress = typeof walletAddresses.$inferSelect;
export type InsertWalletAddress = z.infer<typeof insertWalletAddressSchema>;
export type PaymentRequest = typeof paymentRequests.$inferSelect;
export type InsertPaymentRequest = z.infer<typeof insertPaymentRequestSchema>;
export type CardTransaction = typeof cardTransactions.$inferSelect;
export type InsertCardTransaction = z.infer<typeof insertCardTransactionSchema>;
