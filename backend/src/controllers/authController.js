const User = require("../models/User")
const WalletService = require("../services/walletService")
const logger = require("../config/logger")
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

class AuthController {
  // Handle user signup/first login
  static async signup(req, res) {
    try {
      const { email, name, picture } = req.body
      const auth0Id = req.user.sub

      // Check if user already exists
      let user = await User.findOne({ firebaseUid: req.user.firebaseUid })

      if (user) {
        return res.status(200).json({
          message: "User already exists",
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            wallets: user.wallets,
            createdAt: user.createdAt,
          },
        })
      }

      // Generate wallets for new user
      const ethWallet = await WalletService.generateWallet()
      const bnbWallet = await WalletService.generateWallet()

      // Create new user with wallets
      user = new User({
        firebaseUid: req.user.firebaseUid,
        email: email || req.user.email,
        name: name || req.user.name,
        picture: picture || req.user.picture,
        wallets: {
          eth: {
            address: ethWallet.address,
            encryptedPrivateKey: ethWallet.encryptedPrivateKey,
          },
          bnb: {
            address: bnbWallet.address,
            encryptedPrivateKey: bnbWallet.encryptedPrivateKey,
          },
        },
      })

      await user.save()

      logger.info(`New user registered: ${user.email} with wallet: ${user.walletAddress}`)

      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          wallets: user.wallets,
          createdAt: user.createdAt,
        },
      })
    } catch (error) {
      logger.error("Signup error:", error)
      res.status(500).json({ error: "Failed to register user" })
    }
  }

  // Get user profile
  static async getProfile(req, res) {
    try {
      const user = req.user

      res.json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          wallets: user.wallets,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      })
    } catch (error) {
      logger.error("Get profile error:", error)
      res.status(500).json({ error: "Failed to fetch profile" })
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      const { name, picture } = req.body
      const user = req.user

      // Update allowed fields
      if (name) user.name = name
      if (picture) user.picture = picture

      await user.save()

      res.json({
        message: "Profile updated successfully",
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          wallets: user.wallets,
          updatedAt: user.updatedAt,
        },
      })
    } catch (error) {
      logger.error("Update profile error:", error)
      res.status(500).json({ error: "Failed to update profile" })
    }
  }

  // Verify token endpoint
  static async verifyToken(req, res) {
    try {
      res.json({
        valid: true,
        user: {
          id: req.user._id,
          email: req.user.email,
          wallets: req.user.wallets,
        },
      })
    } catch (error) {
      logger.error("Token verification error:", error)
      res.status(500).json({ error: "Token verification failed" })
    }
  }
  
  // Enable 2FA endpoint
  static async enable2FA(req, res) {
    try {
      const secret = speakeasy.generateSecret();
      const url = speakeasy.otpauthURL({ secret: secret.base32, label: 'Payoova', algorithm: 'sha512' });

      qrcode.toDataURL(url, (err, data_url) => {
        res.json({ secret: secret.base32, qrCode: data_url });
      });
    } catch (error) {
      logger.error("2FA enable error:", error);
      res.status(500).json({ error: "Failed to enable 2FA" });
    }
  }
}

module.exports = AuthController
