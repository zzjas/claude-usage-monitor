import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { Config } from '../types';

/**
 * Writes a notification to a file
 */
export async function writeToFile(
  config: Config,
  subject: string,
  body: string
): Promise<void> {
  if (!config.file?.path) {
    throw new Error('File path not configured');
  }

  const filePath = resolve(process.cwd(), config.file.path);
  const dir = dirname(filePath);

  // Ensure directory exists
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const separator = '\n' + '='.repeat(60) + '\n';
  const entry = `${separator}${subject}\n${new Date().toISOString()}\n${separator}\n${body}\n`;

  try {
    appendFileSync(filePath, entry, 'utf-8');
    console.log(`Notification written to file: ${filePath}`);
  } catch (error: any) {
    console.error('Failed to write notification to file:', error.message);
    throw error;
  }
}

/**
 * Helper to get usage level emoji
 */
function getUsageEmoji(percentage: number): string {
  if (percentage >= 90) return '🔴';
  if (percentage >= 70) return '🟠';
  if (percentage >= 50) return '🟡';
  return '🟢';
}

/**
 * Helper to get progress bar
 */
function getProgressBar(percentage: number): string {
  const filled = Math.round(percentage / 10);
  const empty = 10 - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

/**
 * Creates a formatted notification body for file output
 */
export function formatFileNotification(
  currentSession: number,
  weeklyAllModels: number,
  weeklySonnet: number,
  reason: string
): string {
  return `
📋 What happened:
${reason.split('\n').map(line => `   ${line}`).join('\n')}

📊 Current Usage Summary:
┌─────────────────────────────────────────┐
│ ${getUsageEmoji(currentSession)} Session:      ${getProgressBar(currentSession)} ${currentSession.toString().padStart(3)}%  │
│ ${getUsageEmoji(weeklyAllModels)} Weekly (All): ${getProgressBar(weeklyAllModels)} ${weeklyAllModels.toString().padStart(3)}%  │
│ ${getUsageEmoji(weeklySonnet)} Weekly Sonnet: ${getProgressBar(weeklySonnet)} ${weeklySonnet.toString().padStart(3)}%  │
└─────────────────────────────────────────┘

⏰ Time: ${new Date().toLocaleString()}
`.trim();
}
