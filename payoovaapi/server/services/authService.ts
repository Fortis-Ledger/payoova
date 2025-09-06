import { storage } from '../storage';
import { PasswordService } from './passwordService';
import { JwtService } from './jwtService';
import { EmailService } from './emailService';
import { PhoneService } from './phoneService';
import { WalletService } from './walletService';
import { BlockchainService } from './blockchainService';
import { signupSchema, loginSchema, type User } from '@shared/schema';
import { z } from 'zod';

// Type for user without password field (for API responses)
type SafeUser = Omit<User, 'password'>;

// Token pair interface
interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: any;
  tokens?: TokenPair;
  error?: string;
  requiresVerification?: boolean;
}

export class AuthService {
  static async signup({ email, password, firstName, lastName }: SignupRequest): Promise<{
    success: true;
    user: any;
    requiresVerification: boolean;
  } | {
    success: false;
    error: string;
    requiresVerification?: boolean;
  }> {
    try {
      // Validate input
      const validatedData = signupSchema.parse({ email, password, firstName, lastName });
      const { password: validatedPassword, ...userData } = validatedData;

      // Validate email format
      if (!PasswordService.validateEmail(email)) {
        return {
          success: false,
          error: 'Invalid email format',
        };
      }

      // Validate password strength
      const passwordValidation = PasswordService.validatePasswordStrength(password);
      if (!passwordValidation.valid) {
        return {
          success: false,
          error: passwordValidation.errors.join(', '),
        };
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return {
          success: false,
          error: 'User with this email already exists',
        };
      }

      // Hash password
      const hashedPassword = await PasswordService.hashPassword(password);

      // Generate verification token
      const verificationToken = JwtService.generateEmailVerificationToken();
      const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create user
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        emailVerified: false,
        phoneVerified: false,
        emailVerificationToken: verificationToken,
        verificationCodeExpiry: expiryTime,
        autoWalletGenerated: false,
      });

      // Send verification email
      await EmailService.sendVerificationEmail(
        email,
        verificationToken,
        firstName
      );

      console.log(`👤 User created: ${email}`);

