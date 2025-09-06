# Crypto Wallet Backend API Documentation

## Base URL
\`\`\`
https://your-api-domain.com/api
\`\`\`

## Authentication
All protected endpoints require a valid JWT token in the Authorization header:
\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## Rate Limits
- General API: 100 requests per 15 minutes
- Authentication: 10 requests per 15 minutes
- Transactions: 5 requests per minute
- Balance checks: 30 requests per minute

## Endpoints

### Authentication

#### POST /auth/signup
Register a new user (requires Auth0 token)
\`\`\`json
{
  "email": "user@example.com",
  "name": "John Doe"
}
\`\`\`

#### GET /auth/profile
Get user profile information

#### PUT /auth/profile
Update user profile
\`\`\`json
{
  "name": "Updated Name",
  "picture": "https://example.com/avatar.jpg"
}
\`\`\`

### Wallet Management

#### GET /wallet/info
Get authenticated user's wallet information

#### GET /wallet/balance/:address
Get balance for any wallet address
- Query params: `network` (ethereum, polygon, sepolia, mumbai)

#### GET /wallet/portfolio
Get complete portfolio across all networks

#### POST /wallet/send
Send native currency (ETH/MATIC)
\`\`\`json
{
  "toAddress": "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
  "amount": "0.1",
  "network": "ethereum"
}
\`\`\`

#### POST /wallet/send-token
Send ERC-20 tokens
\`\`\`json
{
  "toAddress": "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
  "tokenAddress": "0xA0b86a33E6441b8435b662303c0f098C8c5c4b8C",
  "amount": "100",
  "network": "ethereum"
}
\`\`\`

#### POST /wallet/estimate-gas
Estimate gas for a transaction
\`\`\`json
{
  "toAddress": "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
  "amount": "0.1",
  "network": "ethereum",
  "tokenAddress": "0x..." // optional for token transfers
}
\`\`\`

### Transactions

#### GET /transactions/history
Get transaction history with pagination
- Query params: `page`, `limit`, `status`, `type`, `network`, `startDate`, `endDate`

#### GET /transactions/:txHash
Get specific transaction details

#### GET /transactions/stats
Get transaction statistics for user
- Query params: `days` (default: 30)

#### POST /transactions/:txHash/monitor
Monitor pending transaction status

### Prices

#### GET /prices/current
Get current cryptocurrency prices
- Query params: `coins` (comma-separated), `currency` (default: usd)

#### GET /prices/current/:coinId
Get price for specific cryptocurrency

#### GET /prices/historical/:coinId
Get historical price data
- Query params: `days`, `currency`

#### POST /prices/convert
Convert cryptocurrency amounts
\`\`\`json
{
  "amount": 1.5,
  "fromCoin": "ethereum",
  "toCurrency": "usd"
}
\`\`\`

### User Management

#### GET /users/dashboard
Get user dashboard data

#### PUT /users/preferences
Update user preferences
\`\`\`json
{
  "defaultNetwork": "polygon",
  "currency": "EUR",
  "securitySettings": {
    "maxDailyTransactionLimit": 5000
  }
}
\`\`\`

#### GET /users/statistics
Get user account statistics

#### POST /users/export
Export user data (GDPR compliance)

#### DELETE /users/account
Delete user account
\`\`\`json
{
  "confirmation": "DELETE_MY_ACCOUNT"
}
\`\`\`

### Admin (Requires Admin Permissions)

#### GET /users/admin/stats
Get platform statistics

#### GET /users/admin/users
Get all users with pagination

#### PUT /users/admin/users/:userId/status
Update user status

#### GET /users/admin/analytics
Get transaction analytics

## Error Responses

All endpoints return errors in the following format:
\`\`\`json
{
  "error": "Error message description",
  "details": ["Additional error details if applicable"]
}
\`\`\`

## Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

## Webhooks

#### POST /transactions/webhook
Receive transaction confirmation webhooks
- Requires `x-webhook-secret` header
\`\`\`json
{
  "txHash": "0x...",
  "status": "confirmed",
  "blockNumber": 12345,
  "gasUsed": "21000",
  "network": "ethereum"
}
