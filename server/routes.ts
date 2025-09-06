import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { AuthService } from "./services/authService";
import { JwtService } from "./services/jwtService";
import { WalletService } from "./services/walletService";
import { 
  signupSchema,
  loginSchema,
  verifyEmailSchema,
  sendTransactionSchema,
  insertTransactionSchema,
  insertWalletSchema,
  insertBalanceSchema
} from "@shared/schema";
import { z } from "zod";

// JWT Authentication middleware
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const payload = JwtService.verifyAccessToken(token);
  if (!payload) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }

  req.user = payload;
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Authentication routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const result = await AuthService.signup(req.body);
      res.json(result);
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const result = await AuthService.login(req.body);
      res.json(result);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  app.post('/api/auth/refresh', async (req, res) => {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refreshToken(refreshToken);
      res.json(result);
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  app.get('/api/auth/verify-email', async (req, res) => {
    try {
      const { token } = req.query;
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ success: false, error: 'Verification token required' });
      }
      
      const result = await AuthService.verifyUserEmail(token);
      if (result.success) {
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5000'}/?verified=true`);
      } else {
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5000'}/?error=${encodeURIComponent(result.error || 'Verification failed')}`);
      }
    } catch (error) {
      console.error('Email verification error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5000'}/?error=Verification failed`);
    }
  });

  app.get('/api/auth/user', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  });

  app.get('/api/auth/verification-status', authenticateToken, async (req: any, res) => {
    try {
      const status = await AuthService.checkUserVerificationStatus(req.user.userId);
      res.json(status);
    } catch (error) {
      console.error('Verification status error:', error);
      res.status(500).json({ message: 'Failed to check verification status' });
    }
  });

  // Wallet routes
  app.get('/api/wallets', authenticateToken, async (req: any, res) => {
    try {
      const wallets = await storage.getWallets(req.user.userId);
      res.json(wallets);
    } catch (error) {
      console.error('Get wallets error:', error);
      res.status(500).json({ message: 'Failed to fetch wallets' });
    }
  });

  app.post('/api/wallets/generate', authenticateToken, async (req: any, res) => {
    try {
      const { network = 'ethereum' } = req.body;
      const result = await WalletService.generateWallet(req.user.userId, network);
      res.json(result);
    } catch (error) {
      console.error('Generate wallet error:', error);
      res.status(500).json({ message: 'Failed to generate wallet' });
    }
  });

  app.post('/api/wallets/auto-generate', authenticateToken, async (req: any, res) => {
    try {
      const result = await AuthService.autoGenerateWalletsForUser(req.user.userId);
      res.json(result);
    } catch (error) {
      console.error('Auto generate wallets error:', error);
      res.status(500).json({ message: 'Failed to auto-generate wallets' });
    }
  });

  // Transaction routes
  app.get('/api/transactions', authenticateToken, async (req: any, res) => {
    try {
      const transactions = await storage.getTransactions(req.user.userId);
      res.json(transactions);
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({ message: 'Failed to fetch transactions' });
    }
  });

  app.post('/api/transactions/send', authenticateToken, async (req: any, res) => {
    try {
      const transactionData = sendTransactionSchema.parse(req.body);
      
      // For demo, create a mock transaction
      const transaction = await storage.createTransaction({
        userId: req.user.userId,
        walletId: 'demo-wallet-id', // In production, get from request
        fromAddress: '0x1234...', // In production, get from wallet
        toAddress: transactionData.toAddress,
        amount: transactionData.amount,
        currency: transactionData.currency,
        network: transactionData.network,
        type: 'send',
        status: 'pending'
      });
      
      res.json({ success: true, transaction });
    } catch (error) {
      console.error('Send transaction error:', error);
      res.status(500).json({ message: 'Failed to send transaction' });
    }
  });

  // Balance routes
  app.get('/api/balances/:walletId', authenticateToken, async (req: any, res) => {
    try {
      const { walletId } = req.params;
      const balances = await storage.getBalances(walletId);
      res.json(balances);
    } catch (error) {
      console.error('Get balances error:', error);
      res.status(500).json({ message: 'Failed to fetch balances' });
    }
  });

  // Dashboard stats route
  app.get('/api/dashboard-stats', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.userId;
      const [wallets, transactions] = await Promise.all([
        storage.getWallets(userId),
        storage.getTransactions(userId)
      ]);

      // Mock some demo data for the dashboard
      const totalBalance = 1250.75;
      const cryptoBalance = 1250.75;
      
      res.json({
        totalBalance,
        cryptoBalance,
        wallets,
        recentTransactions: transactions.slice(0, 5),
        portfolioChange: '+5.2%',
        weeklyData: [
          { day: 'Mon', value: 1100 },
          { day: 'Tue', value: 1150 },
          { day: 'Wed', value: 1200 },
          { day: 'Thu', value: 1180 },
          { day: 'Fri', value: 1220 },
          { day: 'Sat', value: 1250 },
          { day: 'Sun', value: 1250 }
        ]
      });
    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard stats' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
