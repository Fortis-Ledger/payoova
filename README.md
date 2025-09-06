# 🚀 Payoova - Web3 Payment Gateway & Wallet

A revolutionary, all-in-one Web3 payment platform that seamlessly integrates a secure digital wallet with a robust payment gateway.

## ✨ Features

- 🔐 **Secure Authentication** - Auth0 integration with JWT tokens
- 💰 **Wallet Management** - Ethereum/Polygon wallet generation and management
- 📊 **Transaction Tracking** - Complete transaction history and balance tracking
- 🔒 **Security First** - Encrypted storage, rate limiting, input validation
- 🌐 **Multi-Network** - Support for Ethereum and Polygon networks
- 💎 **Price Integration** - Real-time crypto prices via CoinGecko API
- 🎨 **Modern UI** - Futuristic design with glassmorphism and 3D effects

## 🛠️ Tech Stack

### Frontend
- **React 18** + **TypeScript**
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Radix UI** components
- **TanStack Query** for state management
- **Wouter** for routing

### Backend
- **Node.js** + **Express**
- **MongoDB** with Mongoose ODM
- **Auth0** for authentication
- **Ethers.js** for blockchain operations
- **Winston** for logging

## 🚀 Quick Start

### Option 1: Single Command (Recommended)

```bash
# Install all dependencies
npm run setup

# Start the entire application
npm run dev
```

That's it! Your application will be running at:
- **Frontend**: http://localhost:3001
- **Backend**: http://localhost:3000
- **API Health**: http://localhost:3000/health

### Option 2: Docker (Production-like)

```bash
# Start with Docker
npm run docker:dev
```

### Option 3: Manual Setup

```bash
# Install dependencies
npm run install:all

# Start backend (Terminal 1)
npm run dev:backend

# Start frontend (Terminal 2)
npm run dev:frontend
```

## 🔧 Environment Setup

### Backend Environment Variables

Create `backend/.env` file:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/payoova

# Auth0 Configuration
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_AUDIENCE=your-auth0-api-identifier
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret

# Blockchain RPC URLs
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your-infura-project-id
POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/your-infura-project-id

# Security
ENCRYPTION_KEY=your-32-character-encryption-key-here
JWT_SECRET=your-jwt-secret-key

# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
```

## 📱 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend |
| `npm run dev:backend` | Start only backend |
| `npm run dev:frontend` | Start only frontend |
| `npm run setup` | Install all dependencies |
| `npm run docker:dev` | Start with Docker (development) |
| `npm run docker:prod` | Start with Docker (production) |
| `npm run build` | Build for production |

## 🏗️ Project Structure

```
payoova/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── middleware/     # Custom middleware
│   └── package.json
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utilities
│   └── package.json
├── docker-compose.yml      # Production Docker setup
├── docker-compose.dev.yml  # Development Docker setup
└── package.json           # Root package.json
```

## 🔐 Authentication Flow

1. User clicks login
2. Redirects to Auth0
3. User authenticates
4. Auth0 redirects back with code
5. Backend exchanges code for token
6. Frontend stores token
7. User is logged in

## 💰 Wallet Features

- **Auto Wallet Creation**: Wallet generated on first login
- **Multi-Network Support**: Ethereum + Polygon
- **Real-time Balance**: Live blockchain data
- **Transaction History**: Complete transaction tracking
- **Send/Receive**: Native currency and ERC-20 tokens
- **Portfolio Overview**: Multi-network balance summary

## 🎨 UI Features

- **Dark Theme**: Futuristic dark mode
- **Glassmorphism**: Frosted glass effects
- **3D Icons**: Glowing 3D iconography
- **Responsive Design**: Mobile-first approach
- **Smooth Animations**: Framer Motion animations

## 🚀 Deployment

### Docker Production

```bash
# Build and start production containers
npm run docker:prod
```

### Manual Production

```bash
# Build frontend
npm run build

# Start backend
cd backend && npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

If you encounter any issues:

1. Check the console logs
2. Verify environment variables
3. Ensure MongoDB is running
4. Check Auth0 configuration

---

**Made with ❤️ for the Web3 community**
