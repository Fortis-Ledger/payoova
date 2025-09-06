const Joi = require("joi")
const logger = require("../config/logger")

// Validation schemas
const signupSchema = Joi.object({
  email: Joi.string().email().optional(),
  name: Joi.string().min(1).max(100).optional(),
  picture: Joi.string().uri().optional(),
})

const profileUpdateSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  picture: Joi.string().uri().optional(),
})

const walletSendSchema = Joi.object({
  toAddress: Joi.string()
    .required()
    .pattern(/^0x[a-fA-F0-9]{40}$/),
  amount: Joi.string()
    .required()
    .pattern(/^\d+(\.\d+)?$/),
  network: Joi.string().valid("ethereum", "polygon", "sepolia", "mumbai").default("ethereum"),
  tokenAddress: Joi.string()
    .pattern(/^0x[a-fA-F0-9]{40}$/)
    .optional(),
})

const createPaymentSchema = Joi.object({
  chain: Joi.string().valid("ethereum", "polygon", "bnb").required(),
  token: Joi.string().required(),
  amount: Joi.string()
    .required()
    .pattern(/^\d+(\.\d+)?$/),
  memo: Joi.string().optional(),
  expiresInMinutes: Joi.number().min(1).max(1440).default(60), // 1 minute to 24 hours
})

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body)

    if (error) {
      logger.warn("Validation error:", error.details)
      return res.status(400).json({
        error: "Validation failed",
        details: error.details.map((detail) => detail.message),
      })
    }

    req.body = value
    next()
  }
}

// Address validation
const validateAddress = (req, res, next) => {
  const { address } = req.params

  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return res.status(400).json({ error: "Invalid Ethereum address format" })
  }

  next()
}

// User ID validation
const validateUserId = (req, res, next) => {
  const { userId } = req.params

  if (!userId || !/^[0-9a-fA-F]{24}$/.test(userId)) {
    return res.status(400).json({ error: "Invalid user ID format" })
  }

  next()
}

module.exports = {
  validateSignup: validate(signupSchema),
  validateProfileUpdate: validate(profileUpdateSchema),
  validateWalletSend: validate(walletSendSchema),
  validateCreatePayment: validate(createPaymentSchema),
  validateAddress,
  validateUserId,
}
