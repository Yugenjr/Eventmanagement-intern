#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting EventConnect Development Server...');
console.log('📁 Working directory:', process.cwd());

// Set environment variables
process.env.NODE_ENV = 'development';
process.env.NEXT_TELEMETRY_DISABLED = '1';

// Start Next.js development server
const nextBin = path.join(__dirname, 'node_modules', '.bin', 'next');
const args = ['dev', '--port', '3000', '--hostname', '0.0.0.0'];

console.log('🔧 Running command:', nextBin, args.join(' '));

const child = spawn('node', [nextBin, ...args], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
});

child.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
});

child.on('exit', (code) => {
  console.log(`🛑 Server exited with code ${code}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  child.kill('SIGTERM');
});
