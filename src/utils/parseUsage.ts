import { UsageData } from '../types';

/**
 * Strips ANSI escape codes from a string
 */
function stripAnsiCodes(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '')
    .replace(/\x1B\][0-9;]*[a-zA-Z]/g, '')
    .replace(/\x1B\[\?[0-9;]*[a-zA-Z]/g, '')
    .replace(/\x1B\([0-9;]*[a-zA-Z]/g, '')
    .replace(/\x1B\[[0-9;]*m/g, '')
    .replace(/\u001b\[\?[0-9]{1,4}[hl]/g, '');
}

/**
 * Extracts percentage from a line containing "X% used" or "X% left"
 * Always returns the percentage as "used" (converts "left" to "used")
 */
function extractPercentage(line: string): number | null {
  // Try matching "X% used" format
  const usedMatch = line.match(/(\d+)%\s+used/);
  if (usedMatch) {
    return parseInt(usedMatch[1], 10);
  }

  // Try matching "X% left" format and convert to "used"
  const leftMatch = line.match(/(\d+)%\s+left/);
  if (leftMatch) {
    const leftPercentage = parseInt(leftMatch[1], 10);
    return 100 - leftPercentage; // Convert "left" to "used"
  }

  return null;
}

/**
 * Parses Claude usage output and extracts usage percentages
 */
export function parseUsage(rawOutput: string): UsageData {
  const cleanOutput = stripAnsiCodes(rawOutput);
  const lines = cleanOutput.split('\n');

  let currentSession = 0;
  let weeklyAllModels = 0;
  let weeklyOpus = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.includes('Current session')) {
      // Next line should contain the usage percentage
      if (i + 1 < lines.length) {
        const percentage = extractPercentage(lines[i + 1]);
        if (percentage !== null) {
          currentSession = percentage;
        }
      }
    } else if (line.includes('Current week (all models)')) {
      if (i + 1 < lines.length) {
        const percentage = extractPercentage(lines[i + 1]);
        if (percentage !== null) {
          weeklyAllModels = percentage;
        }
      }
    } else if (line.includes('Current week (Opus)')) {
      if (i + 1 < lines.length) {
        const percentage = extractPercentage(lines[i + 1]);
        if (percentage !== null) {
          weeklyOpus = percentage;
        }
      }
    }
  }

  return {
    currentSession,
    weeklyAllModels,
    weeklyOpus,
    timestamp: Date.now(),
  };
}
