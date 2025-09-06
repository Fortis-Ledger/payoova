const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
require("dotenv").config()

const { validateEnv } = require("./config/env")
const connectDB = require("./config/database")
const { initializeFirebase } = require("./config/firebase")

// Validate environment variables
validateEnv()

// Initialize Firebase Admin
initializeFirebase()
const logger = require("./config/logger")
const authRoutes = require("./routes/auth")
const walletRoutes = require("./routes/wallet")
const transactionRoutes = require("./routes/transactions")
const userRoutes = require("./routes/users")
const priceRoutes = require("./routes/prices")
const paymentRoutes = require("./routes/payments")
const backgroundServices = require("./services/backgroundServices")
const { securityHeaders, requestLogger, suspiciousActivityDetector } = require("./middleware/security")
const { generalLimiter } = require("./middleware/rateLimiting")

const app = express()
const PORT = process.env.PORT || 3002

// Connect to MongoDB
connectDB()

backgroundServices.startAll()

app.use(securityHeaders)
app.use(requestLogger)
app.use(suspiciousActivityDetector)

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3001",
    credentials: true,
  }),
)

app.use(generalLimiter)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    version: "1.0.0",
    db: "connected", // TODO: check actual DB status
    rpc: "connected", // TODO: check RPC status
  })
})

// API routes
app.use("/api/auth", authRoutes)
app.use("/api/wallet", walletRoutes)
app.use("/api/transactions", transactionRoutes)
app.use("/api/users", userRoutes)
app.use("/api/prices", priceRoutes)
app.use("/api/payments", paymentRoutes)

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err.stack)

  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ error: "Invalid token" })
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message })
  }

  res.status(500).json({ error: "Internal server error" })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" })
})

process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully")
  backgroundServices.stopAll()
  process.exit(0)
})

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully")
  backgroundServices.stopAll()
  process.exit(0)
})

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
  console.log(`🚀 Crypto Wallet Backend running on port ${PORT}`)
})

module.exports = app
