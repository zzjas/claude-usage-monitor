#!/usr/bin/env node

import { loadConfig } from './utils/config';
import { startScheduler } from './services/scheduler';

/**
 * Main entry point
 */
async function main() {
  console.log('=== Claude Usage Monitor ===\n');

  try {
    // Load configuration
    const config = loadConfig();
    console.log('Configuration loaded successfully');
    console.log(`Monitoring email: ${config.email.to}`);
    console.log(`Check interval: ${config.schedule.checkInterval}\n`);

    // Start the scheduler
    startScheduler(config);

    // Keep the process running
    console.log('\nMonitoring is now running...');
    console.log('Press Ctrl+C to stop\n');

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\nShutting down gracefully...');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n\nShutting down gracefully...');
      process.exit(0);
    });

  } catch (error: any) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

main();
