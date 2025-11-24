#!/usr/bin/env node

import { loadConfig } from './utils/config';
import { sendEmail, formatUsageEmail } from './services/emailService';
import { UsageData, UsageHistory } from './types';
import { shouldSendNotification } from './services/notificationService';

async function simulate() {
  console.log('\n=== Claude Usage Monitor - Email Simulation ===\n');

  try {
    const config = loadConfig();
    console.log(`Loaded configuration for: ${config.email.to}\n`);

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
      const emailBody = formatUsageEmail(
        scenario1Current.currentSession,
        scenario1Current.weeklyAllModels,
        scenario1Current.weeklySonnet,
        check1.reason
      );

      await sendEmail(
        config,
        '[SIMULATION] Claude Code Usage Alert - Weekly Increase',
        emailBody
      );
      console.log('   ✅ Email sent successfully!\n');
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
      const emailBody = formatUsageEmail(
        scenario2Current.currentSession,
        scenario2Current.weeklyAllModels,
        scenario2Current.weeklySonnet,
        check2.reason
      );

      await sendEmail(
        config,
        '[SIMULATION] Claude Code Usage Alert - Session Reset',
        emailBody
      );
      console.log('   ✅ Email sent successfully!\n');
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
      const emailBody = formatUsageEmail(
        scenario3Current.currentSession,
        scenario3Current.weeklyAllModels,
        scenario3Current.weeklySonnet,
        check3.reason
      );

      await sendEmail(
        config,
        '[SIMULATION] Claude Code Usage Alert - Approaching Limit',
        emailBody
      );
      console.log('   ✅ Email sent successfully!\n');
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
      const emailBody = formatUsageEmail(
        scenario4Current.currentSession,
        scenario4Current.weeklyAllModels,
        scenario4Current.weeklySonnet,
        check4.reason
      );

      await sendEmail(
        config,
        '[SIMULATION] Claude Code Usage Alert - Session Milestone',
        emailBody
      );
      console.log('   ✅ Email sent successfully!\n');
    }

    console.log('=== Simulation Complete ===');
    console.log(`\nCheck your inbox at ${config.email.to} for 4 test emails.`);
    console.log('All emails are prefixed with [SIMULATION] for easy identification.\n');

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
