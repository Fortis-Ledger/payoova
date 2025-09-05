# Overview

Payoova is a futuristic Web3 payment gateway and wallet application that provides users with a comprehensive platform for managing digital assets and conducting crypto transactions. The application features a modern dark-themed interface with glassmorphism design elements, targeting tech-savvy individuals and crypto enthusiasts. It combines a secure digital wallet with payment gateway functionality, offering users a unified experience for managing cryptocurrencies, viewing transaction history, and performing quick financial actions.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built with React 18 and TypeScript, utilizing a modern component-based architecture. The application uses Vite as the build tool for fast development and optimized production builds. The UI is constructed with shadcn/ui components built on top of Radix UI primitives, providing accessible and customizable interface elements.

The design system implements a futuristic Web3 aesthetic with:
- **Dark Mode Theme**: Deep charcoal backgrounds with neon blue (#00BFFF) and emerald green (#00FF7F) accent colors
- **Glassmorphism Effects**: Frosted glass cards and panels with subtle transparency
- **3D Glowing Elements**: Icons and interactive elements with internal/external glows
- **Responsive Grid Layouts**: Dashboard components arranged in flexible grid systems

State management is handled through TanStack Query (React Query) for server state and local React state for UI interactions. The application uses Wouter for client-side routing, providing a lightweight alternative to React Router.

## Backend Architecture
The backend follows a REST API pattern built with Express.js and TypeScript. The server implements middleware for request logging, error handling, and JSON parsing. The architecture separates concerns into distinct layers:

- **Routes Layer**: Handles HTTP endpoints and request/response logic
- **Storage Layer**: Abstracts database operations with a repository pattern
- **Authentication Layer**: Manages user sessions and authorization

The server uses a custom storage interface (`IStorage`) that provides methods for user management, crypto assets, transactions, and linked cards. This abstraction allows for easy testing and potential database provider changes.

## Data Storage Solutions
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The database schema includes:

- **Users Table**: Stores user profiles with Replit Auth integration
- **Sessions Table**: Manages user sessions with PostgreSQL session store
- **Crypto Assets Table**: Tracks user cryptocurrency holdings with balance and USD values
- **Transactions Table**: Records all financial transactions with type categorization
- **Linked Cards Table**: Stores connected payment methods

Drizzle is configured to use Neon's serverless PostgreSQL driver, providing scalable database connectivity. The schema uses UUID primary keys generated via `gen_random_uuid()` and includes proper foreign key relationships.

## Authentication and Authorization
The application implements Replit's OpenID Connect (OIDC) authentication system using Passport.js strategy. Key features include:

- **OIDC Integration**: Automatic user discovery and token management
- **Session Management**: PostgreSQL-backed sessions with configurable TTL
- **User Profile Sync**: Automatic user creation/update on authentication
- **Route Protection**: Middleware-based authentication for API endpoints

Sessions are stored in PostgreSQL using `connect-pg-simple` with a 7-day TTL and secure cookie configuration. The authentication system handles token refresh and user profile synchronization automatically.

## External Dependencies

### Core Technologies
- **Neon Database**: Serverless PostgreSQL hosting with WebSocket support
- **Replit Auth**: OIDC-based authentication and user management system
- **Vite**: Frontend build tool with HMR and TypeScript support

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework with custom color variables
- **Radix UI**: Headless component primitives for accessibility
- **shadcn/ui**: Pre-built component library with consistent design system
- **React Icons**: Icon library including crypto and social media icons

### State Management and Data Fetching
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Form state management with validation
- **Zod**: TypeScript-first schema validation for API data

### Development and Monitoring
- **ESBuild**: Fast JavaScript bundler for production builds
- **TypeScript**: Static type checking and enhanced developer experience
- **Replit Cartographer**: Development-time debugging and monitoring tools

The application is designed to be deployment-ready on Replit's infrastructure while maintaining compatibility with other hosting platforms through environment variable configuration.