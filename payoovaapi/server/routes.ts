import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./googleAuth";
import { authRoutes } from "./routes/authRoutes";
import { WalletService } from "./services/walletService";
import { BlockchainService } from "./services/blockchainService";
import { PriceService } from "./services/priceService";
import { EncryptionService } from "./services/encryptionService";
import { AuthService } from "./services/authService";
import { EmailService } from "./services/emailService";
import { 
  sendTransactionSchema, 
  verifyEmailSchema,
  sendPhoneVerificationSchema,
  verifyPhoneSchema 
} from "@shared/schema";
import { z } from "zod";
import rateLimit from "express-rate-limit";

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

const transactionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 transaction requests per minute
  message: "Too many transaction requests, please try again later.",
});

const verificationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // limit each IP to 5 verification requests per 10 minutes
  message: "Too many verification requests, please try again later.",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Apply rate limiting to API routes
  app.use('/api', apiLimiter);

  // Password-based authentication routes
  app.use('/api/auth', authRoutes);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Trigger verification email on first login if email exists and not verified
      if (user.email && !user.emailVerified && !user.emailVerificationToken) {
        await AuthService.handleUserSignupVerification(userId, user.email);
      }

      // Get user's wallets and recent transactions
      const wallets = await storage.getUserWallets(userId);
      const recentTransactions = await storage.getUserTransactions(userId, 5);
      const verificationStatus = await AuthService.checkUserVerificationStatus(userId);

      res.json({
        ...user,
        walletsCount: wallets.length,
        recentTransactions: recentTransactions.length,
        verification: verificationStatus,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Email verification routes
  app.get('/auth/verify-email', async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ message: "Verification token is required" });
      }

      const result = await AuthService.verifyUserEmail(token);
      
      if (result.success) {
        // Redirect to dashboard with success message
        res.redirect('/?verified=email');
      } else {
        res.redirect('/?error=verification-failed');
      }
    } catch (error) {
      console.error("Email verification error:", error);
      res.redirect('/?error=verification-error');
    }
  });

  app.post('/api/auth/resend-verification', isAuthenticated, verificationLimiter, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !user.email) {
        return res.status(400).json({ message: "User email not found" });
      }
      
      if (user.emailVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      await AuthService.handleUserSignupVerification(userId, user.email);
      
      res.json({ message: "Verification email sent successfully" });
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({ message: "Failed to resend verification email" });
    }
  });

  // Phone verification routes
  app.post('/api/auth/send-phone-verification', isAuthenticated, verificationLimiter, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = sendPhoneVerificationSchema.parse(req.body);
      
      const result = await AuthService.sendPhoneVerification(userId, validatedData.phone);
      
      if (result.success) {
        res.json({ message: "Verification code sent successfully" });
      } else {
        res.status(400).json({ message: result.error || "Failed to send verification code" });
      }
    } catch (error) {
      console.error("Phone verification sending error:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid request data",
          errors: error.errors,
        });
      }
      
      res.status(500).json({ message: "Failed to send verification code" });
    }
  });

  app.post('/api/auth/verify-phone', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = verifyPhoneSchema.parse(req.body);
      
      const result = await AuthService.verifyPhoneCode(
        userId, 
        validatedData.phone, 
        validatedData.code
      );
      
      if (result.success) {
        res.json({ message: "Phone verified successfully" });
      } else {
        res.status(400).json({ message: result.error || "Verification failed" });
      }
    } catch (error) {
      console.error("Phone verification error:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid request data",
          errors: error.errors,
        });
      }
      
      res.status(500).json({ message: "Phone verification failed" });
    }
  });

  // Auto wallet generation
  app.post('/api/auth/generate-wallets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (!user.emailVerified) {
        return res.status(400).json({ message: "Email verification required" });
      }
      
      const result = await AuthService.autoGenerateWalletsForUser(userId);
      
      if (result.success) {
        res.json({ 
          message: "Wallets generated successfully", 
          wallets: result.wallets 
        });
      } else {
        res.status(500).json({ message: "Failed to generate wallets" });
      }
    } catch (error) {
      console.error("Wallet generation error:", error);
      res.status(500).json({ message: "Failed to generate wallets" });
    }
  });

  // Verification status check
  app.get('/api/auth/verification-status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const status = await AuthService.checkUserVerificationStatus(userId);
      res.json(status);
    } catch (error) {
      console.error("Verification status error:", error);
      res.status(500).json({ message: "Failed to check verification status" });
    }
  });

  // Wallet routes
  app.post('/api/wallets/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { network = 'ethereum' } = req.body;

      // Check if user already has a wallet for this network
      const existingWallets = await storage.getUserWallets(userId);
      const networkWallet = existingWallets.find(w => w.network === network);

      if (networkWallet) {
        return res.status(400).json({ 
          message: `Wallet for ${network} already exists`,
          walletId: networkWallet.id,
          address: networkWallet.address,
        });
      }

      const { address, walletId } = await WalletService.generateWallet(userId, network);
      
      // Sync initial balances
      await BlockchainService.syncWalletBalances(walletId, address, network);

      res.status(201).json({
        walletId,
        address,
        network,
      });
    } catch (error) {
      console.error("Error generating wallet:", error);
      res.status(500).json({ message: "Failed to generate wallet" });
    }
  });

  app.get('/api/wallets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;

      const wallet = await storage.getWallet(id);
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }

      if (wallet.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get live balances and sync to database
      const liveBalances = await BlockchainService.getBalance(wallet.address, wallet.network);
      await BlockchainService.syncWalletBalances(wallet.id, wallet.address, wallet.network);

      // Get cached balances from database
      const cachedBalances = await storage.getWalletBalances(wallet.id);

      res.json({
        id: wallet.id,
        address: wallet.address,
        network: wallet.network,
        balances: liveBalances,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error fetching wallet:", error);
      res.status(500).json({ message: "Failed to fetch wallet" });
    }
  });

  app.get('/api/wallets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wallets = await storage.getUserWallets(userId);

      const walletsWithBalances = await Promise.all(
        wallets.map(async (wallet) => {
          try {
            const balances = await storage.getWalletBalances(wallet.id);
            return {
              id: wallet.id,
              address: wallet.address,
              network: wallet.network,
              isActive: wallet.isActive,
              createdAt: wallet.createdAt,
              balances: balances.map(b => ({
                currency: b.currency,
                balance: b.balance,
                lastUpdated: b.lastUpdated,
              })),
            };
          } catch (error) {
            console.warn(`Failed to get balances for wallet ${wallet.id}:`, error);
            return {
              id: wallet.id,
              address: wallet.address,
              network: wallet.network,
              isActive: wallet.isActive,
              createdAt: wallet.createdAt,
              balances: [],
            };
          }
        })
      );

      res.json(walletsWithBalances);
    } catch (error) {
      console.error("Error fetching wallets:", error);
      res.status(500).json({ message: "Failed to fetch wallets" });
    }
  });

  // Transaction routes
  app.post('/api/wallets/send', isAuthenticated, transactionLimiter, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { walletId, ...transactionData } = req.body;

      // Validate request body
      const validatedData = sendTransactionSchema.parse(transactionData);

      // Verify wallet ownership
      const wallet = await storage.getWallet(walletId);
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }

      if (wallet.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const txHash = await BlockchainService.sendTransaction(walletId, userId, validatedData);

      res.json({
        transactionHash: txHash,
        status: 'pending',
        message: 'Transaction submitted successfully',
      });
    } catch (error) {
      console.error("Error sending transaction:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid request data",
          errors: error.errors,
        });
      }

      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to send transaction",
      });
    }
  });

  app.get('/api/transactions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;

      const transaction = await storage.getTransaction(id);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      if (transaction.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Check for transaction status updates
      if (transaction.transactionHash && transaction.status === 'pending') {
        try {
          const statusUpdate = await BlockchainService.checkTransactionStatus(
            transaction.transactionHash,
            transaction.network
          );
          
          if (statusUpdate.status !== 'pending') {
            await storage.updateTransactionStatus(
              transaction.id,
              statusUpdate.status,
              statusUpdate.blockNumber,
              statusUpdate.gasUsed
            );
          }
        } catch (error) {
          console.warn("Failed to update transaction status:", error);
        }
      }

      res.json(transaction);
    } catch (error) {
      console.error("Error fetching transaction:", error);
      res.status(500).json({ message: "Failed to fetch transaction" });
    }
  });

  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const transactions = await storage.getUserTransactions(userId, limit);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Price routes
  app.get('/api/prices', async (req, res) => {
    try {
      const currencies = req.query.currencies 
        ? (req.query.currencies as string).split(',') 
        : ['ETH', 'MATIC', 'USDC', 'USDT'];
      
      const prices = await PriceService.getPrices(currencies);
      res.json(prices);
    } catch (error) {
      console.error("Error fetching prices:", error);
      res.status(500).json({ message: "Failed to fetch prices" });
    }
  });

  // API Key routes
  app.post('/api/keys', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { name, permissions = [], expiresAt } = req.body;

      if (!name) {
        return res.status(400).json({ message: "API key name is required" });
      }

      const apiKey = EncryptionService.generateApiKey();
      const keyHash = EncryptionService.hashApiKey(apiKey);

      const apiKeyData = {
        userId,
        name,
        keyHash,
        permissions: permissions || [],
        isActive: true,
        ...(expiresAt && { expiresAt: new Date(expiresAt) })
      };

      const createdKey = await storage.createApiKey(apiKeyData);

      // Return the API key only once
      res.status(201).json({
        id: createdKey.id,
        name: createdKey.name,
        apiKey, // Only returned on creation
        permissions: createdKey.permissions,
        expiresAt: createdKey.expiresAt,
        createdAt: createdKey.createdAt,
      });
    } catch (error) {
      console.error("Error creating API key:", error);
      res.status(500).json({ message: "Failed to create API key" });
    }
  });

  app.get('/api/keys', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const apiKeys = await storage.getUserApiKeys(userId);

      // Don't return the actual keys, only metadata
      res.json(apiKeys.map(key => ({
        id: key.id,
        name: key.name,
        permissions: key.permissions,
        isActive: key.isActive,
        lastUsed: key.lastUsed,
        expiresAt: key.expiresAt,
        createdAt: key.createdAt,
      })));
    } catch (error) {
      console.error("Error fetching API keys:", error);
      res.status(500).json({ message: "Failed to fetch API keys" });
    }
  });

  // Dashboard analytics
  app.get('/api/analytics/overview', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const [wallets, transactions, prices] = await Promise.all([
        storage.getUserWallets(userId),
        storage.getUserTransactions(userId, 100),
        PriceService.getPrices(),
      ]);

      // Calculate portfolio value
      let totalValue = 0;
      for (const wallet of wallets) {
        const balances = await storage.getWalletBalances(wallet.id);
        totalValue += PriceService.calculatePortfolioValue(
          balances.map(b => ({ currency: b.currency, balance: b.balance.toString() })),
          prices
        );
      }

      const recentTransactions = transactions.slice(0, 5).map(tx => ({
        id: tx.id,
        type: tx.type,
        currency: tx.currency,
        amount: tx.amount,
        status: tx.status,
        createdAt: tx.createdAt,
        fromAddress: tx.fromAddress.slice(0, 6) + '...' + tx.fromAddress.slice(-4),
        toAddress: tx.toAddress.slice(0, 6) + '...' + tx.toAddress.slice(-4),
      }));

      res.json({
        totalWallets: wallets.length,
        totalTransactions: transactions.length,
        portfolioValue: totalValue,
        recentTransactions,
        prices,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
