import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertCryptoAssetSchema, 
  insertTransactionSchema, 
  insertLinkedCardSchema,
  insertVirtualCardSchema,
  insertPhysicalCardApplicationSchema,
  insertWalletAddressSchema,
  insertPaymentRequestSchema,
  insertCardTransactionSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Crypto assets routes
  app.get('/api/crypto-assets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const assets = await storage.getUserCryptoAssets(userId);
      res.json(assets);
    } catch (error) {
      console.error("Error fetching crypto assets:", error);
      res.status(500).json({ message: "Failed to fetch crypto assets" });
    }
  });

  app.post('/api/crypto-assets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const assetData = insertCryptoAssetSchema.parse({ ...req.body, userId });
      const asset = await storage.createCryptoAsset(assetData);
      res.status(201).json(asset);
    } catch (error) {
      console.error("Error creating crypto asset:", error);
      res.status(400).json({ message: "Failed to create crypto asset" });
    }
  });

  // Transactions routes
  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const transactions = await storage.getUserTransactions(userId, limit);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactionData = insertTransactionSchema.parse({ ...req.body, userId });
      const transaction = await storage.createTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(400).json({ message: "Failed to create transaction" });
    }
  });

  // Linked cards routes
  app.get('/api/linked-cards', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cards = await storage.getUserLinkedCards(userId);
      res.json(cards);
    } catch (error) {
      console.error("Error fetching linked cards:", error);
      res.status(500).json({ message: "Failed to fetch linked cards" });
    }
  });

  app.post('/api/linked-cards', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cardData = insertLinkedCardSchema.parse({ ...req.body, userId });
      const card = await storage.createLinkedCard(cardData);
      res.status(201).json(card);
    } catch (error) {
      console.error("Error linking card:", error);
      res.status(400).json({ message: "Failed to link card" });
    }
  });

  app.delete('/api/linked-cards/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteLinkedCard(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting linked card:", error);
      res.status(500).json({ message: "Failed to delete linked card" });
    }
  });

  // Virtual cards routes
  app.get('/api/virtual-cards', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cards = await storage.getUserVirtualCards(userId);
      res.json(cards);
    } catch (error) {
      console.error("Error fetching virtual cards:", error);
      res.status(500).json({ message: "Failed to fetch virtual cards" });
    }
  });

  app.post('/api/virtual-cards', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cardData = insertVirtualCardSchema.parse({ ...req.body, userId });
      const card = await storage.createVirtualCard(cardData);
      res.status(201).json(card);
    } catch (error) {
      console.error("Error creating virtual card:", error);
      res.status(400).json({ message: "Failed to create virtual card" });
    }
  });

  app.patch('/api/virtual-cards/:id', isAuthenticated, async (req: any, res) => {
    try {
      const updates = req.body;
      const card = await storage.updateVirtualCard(req.params.id, updates);
      res.json(card);
    } catch (error) {
      console.error("Error updating virtual card:", error);
      res.status(500).json({ message: "Failed to update virtual card" });
    }
  });

  app.delete('/api/virtual-cards/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteVirtualCard(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting virtual card:", error);
      res.status(500).json({ message: "Failed to delete virtual card" });
    }
  });

  // Physical card applications routes
  app.get('/api/physical-card-applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const applications = await storage.getUserPhysicalCardApplications(userId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching physical card applications:", error);
      res.status(500).json({ message: "Failed to fetch physical card applications" });
    }
  });

  app.post('/api/physical-card-applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const applicationData = insertPhysicalCardApplicationSchema.parse({ ...req.body, userId });
      const application = await storage.createPhysicalCardApplication(applicationData);
      res.status(201).json(application);
    } catch (error) {
      console.error("Error creating physical card application:", error);
      res.status(400).json({ message: "Failed to create physical card application" });
    }
  });

  // Wallet addresses routes
  app.get('/api/wallet-addresses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const addresses = await storage.getUserWalletAddresses(userId);
      res.json(addresses);
    } catch (error) {
      console.error("Error fetching wallet addresses:", error);
      res.status(500).json({ message: "Failed to fetch wallet addresses" });
    }
  });

  app.post('/api/wallet-addresses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const addressData = insertWalletAddressSchema.parse({ ...req.body, userId });
      const address = await storage.createWalletAddress(addressData);
      res.status(201).json(address);
    } catch (error) {
      console.error("Error creating wallet address:", error);
      res.status(400).json({ message: "Failed to create wallet address" });
    }
  });

  // Payment requests routes
  app.get('/api/payment-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requests = await storage.getUserPaymentRequests(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching payment requests:", error);
      res.status(500).json({ message: "Failed to fetch payment requests" });
    }
  });

  app.post('/api/payment-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requestData = insertPaymentRequestSchema.parse({ ...req.body, userId });
      const request = await storage.createPaymentRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      console.error("Error creating payment request:", error);
      res.status(400).json({ message: "Failed to create payment request" });
    }
  });

  // User profile update route
  app.patch('/api/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (req.params.id !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const updates = req.body;
      const user = await storage.updateUser(userId, updates);
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Dashboard stats route
  app.get('/api/dashboard-stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const [assets, transactions, cards] = await Promise.all([
        storage.getUserCryptoAssets(userId),
        storage.getUserTransactions(userId, 5),
        storage.getUserLinkedCards(userId)
      ]);

      const totalBalance = assets.reduce((sum, asset) => 
        sum + parseFloat(asset.usdValue), 0
      );

      const cryptoBalance = assets.reduce((sum, asset) => 
        sum + parseFloat(asset.usdValue), 0
      );

      res.json({
        totalBalance,
        cryptoBalance,
        assets,
        recentTransactions: transactions,
        linkedCards: cards
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
