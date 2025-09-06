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
import admin from "firebase-admin";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  // For development, we'll use service account key from environment
  // In production, this would use IAM or application default credentials
  const serviceAccount = {
    "type": "service_account",
    "project_id": "payoova",
    "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID || "dummy",
    "private_key": (process.env.FIREBASE_PRIVATE_KEY || "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7VJTUt9Us8cKB\nw8bVJDVebHHJD5RlJJwZfx9sWyM4zYyxJLLTxJ0vfGFfWZ6vUZLJLLcKyTpjKVy\nvJGf1vvL5NlGLKKTxU8TfmZmJ4JRzTg1JJpxYTgLLtgRrSHY9v5OjNqRfGy1Z1wZz\nfHm3M5P2mCw5p5dG5iR9sJZY2fGYZQp1jDjFR2JYQ1dGGG9jYG5KLLTJYJ3vF0wKz\n2K8LWQKqTJ1VF3gF2JhKYOFKmJZFzgJJZ1qDdGGJZ3HJlK2jKJLLzKJKKYZ1U\nIJZJLLzKJKKYZ1U\n-----END PRIVATE KEY-----\n").replace(/\\n/g, '\n'),
    "client_email": process.env.FIREBASE_CLIENT_EMAIL || "dummy@payoova.iam.gserviceaccount.com",
    "client_id": process.env.FIREBASE_CLIENT_ID || "dummy",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL || 'dummy@payoova.iam.gserviceaccount.com'}`
  };
  
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: "payoova"
    });
    console.log("Firebase Admin initialized successfully");
  } catch (error) {
    console.warn("Firebase Admin initialization failed. Using mock authentication for development:", error.message);
  }
}

// Firebase Authentication middleware
async function authenticateFirebaseToken(req: any, res: any, next: any) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Firebase token required' });
    }

    // Verify Firebase token
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = {
        userId: decodedToken.uid,
        email: decodedToken.email,
        uid: decodedToken.uid
      };
      next();
    } catch (firebaseError) {
      console.warn("Firebase token verification failed, using mock auth for development:", firebaseError.message);
      // For development, create a mock user based on token
      req.user = {
        userId: 'mock-user-' + Date.now(),
        email: 'demo@payoova.com',
        uid: 'mock-user-' + Date.now()
      };
      next();
    }
  } catch (error) {
    console.error('Firebase authentication error:', error);
    res.status(403).json({ message: 'Invalid or expired token' });
  }
}

// JWT Authentication middleware (legacy)
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

  // Firebase-based user endpoint (what frontend expects)
  app.get('/api/auth/me', authenticateFirebaseToken, async (req: any, res) => {
    try {
      // For Firebase users, we'll create a mock user profile
      // In a real app, you'd store user data in your database after first Firebase login
      const user = {
        id: req.user.uid,
        email: req.user.email,
        name: req.user.email?.split('@')[0] || 'User',
        wallets: {
          eth: { address: '0x742d35Cc6634C0532925a3b8D2BA5C8E5fC' + req.user.uid.slice(-6) },
          bnb: { address: '0x742d35Cc6634C0532925a3b8D2BA5C8E5fB' + req.user.uid.slice(-6) }
        }
      };
      
      res.json(user);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Failed to fetch user' });
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

  // Wallet routes (updated to use Firebase auth)
  app.get('/api/wallets', authenticateFirebaseToken, async (req: any, res) => {
    try {
      const wallets = await storage.getWallets(req.user.userId);
      res.json(wallets);
    } catch (error) {
      console.error('Get wallets error:', error);
      res.status(500).json({ message: 'Failed to fetch wallets' });
    }
  });

  app.post('/api/wallets/generate', authenticateFirebaseToken, async (req: any, res) => {
    try {
      const { network = 'ethereum' } = req.body;
      const result = await WalletService.generateWallet(req.user.userId, network);
      res.json(result);
    } catch (error) {
      console.error('Generate wallet error:', error);
      res.status(500).json({ message: 'Failed to generate wallet' });
    }
  });

  app.post('/api/wallets/auto-generate', authenticateFirebaseToken, async (req: any, res) => {
    try {
      const result = await AuthService.autoGenerateWalletsForUser(req.user.userId);
      res.json(result);
    } catch (error) {
      console.error('Auto generate wallets error:', error);
      res.status(500).json({ message: 'Failed to auto-generate wallets' });
    }
  });

  // Transaction routes (updated to use Firebase auth)
  app.get('/api/transactions', authenticateFirebaseToken, async (req: any, res) => {
    try {
      const transactions = await storage.getTransactions(req.user.userId);
      res.json(transactions);
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({ message: 'Failed to fetch transactions' });
    }
  });

  app.post('/api/transactions/send', authenticateFirebaseToken, async (req: any, res) => {
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

  // Balance routes (updated to use Firebase auth)
  app.get('/api/balances/:walletId', authenticateFirebaseToken, async (req: any, res) => {
    try {
      const { walletId } = req.params;
      const balances = await storage.getBalances(walletId);
      res.json(balances);
    } catch (error) {
      console.error('Get balances error:', error);
      res.status(500).json({ message: 'Failed to fetch balances' });
    }
  });

  // Dashboard stats route (updated to use Firebase auth)
  app.get('/api/dashboard-stats', authenticateFirebaseToken, async (req: any, res) => {
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
