#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Payoova Development Environment...\n');

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

// Start backend
console.log(`${colors.blue}📦 Starting Backend Server...${colors.reset}`);
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'pipe',
  shell: true
});

backend.stdout.on('data', (data) => {
  console.log(`${colors.blue}[BACKEND]${colors.reset} ${data.toString().trim()}`);
});

backend.stderr.on('data', (data) => {
  console.log(`${colors.red}[BACKEND ERROR]${colors.reset} ${data.toString().trim()}`);
});

// Start frontend
setTimeout(() => {
  console.log(`${colors.green}🎨 Starting Frontend Server...${colors.reset}`);
  const frontend = spawn('npm', ['run', 'dev:frontend'], {
    cwd: __dirname,
    stdio: 'pipe',
    shell: true
  });

  frontend.stdout.on('data', (data) => {
    console.log(`${colors.green}[FRONTEND]${colors.reset} ${data.toString().trim()}`);
  });

  frontend.stderr.on('data', (data) => {
    console.log(`${colors.red}[FRONTEND ERROR]${colors.reset} ${data.toString().trim()}`);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log(`\n${colors.yellow}🛑 Shutting down servers...${colors.reset}`);
    backend.kill();
    frontend.kill();
    process.exit(0);
  });

}, 2000);

// Handle backend process termination
backend.on('close', (code) => {
  console.log(`${colors.red}Backend process exited with code ${code}${colors.reset}`);
});

console.log(`${colors.cyan}✨ Payoova is starting up!${colors.reset}`);
console.log(`${colors.cyan}📱 Frontend: http://localhost:3001${colors.reset}`);
console.log(`${colors.cyan}🔧 Backend: http://localhost:3000${colors.reset}`);
console.log(`${colors.cyan}📊 API Health: http://localhost:3000/health${colors.reset}\n`);
console.log(`${colors.yellow}Press Ctrl+C to stop all servers${colors.reset}\n`);
