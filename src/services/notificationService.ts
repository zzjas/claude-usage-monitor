import { Config, UsageData, UsageHistory } from '../types';
import { sendEmail, formatUsageEmail } from './emailService';

interface NotificationCheck {
  shouldNotify: boolean;
  reason?: string;
}

/**
 * Checks if a notification should be sent based on usage data and history
 */
export function shouldSendNotification(
  currentUsage: UsageData,
  history: UsageHistory,
  config: Config
): NotificationCheck {
  const reasons: string[] = [];

  // Check 1: Weekly usage increased by threshold (e.g., every 10%)
  const weeklyIncrease = currentUsage.weeklyAllModels - history.lastWeeklyUsage;
  const threshold = config.notifications.weeklyUsageThreshold;

  if (weeklyIncrease >= threshold) {
    const increments = Math.floor(weeklyIncrease / threshold);
    reasons.push(
      `Weekly usage increased by ${weeklyIncrease}% (from ${history.lastWeeklyUsage}% to ${currentUsage.weeklyAllModels}%)`
    );
  }

  // Check 2: Session usage dropped from >70% to 0%
  const sessionDropThreshold = config.notifications.sessionDropThreshold;
  if (
    history.lastSessionUsage >= sessionDropThreshold &&
    currentUsage.currentSession === 0
  ) {
    reasons.push(
      `Session usage dropped from ${history.lastSessionUsage}% to 0% (session reset)`
    );
  }

  // Check 3: Weekly usage milestones (configurable)
  const weeklyMilestones = config.notifications.weeklyMilestones || [25, 50, 70, 80, 90, 95, 99];
  for (const milestone of weeklyMilestones) {
    if (
      currentUsage.weeklyAllModels >= milestone &&
      history.lastWeeklyUsage < milestone
    ) {
      const warning = milestone >= 80 ? ' (Warning: approaching limit)' : '';
      reasons.push(
        `Weekly usage reached ${milestone}%${warning}`
      );
    }
  }

  // Check 4: Session usage milestones (configurable)
  const sessionMilestones = config.notifications.sessionMilestones || [70, 80, 90, 95];
  for (const milestone of sessionMilestones) {
    if (
      currentUsage.currentSession >= milestone &&
      history.lastSessionUsage < milestone
    ) {
      const warning = milestone >= 80 ? ' (Warning: approaching limit)' : '';
      reasons.push(
        `Session usage reached ${milestone}%${warning}`
      );
    }
  }

  // Check 5: Sonnet usage milestones (uses sessionMilestones)
  for (const milestone of sessionMilestones) {
    if (
      currentUsage.weeklySonnet >= milestone &&
      (history.lastSonnetUsage ?? 0) < milestone
    ) {
      const warning = milestone >= 80 ? ' (Warning: approaching limit)' : '';
      reasons.push(
        `Sonnet usage reached ${milestone}%${warning}`
      );
    }
  }

  if (reasons.length > 0) {
    return {
      shouldNotify: true,
      reason: reasons.join('\n'),
    };
  }

  return { shouldNotify: false };
}

/**
 * Processes usage data and sends notification if needed
 */
export async function processUsageAndNotify(
  currentUsage: UsageData,
  history: UsageHistory,
  config: Config
): Promise<void> {
  const check = shouldSendNotification(currentUsage, history, config);

  if (check.shouldNotify && check.reason) {
    const emailBody = formatUsageEmail(
      currentUsage.currentSession,
      currentUsage.weeklyAllModels,
      currentUsage.weeklySonnet,
      check.reason
    );

    await sendEmail(
      config,
      'Claude Code Usage Alert',
      emailBody
    );
  }
}
