import { Router } from 'express';
import { AuthService } from '../services/authService';
import { jwtAuth } from '../middleware/jwtAuth';
import { signupSchema, loginSchema, refreshTokenSchema, verifyEmailSchema } from '@shared/schema';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: "Too many authentication attempts, please try again later.",
});

const verificationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // limit each IP to 5 verification requests per 10 minutes
  message: "Too many verification requests, please try again later.",
});

// Password-based authentication routes
router.post('/signup', authLimiter, async (req, res) => {
  try {
    const validatedData = signupSchema.parse(req.body);
    const result = await AuthService.signup(validatedData);

    if (!result.success) {
      return res.status(400).json({
        message: result.error,
        requiresVerification: result.requiresVerification,
      });
    }

    res.status(201).json({
      message: 'Account created successfully. Please check your email for verification.',
      user: result.user,
      requiresVerification: result.requiresVerification,
    });
  } catch (error) {
    console.error('Signup error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid request data',
        errors: error.errors,
      });
    }

    res.status(500).json({
      message: 'Failed to create account',
    });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await AuthService.login(validatedData);

    if (!result.success) {
      return res.status(401).json({
        message: result.error,
        requiresVerification: result.requiresVerification,
      });
    }

    res.json({
      message: 'Login successful',
      user: result.user,
      tokens: result.tokens,
    });
  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid request data',
        errors: error.errors,
      });
    }

    res.status(500).json({
      message: 'Login failed',
    });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const validatedData = refreshTokenSchema.parse(req.body);
    const result = await AuthService.refreshToken(validatedData.refreshToken);

    if (!result.success) {
      return res.status(401).json({
        message: result.error,
      });
    }

    res.json({
      message: 'Token refreshed successfully',
      user: result.user,
      tokens: result.tokens,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid request data',
        errors: error.errors,
      });
    }

    res.status(500).json({
      message: 'Token refresh failed',
    });
  }
});

router.post('/logout', jwtAuth, async (req, res) => {
  try {
    // In a more sophisticated implementation, you might want to:
    // 1. Add the token to a blacklist
    // 2. Store refresh tokens in the database and invalidate them
    // For now, we'll just return success since JWT tokens are stateless
    
    res.json({
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      message: 'Logout failed',
    });
  }
});

// Email verification routes
router.get('/verify-email', async (req, res) => {
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

router.post('/resend-verification', jwtAuth, verificationLimiter, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userEmail = req.user!.email;
    
    if (!userEmail) {
      return res.status(400).json({ message: "User email not found" });
    }

    await AuthService.handleUserSignupVerification(userId, userEmail);
    
    res.json({ message: "Verification email sent successfully" });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ message: "Failed to resend verification email" });
  }
});

// User profile route
router.get('/me', jwtAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const verificationStatus = await AuthService.checkUserVerificationStatus(userId);

    res.json({
      user: {
        id: req.user!.id,
        email: req.user!.email,
      },
      verification: verificationStatus,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
});

export { router as authRoutes };
