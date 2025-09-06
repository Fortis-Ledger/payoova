const { z } = require("zod")

const envSchema = z.object({
  MONGODB_URI: z.string().url(),
  FIREBASE_PROJECT_ID: z.string(),
  FIREBASE_API_KEY: z.string(),
  FIREBASE_AUTH_DOMAIN: z.string(),
  FIREBASE_STORAGE_BUCKET: z.string(),
  FIREBASE_MESSAGING_SENDER_ID: z.string(),
  FIREBASE_APP_ID: z.string(),
  FIREBASE_MEASUREMENT_ID: z.string().optional(),
  ETHEREUM_RPC_URL: z.string().url(),
  POLYGON_RPC_URL: z.string().url(),
  SEPOLIA_RPC_URL: z.string().url().optional(),
  AMOY_RPC_URL: z.string().url().optional(),
  ENCRYPTION_KEY: z.string().length(32),
  PORT: z.string().transform(Number).default("3000"),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  FRONTEND_URL: z.string().url(),
  COINGECKO_API_KEY: z.string().optional(),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
})

const validateEnv = () => {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    console.error("Environment validation failed:", error.errors)
    process.exit(1)
  }
}

module.exports = { validateEnv }