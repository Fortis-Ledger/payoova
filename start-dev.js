#!/usr/bin/env node

console.log('🚀 Starting Payoova Web3 Wallet...\n');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}✨ Web3 Wallet App Starting...${colors.reset}`);
console.log(`${colors.cyan}🌐 Server: http://localhost:5000${colors.reset}`);
console.log(`${colors.cyan}📊 API Health: http://localhost:5000/api/health${colors.reset}\n`);

// Import and execute the consolidated server
import('./server/index.ts').catch(error => {
  console.error(`${colors.red}Failed to start server:${colors.reset}`, error);
  process.exit(1);
});
