const { expressjwt: jwt } = require("express-jwt")
const jwksRsa = require("jwks-rsa")
const logger = require("./logger")

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ["RS256"],
}).unless({
  path: [
    "/health",
    "/api/auth/health",
    { url: /^\/api\/wallet\/balance\/0x[a-fA-F0-9]{40}$/, methods: ["GET"] }, // Public balance check
  ],
})

// Auth0 Management API client setup
const getAuth0ManagementToken = async () => {
  try {
    const response = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
        grant_type: "client_credentials",
      }),
    })

    const data = await response.json()
    return data.access_token
  } catch (error) {
    logger.error("Failed to get Auth0 management token:", error)
    throw error
  }
}

module.exports = {
  checkJwt,
  getAuth0ManagementToken,
}