      const { password: _, ...userWithoutPassword } = user;
      return {
        success: true,
        user: userWithoutPassword,
        requiresVerification: true,
      };
    } catch (error) {
      console.error('Signup failed:', error);
      return {
        success: false,
        error: 'Failed to create account',
      };
    }
  }

  static async login(request: LoginRequest): Promise<{
    success: true;
    user: any;
    tokens: TokenPair;
  } | {
    success: false;
    error: string;
    requiresVerification?: boolean;
  }> {
    try {
      const { email, password } = request;

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user || !user.password) {
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

      // Verify password
      const isPasswordValid = await PasswordService.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

      // Check if email is verified
      if (!user.emailVerified) {
        return {
          success: false,
          error: 'Please verify your email before logging in',
          requiresVerification: true,
        };
      }

      // Generate JWT tokens
      const tokens = JwtService.generateTokenPair(user.id, user.email!);

      // Update last login
      await storage.updateUserLastLogin(user.id);

      console.log(`🔐 User logged in: ${email}`);

      // Return user without password field
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
          emailVerificationToken: user.emailVerificationToken,
          phoneVerificationCode: user.phoneVerificationCode,
          verificationCodeExpiry: user.verificationCodeExpiry,
          autoWalletGenerated: user.autoWalletGenerated,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        tokens,
      };
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        error: 'Login failed',
      };
    }
  }

  static async refreshToken(refreshToken: string): Promise<{
    success: true;
    user: any;
    tokens: TokenPair;
  } | {
    success: false;
    error: string;
  }> {
    try {
      // Verify refresh token
      const payload = JwtService.verifyRefreshToken(refreshToken);
      if (!payload) {
        return {
          success: false,
          error: 'Invalid refresh token',
        };
      }

      // Get user
      const user = await storage.getUser(payload.userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      // Generate new tokens
      const tokens = JwtService.generateTokenPair(user.id, user.email!);
      const newTokens = tokens;

      const { password: _, ...userWithoutPassword } = user;
      return {
        success: true,
        user: userWithoutPassword,
        tokens: newTokens,
      };
    } catch (error) {
      console.error('Token refresh failed:', error);
      return {
        success: false,
        error: 'Token refresh failed',
      };
    }
  }

  static async handleUserSignupVerification(userId: string, userEmail?: string): Promise<void> {
    if (!userEmail) return;

    try {
      // Generate verification token
      const verificationToken = JwtService.generateEmailVerificationToken();
      const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Update user with verification token
      await storage.updateUserVerification(userId, {
        emailVerificationToken: verificationToken,
        verificationCodeExpiry: expiryTime,
      });

      // Get user details
      const user = await storage.getUser(userId);
      if (!user) return;

      // Send verification email
      await EmailService.sendVerificationEmail(
        userEmail,
        verificationToken,
        user.firstName || undefined
      );

      console.log(`📧 Verification email sent to ${userEmail}`);
    } catch (error) {
      console.error('Failed to send verification email:', error);
    }
  }

  static async verifyUserEmail(token: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Find user by verification token
      const user = await storage.getUserByVerificationToken(token);
      if (!user) {
        return {
          success: false,
          error: 'Invalid verification token',
        };
      }

      // Check if token is expired
      if (!user.verificationCodeExpiry || new Date() > user.verificationCodeExpiry) {
        return {
          success: false,
          error: 'Verification token has expired',
        };
      }

      // Check if already verified
      if (user.emailVerified) {
        return {
          success: false,
          error: 'Email is already verified',
        };
      }

      // Verify email
      await storage.updateUserVerification(user.id, {
        emailVerified: true,
        emailVerificationToken: null,
        verificationCodeExpiry: null,
      });

      console.log(`✅ Email verified for user: ${user.email}`);

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          emailVerified: true, // Updated after verification
          phoneVerified: user.phoneVerified,
          emailVerificationToken: null, // Cleared after verification
          phoneVerificationCode: user.phoneVerificationCode,
          verificationCodeExpiry: null, // Cleared after verification
          autoWalletGenerated: user.autoWalletGenerated,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      } as any;
    } catch (error) {
      console.error('Email verification failed:', error);
      return {
        success: false,
        error: 'Email verification failed',
      };
    }
  }

  static async sendPhoneVerification(userId: string, phone: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate phone number format
      if (!PhoneService.isValidPhoneNumber(phone)) {
        return {
          success: false,
          error: 'Invalid phone number format',
        };
      }

      // Format phone number
      const formattedPhone = PhoneService.formatPhoneNumber(phone);

      // Generate verification code
      const verificationCode = PhoneService.generateVerificationCode();
      const expiryTime = PhoneService.getCodeExpiryTime();

      // Update user with verification code
      await storage.updateUserVerification(userId, {
        phone: formattedPhone,
        phoneVerificationCode: verificationCode,
        verificationCodeExpiry: expiryTime,
      });

      // Send SMS
      const smsSent = await PhoneService.sendVerificationCode(formattedPhone, verificationCode);
      
      if (!smsSent) {
        return {
          success: false,
          error: 'Failed to send verification code',
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('Phone verification sending failed:', error);
      return {
        success: false,
        error: 'Failed to send verification code',
      };
    }
  }

  static async verifyPhoneCode(userId: string, phone: string, code: string): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      // Verify code with Twilio
      const isValid = await PhoneService.verifyCode(phone, code);
      if (!isValid) {
        return {
          success: false,
          error: 'Invalid verification code',
        };
      }

      // Verify phone number
      await storage.updateUserVerification(userId, {
        phoneVerified: true,
        phoneVerificationCode: null,
        verificationCodeExpiry: null,
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error('Phone verification failed:', error);
      return {
        success: false,
        error: 'Verification failed',
      };
    }
  }

  static async autoGenerateWalletsForUser(userId: string): Promise<{ success: boolean; wallets?: Array<{ network: string; address: string }> }> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return { success: false };
      }

      // Check if wallets already generated
      if (user.autoWalletGenerated) {
        console.log('Wallets already generated for user:', userId);
        return { success: true };
      }

      // Generate wallets for supported networks
      const supportedNetworks = ['ethereum', 'polygon', 'bsc'];
      const createdWallets: Array<{ network: string; address: string }> = [];

      for (const network of supportedNetworks) {
        try {
          const { address, walletId } = await WalletService.generateWallet(userId, network);
          createdWallets.push({ network, address });
          
          // Sync initial balances
          await BlockchainService.syncWalletBalances(walletId, address, network);
          
          console.log(`✅ Created ${network} wallet: ${address}`);
        } catch (error) {
          console.error(`Failed to create ${network} wallet:`, error);
        }
      }

      // Mark wallets as generated
      await storage.updateUserVerification(userId, {
        autoWalletGenerated: true,
      });

      // Send wallet creation email
      if (user.email && createdWallets.length > 0) {
        await EmailService.sendWalletCreatedEmail(
          user.email,
          createdWallets,
          user.firstName || undefined
        );
      }

      console.log(`🎉 Auto-generated ${createdWallets.length} wallets for user ${userId}`);

      return {
        success: true,
        wallets: createdWallets,
      };
    } catch (error) {
      console.error('Auto wallet generation failed:', error);
      return { success: false };
    }
  }

  static async checkUserVerificationStatus(userId: string): Promise<{
    emailVerified: boolean;
    phoneVerified: boolean;
    walletsGenerated: boolean;
    pendingActions: string[];
  }> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return {
          emailVerified: false,
          phoneVerified: false,
          walletsGenerated: false,
          pendingActions: ['complete-signup'],
        };
      }

      const pendingActions: string[] = [];
      
      if (!user.emailVerified && user.email) {
        pendingActions.push('verify-email');
      }
      
      if (!user.phoneVerified && user.phone) {
        pendingActions.push('verify-phone');
      }
      
      if (!user.autoWalletGenerated && user.emailVerified) {
        pendingActions.push('generate-wallets');
      }

      return {
        emailVerified: user.emailVerified || false,
        phoneVerified: user.phoneVerified || false,
        walletsGenerated: user.autoWalletGenerated || false,
        pendingActions,
      };
    } catch (error) {
      console.error('Failed to check verification status:', error);
      return {
        emailVerified: false,
        phoneVerified: false,
        walletsGenerated: false,
        pendingActions: ['error'],
      };
    }
  }
}