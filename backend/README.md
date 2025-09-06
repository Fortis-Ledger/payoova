# Crypto Wallet Backend API

A secure backend API for a crypto wallet platform built with Node.js, Express, MongoDB, Firebase, and Ethers.js.

## Features

- 🔐 **Secure Authentication** - Firebase integration with JWT tokens
- 💰 **Wallet Management** - Ethereum/Polygon wallet generation and management
- 📊 **Transaction Tracking** - Complete transaction history and balance tracking
- 🔒 **Security First** - Encrypted storage, rate limiting, input validation
- 🌐 **Multi-Network** - Support for Ethereum and Polygon networks
- 💎 **Price Integration** - Real-time crypto prices via CoinGecko API

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Firebase (JWT, Social Logins)
- **Blockchain**: Ethers.js for wallet operations
- **Security**: Helmet, CORS, Rate Limiting, Input Validation

## Project Structure

\`\`\`
src/
├── config/          # Configuration files
│   ├── auth0.js     # Auth0 JWT middleware
│   ├── blockchain.js # Blockchain providers
│   ├── database.js  # MongoDB connection
│   └── logger.js    # Winston logger setup
├── controllers/     # Route controllers
├── models/         # Mongoose models
├── routes/         # Express routes
├── services/       # Business logic services
└── server.js       # Main application file
\`\`\`

## Quick Start

### Prerequisites

- Node.js (v18+)
- MongoDB
- Auth0 account
- Infura/Alchemy account for blockchain access

### Installation

1. **Clone and install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Environment Setup**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your configuration
   \`\`\`

3. **Auth0 Setup**
   - Create an Auth0 account and application
   - Enable Google Social Connection
   - Set Application Settings:
     - Callback URLs: `${FRONTEND_URL}/callback`
     - Logout URLs: `${FRONTEND_URL}`
     - Web Origins + CORS: `${FRONTEND_URL}`
   - Add scopes: `openid profile email offline_access`

4. **Required Environment Variables**
   - `MONGODB_URI` - MongoDB connection string
   - `AUTH0_DOMAIN` - Your Auth0 domain (e.g., dev-test.auth0.com)
   - `AUTH0_AUDIENCE` - Auth0 API identifier
   - `AUTH0_CLIENT_ID` - Auth0 client ID
   - `AUTH0_CLIENT_SECRET` - Auth0 client secret
   - `ETHEREUM_RPC_URL` - Ethereum RPC endpoint
   - `POLYGON_RPC_URL` - Polygon RPC endpoint
   - `ENCRYPTION_KEY` - 32-character encryption key
   - `FRONTEND_URL` - Frontend URL (e.g., http://localhost:3001)

4. **Start the server**
   \`\`\`bash
   # Development
   npm run dev
   
   # Production
   npm start
   \`\`\`

## API Endpoints

### Health
- `GET /health` - Health check

### Authentication
- `GET /api/auth/login` - Auth0 login redirect
- `GET /api/auth/logout` - Auth0 logout redirect
- `POST /api/auth/callback` - Auth0 callback handler
- `POST /api/auth/signup` - User registration via Auth0
- `GET /api/auth/profile` - Get user profile
- `GET /api/auth/me` - Get user profile + wallets
- `PUT /api/auth/profile` - Update user profile

### Wallet Management
- `GET /api/wallet/info` - Get wallet information
- `GET /api/wallet/portfolio` - Get wallet portfolio
- `POST /api/wallet/send` - Send cryptocurrency
- `POST /api/wallet/send-token` - Send ERC-20 tokens
- `POST /api/wallet/estimate-gas` - Estimate gas for transaction
- `GET /api/wallet/balance/:address` - Get wallet balance (public)
- `GET /api/wallet/token/:address/:tokenAddress` - Get token balance (public)

### Payments
- `POST /api/payments/create` - Create payment link + QR
- `GET /api/payments/:invoiceId` - Get payment status

### Transactions
- `GET /api/transactions` - Get transaction history

### Prices
- `GET /api/prices?symbols=eth,usdt,usdc,bnb` - Get cryptocurrency prices

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## Security Features

- JWT token validation via Auth0
- Rate limiting (100 requests per 15 minutes)
- Input validation with Joi
- Encrypted sensitive data storage
- CORS protection
- Helmet security headers

## Development

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Seed database with demo data
node scripts/seed.js
\`\`\`

## Deployment

1. Set production environment variables
2. Ensure MongoDB is accessible
3. Configure Auth0 for production domain
4. Deploy to your preferred platform (Heroku, AWS, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details
