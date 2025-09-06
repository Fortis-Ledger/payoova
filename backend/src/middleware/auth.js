const { initializeFirebase, admin } = require("../config/firebase")
const User = require("../models/User")
const WalletService = require("../services/walletService")
const logger = require("../config/logger")

// Initialize Firebase Admin
const firebaseAdmin = initializeFirebase()

// Firebase JWT middleware that also fetches user data
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "No token provided" })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    try {
      // Verify Firebase token
      const decodedToken = await admin.auth().verifyIdToken(token)

      // Extract Firebase user ID
      const firebaseUid = decodedToken.uid
      logger.info(`Authenticating user with Firebase UID: ${firebaseUid}, Email: ${decodedToken.email}`)

      let user = null

      try {
        // Try to find or create user in our database
        user = await User.findOne({ firebaseUid })
        logger.info(`User lookup result: ${user ? 'Found existing user' : 'User not found, will create new'}`)

        if (!user) {
          // Auto-create user with wallets if they don't exist (first login)
          const ethWallet = await WalletService.generateWallet()
          const bnbWallet = await WalletService.generateWallet()
          user = new User({
            firebaseUid,
            email: decodedToken.email,
            name: decodedToken.name || decodedToken.email?.split('@')[0],
            picture: decodedToken.picture,
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
          logger.info(`New user created: ${user.email} with ETH wallet: ${ethWallet.address}, BNB wallet: ${bnbWallet.address}`)
        } else {
          logger.info(`Existing user found: ${user.email} with ETH wallet: ${user.wallets?.eth?.address}, BNB wallet: ${user.wallets?.bnb?.address}`)
        }
      } catch (dbError) {
        // If database is down, create a temporary user object for authentication
        logger.warn("Database unavailable, using temporary user object:", dbError.message)
        user = {
          _id: firebaseUid,
          firebaseUid,
          email: decodedToken.email,
          name: decodedToken.name || decodedToken.email?.split('@')[0],
          picture: decodedToken.picture,
          wallets: {
            eth: { address: "0x0000000000000000000000000000000000000000" },
            bnb: { address: "0x0000000000000000000000000000000000000000" }
          },
          defaultNetwork: "ethereum",
          currency: "USD"
        }
      }

      // Attach user to request object
      req.user = user
      req.firebaseUser = decodedToken
      next()
    } catch (tokenError) {
      logger.error("Firebase token verification failed:", tokenError)
      return res.status(401).json({ error: "Invalid or expired token" })
    }
  } catch (error) {
    logger.error("Auth middleware error:", error)
    return res.status(500).json({ error: "Authentication service error" })
  }
}

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next()
  }

  try {
    await authenticateUser(req, res, next)
  } catch (error) {
    // Continue without authentication if token is invalid
    next()
  }
}

module.exports = {
  authenticateUser,
  optionalAuth,
}
