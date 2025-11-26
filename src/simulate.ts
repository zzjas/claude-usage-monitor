#!/usr/bin/env node

import { loadConfig, getNotificationMethods } from './utils/config';
import { sendEmail, formatUsageEmail } from './services/emailService';
import { writeToFile, formatFileNotification } from './services/fileNotificationService';
import { UsageData, UsageHistory } from './types';
import { shouldSendNotification } from './services/notificationService';

async function sendNotification(
  config: ReturnType<typeof loadConfig>,
  subject: string,
  currentSession: number,
  weeklyAllModels: number,
  weeklySonnet: number,
  reason: string
) {
  const methods = getNotificationMethods(config);

  if (methods.includes('email')) {
    const emailBody = formatUsageEmail(currentSession, weeklyAllModels, weeklySonnet, reason);
    await sendEmail(config, subject, emailBody);
  }

  if (methods.includes('file')) {
    const fileBody = formatFileNotification(currentSession, weeklyAllModels, weeklySonnet, reason);
    await writeToFile(config, subject, fileBody);
  }
}

async function simulate() {
  console.log('\n=== Claude Usage Monitor - Notification Simulation ===\n');

  try {
    const config = loadConfig();
    const methods = getNotificationMethods(config);
    console.log(`Notification methods: ${methods.join(', ')}`);
    if (methods.includes('email') && config.email) {
      console.log(`Email recipient: ${config.email.to}`);
    }
    if (methods.includes('file') && config.file) {
      console.log(`Notification file: ${config.file.path}`);
    }
    console.log();

    // Scenario 1: Weekly usage increased by threshold
    console.log('📧 Scenario 1: Weekly usage increased by 10%');
    console.log('   Previous: 20% → Current: 35%\n');

    const scenario1Current: UsageData = {
      currentSession: 15,
      weeklyAllModels: 35,
      weeklySonnet: 0,
      timestamp: Date.now(),
    };

    const scenario1History: UsageHistory = {
      lastWeeklyUsage: 20,
      lastSessionUsage: 10,
      lastNotificationTimestamp: 0,
      history: [],
    };

    const check1 = shouldSendNotification(scenario1Current, scenario1History, config);
    if (check1.shouldNotify && check1.reason) {
      await sendNotification(
        config,
        '[SIMULATION] 🚨 Claude Code Usage Alert - Weekly Increase',
        scenario1Current.currentSession,
        scenario1Current.weeklyAllModels,
        scenario1Current.weeklySonnet,
        check1.reason
      );
      console.log('   ✅ Notification sent successfully!\n');
    }

    // Wait a bit between emails
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Scenario 2: Session dropped from >70% to 0%
    console.log('📧 Scenario 2: Session usage dropped from 75% to 0%');
    console.log('   Previous: 75% → Current: 0% (session reset)\n');

    const scenario2Current: UsageData = {
      currentSession: 0,
      weeklyAllModels: 45,
      weeklySonnet: 0,
      timestamp: Date.now(),
    };

    const scenario2History: UsageHistory = {
      lastWeeklyUsage: 45,
      lastSessionUsage: 75,
      lastNotificationTimestamp: 0,
      history: [],
    };

    const check2 = shouldSendNotification(scenario2Current, scenario2History, config);
    if (check2.shouldNotify && check2.reason) {
      await sendNotification(
        config,
        '[SIMULATION] 🚨 Claude Code Usage Alert - Session Reset',
        scenario2Current.currentSession,
        scenario2Current.weeklyAllModels,
        scenario2Current.weeklySonnet,
        check2.reason
      );
      console.log('   ✅ Notification sent successfully!\n');
    }

    // Wait a bit between emails
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Scenario 3: Weekly usage approaching limit (90%)
    console.log('📧 Scenario 3: Weekly usage reached 90% milestone');
    console.log('   Previous: 85% → Current: 91%\n');

    const scenario3Current: UsageData = {
      currentSession: 50,
      weeklyAllModels: 91,
      weeklySonnet: 5,
      timestamp: Date.now(),
    };

    const scenario3History: UsageHistory = {
      lastWeeklyUsage: 85,
      lastSessionUsage: 45,
      lastNotificationTimestamp: 0,
      history: [],
    };

    const check3 = shouldSendNotification(scenario3Current, scenario3History, config);
    if (check3.shouldNotify && check3.reason) {
      await sendNotification(
        config,
        '[SIMULATION] 🚨 Claude Code Usage Alert - Approaching Limit',
        scenario3Current.currentSession,
        scenario3Current.weeklyAllModels,
        scenario3Current.weeklySonnet,
        check3.reason
      );
      console.log('   ✅ Notification sent successfully!\n');
    }

    // Wait a bit between emails
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Scenario 4: Session usage milestone (80%)
    console.log('📧 Scenario 4: Session usage reached 80% milestone');
    console.log('   Previous: 65% → Current: 82%\n');

    const scenario4Current: UsageData = {
      currentSession: 82,
      weeklyAllModels: 55,
      weeklySonnet: 0,
      timestamp: Date.now(),
    };

    const scenario4History: UsageHistory = {
      lastWeeklyUsage: 55,
      lastSessionUsage: 65,
      lastNotificationTimestamp: 0,
      history: [],
    };

    const check4 = shouldSendNotification(scenario4Current, scenario4History, config);
    if (check4.shouldNotify && check4.reason) {
      await sendNotification(
        config,
        '[SIMULATION] 🚨 Claude Code Usage Alert - Session Milestone',
        scenario4Current.currentSession,
        scenario4Current.weeklyAllModels,
        scenario4Current.weeklySonnet,
        check4.reason
      );
      console.log('   ✅ Notification sent successfully!\n');
    }

    console.log('=== Simulation Complete ===');
    console.log('\n4 test notifications have been sent.');
    if (methods.includes('email') && config.email) {
      console.log(`Check your inbox at ${config.email.to} for test emails.`);
    }
    if (methods.includes('file') && config.file) {
      console.log(`Check ${config.file.path} for file notifications.`);
    }
    console.log('All notifications are prefixed with [SIMULATION] for easy identification.\n');

  } catch (error: any) {
    console.error('❌ Simulation failed:', error.message);
    console.error('\nMake sure:');
    console.error('  1. config.json exists and is valid');
    console.error('  2. Gmail credentials are correct');
    console.error('  3. Internet connection is available\n');
    process.exit(1);
  }
}

simulate();
