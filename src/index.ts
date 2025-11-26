#!/usr/bin/env node

import { loadConfig, getNotificationMethods } from './utils/config';
import { startScheduler } from './services/scheduler';

/**
 * Main entry point
 */
async function main() {
  console.log('=== Claude Usage Monitor ===\n');

  try {
    // Load configuration
    const config = loadConfig();
    const methods = getNotificationMethods(config);
    console.log('Configuration loaded successfully');
    console.log(`Notification methods: ${methods.join(', ')}`);
    if (methods.includes('email') && config.email) {
      console.log(`Email recipient: ${config.email.to}`);
    }
    if (methods.includes('file') && config.file) {
      console.log(`Notification file: ${config.file.path}`);
    }
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
