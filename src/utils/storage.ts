import { readFileSync, writeFileSync, existsSync } from 'fs';
import { UsageHistory, UsageData } from '../types';

/**
 * Loads usage history from file
 */
export function loadHistory(filePath: string): UsageHistory {
  if (!existsSync(filePath)) {
    return {
      lastWeeklyUsage: 0,
      lastSessionUsage: 0,
      lastNotificationTimestamp: 0,
      history: [],
    };
  }

  try {
    const data = readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    console.error('Failed to load history:', error.message);
    return {
      lastWeeklyUsage: 0,
      lastSessionUsage: 0,
      lastNotificationTimestamp: 0,
      history: [],
    };
  }
}

/**
 * Saves usage history to file
 */
export function saveHistory(filePath: string, history: UsageHistory): void {
  try {
    writeFileSync(filePath, JSON.stringify(history, null, 2), 'utf-8');
  } catch (error: any) {
    console.error('Failed to save history:', error.message);
  }
}

/**
 * Updates history with new usage data
 */
export function updateHistory(
  history: UsageHistory,
  newUsage: UsageData,
  maxHistorySize = 1000
): UsageHistory {
  const updated: UsageHistory = {
    lastWeeklyUsage: newUsage.weeklyAllModels,
    lastSessionUsage: newUsage.currentSession,
    lastSonnetUsage: newUsage.weeklySonnet,
    lastNotificationTimestamp: history.lastNotificationTimestamp,
    history: [...history.history, newUsage],
  };

  // Keep only recent history entries
  if (updated.history.length > maxHistorySize) {
    updated.history = updated.history.slice(-maxHistorySize);
  }

  return updated;
}
