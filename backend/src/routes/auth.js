const express = require("express")
const AuthController = require("../controllers/authController")
const { authenticateUser } = require("../middleware/auth")
const { validateSignup, validateProfileUpdate } = require("../middleware/validation")

const router = express.Router()

// Public routes
router.get("/health", (req, res) => {
  res.json({ status: "Auth service is running" })
})

// Firebase login - handled by frontend
router.get("/login", (req, res) => {
  res.json({ message: "Login handled by Firebase on frontend" })
})

// Firebase logout - handled by frontend
router.get("/logout", (req, res) => {
  res.json({ message: "Logout handled by Firebase on frontend" })
})

// Firebase callback - not needed since Firebase handles this on frontend
router.get("/callback", (req, res) => {
  res.json({ message: "Callback handled by Firebase on frontend" })
})

// Protected routes (require authentication)
router.use(authenticateUser)

// User registration/first login
router.post("/signup", validateSignup, AuthController.signup)

// Get user profile
router.get("/profile", AuthController.getProfile)

// Get user profile + wallets
router.get("/me", AuthController.getProfile)

// Update user profile
router.put("/profile", validateProfileUpdate, AuthController.updateProfile)

// Verify token
router.get("/verify", AuthController.verifyToken)

module.exports = router
