const rateLimit = require("express-rate-limit")
const logger = require("../config/logger")

// General API rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`)
    res.status(429).json({
      error: "Too many requests from this IP, please try again later.",
      retryAfter: "15 minutes",
    })
  },
})

// Strict rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth requests per windowMs
  message: {
    error: "Too many authentication attempts, please try again later.",
    retryAfter: "15 minutes",
  },
  skipSuccessfulRequests: true,
})

// Transaction rate limiting
const transactionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 transactions per minute
  message: {
    error: "Transaction rate limit exceeded, please wait before sending another transaction.",
    retryAfter: "1 minute",
  },
})

// Balance check rate limiting
const balanceLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 balance checks per minute
  message: {
    error: "Balance check rate limit exceeded, please wait before checking again.",
    retryAfter: "1 minute",
  },
})

module.exports = {
  generalLimiter,
  authLimiter,
  transactionLimiter,
  balanceLimiter,
}
