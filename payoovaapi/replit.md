# CryptoWallet API

## Overview

This is a secure cryptocurrency wallet management API built with a modern full-stack architecture. The application provides comprehensive wallet services including wallet generation, transaction processing, balance management, and secure private key storage. It features a React-based dashboard frontend with a Node.js/Express backend, PostgreSQL database with Drizzle ORM, and enterprise-grade security measures including AES-256 encryption and Replit authentication integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Components**: Radix UI primitives with shadcn/ui design system
- **Styling**: Tailwind CSS with custom dark theme
- **State Management**: TanStack Query for server state management
- **Build Tool**: Vite with custom configuration for monorepo structure

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with rate limiting and input validation
- **Authentication**: Passport.js with OpenID Connect (Replit Auth)
- **Session Management**: Express sessions with PostgreSQL store
- **Middleware**: Custom logging, error handling, and authentication middleware

### Database & ORM
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle with type-safe schema definitions
- **Schema Design**: 
  - Users table for authentication
  - Wallets table with encrypted private key storage
  - Transactions table for blockchain operations
  - API keys table for programmatic access
  - Balances table for cached wallet balances
  - Sessions table for authentication state

### Security Architecture
- **Encryption**: AES-256-GCM for private key encryption with PBKDF2 key derivation
- **Authentication**: JWT-based with social login support via Replit Auth
- **Rate Limiting**: Express rate limiter with configurable windows and thresholds
- **Input Validation**: Zod schemas for request validation
- **Session Security**: Secure cookies with HttpOnly and CSRF protection

### Blockchain Integration
- **Web3 Provider**: Ethers.js for Ethereum and Polygon network interactions
- **Multi-Network Support**: Configurable network endpoints for different blockchains
- **Transaction Management**: Async transaction processing with status tracking
- **Price Feeds**: CoinGecko API integration with caching for real-time pricing

### Service Layer Architecture
- **WalletService**: Handles wallet generation and cryptographic operations
- **BlockchainService**: Manages blockchain interactions and network configurations  
- **PriceService**: Fetches and caches cryptocurrency price data
- **EncryptionService**: Provides secure encryption/decryption utilities
- **Storage Interface**: Abstracted data access layer with type-safe operations

## External Dependencies

### Authentication & Identity
- **Replit Auth**: OpenID Connect integration for user authentication
- **Passport.js**: Authentication middleware with strategy pattern

### Blockchain & Cryptocurrency
- **Neon Database**: Serverless PostgreSQL for production deployments
- **Ethers.js**: Web3 library for Ethereum blockchain interactions
- **CoinGecko API**: Cryptocurrency price and market data

### Development & Deployment
- **Vite**: Frontend build tool with HMR and development server
- **Replit Platform**: Development environment with integrated deployment
- **esbuild**: Backend bundling for production builds

### UI & Styling
- **Radix UI**: Headless component primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for UI elements

### Data & Validation
- **Drizzle ORM**: Type-safe database operations and migrations
- **Zod**: Runtime type validation and schema definitions
- **TanStack Query**: Server state management and caching