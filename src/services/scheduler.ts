import * as cron from 'node-cron';
import { Config } from '../types';
import { getClaudeUsage, pingClaude } from './claudeService';
import { processUsageAndNotify } from './notificationService';
import { loadHistory, saveHistory, updateHistory } from '../utils/storage';
import { sendEmail, formatUsageEmail } from './emailService';

/**
 * Main monitoring task that runs on schedule
 */
async function monitoringTask(config: Config, isStartup = false): Promise<void> {
  console.log(`[${new Date().toISOString()}] Running monitoring check...`);

  try {
    // First, ping Claude to make sure it's responsive
    const isResponsive = await pingClaude();
    if (!isResponsive) {
      console.warn('Claude is not responsive');
      return;
    }

    // Get current usage
    const currentUsage = await getClaudeUsage();
    console.log('Current usage:', {
      session: `${currentUsage.currentSession}%`,
      weekly: `${currentUsage.weeklyAllModels}%`,
      opus: `${currentUsage.weeklyOpus}%`,
    });

    // Load history
    const history = loadHistory(config.storage.dataFile);

    // On startup, always send an email with current status
    if (isStartup) {
      const emailBody = formatUsageEmail(
        currentUsage.currentSession,
        currentUsage.weeklyAllModels,
        currentUsage.weeklyOpus,
        'Monitor started - Current usage report'
      );
      await sendEmail(config, 'Claude Usage Monitor Started', emailBody);
    } else {
      // Normal operation: check if notification should be sent
      await processUsageAndNotify(currentUsage, history, config);
    }

    // Update and save history
    const updatedHistory = updateHistory(history, currentUsage);
    saveHistory(config.storage.dataFile, updatedHistory);

    console.log('Monitoring check completed successfully');
  } catch (error: any) {
    console.error('Error during monitoring check:', error.message);
  }
}

/**
 * Starts the monitoring scheduler
 */
export function startScheduler(config: Config): void {
  console.log(`Starting scheduler with interval: ${config.schedule.checkInterval}`);

  // Validate cron expression
  if (!cron.validate(config.schedule.checkInterval)) {
    throw new Error(`Invalid cron expression: ${config.schedule.checkInterval}`);
  }

  // Schedule the monitoring task
  cron.schedule(config.schedule.checkInterval, () => {
    monitoringTask(config, false);
  });

  // Run immediately on startup with startup flag
  monitoringTask(config, true);

  console.log('Scheduler started successfully');
}
