import { exec } from 'child_process';
import { promisify } from 'util';
import { UsageData } from '../types';
import { parseUsage } from '../utils/parseUsage';

const execAsync = promisify(exec);

/**
 * Gets current Claude usage by running the /usage command
 */
export async function getClaudeUsage(): Promise<UsageData> {
  const tmpFile = `/tmp/claude-usage-${Date.now()}.txt`;

  try {
    // Use script to capture the full TUI output
    await execAsync(`script -q ${tmpFile} --command "timeout 5 claude /usage"`, {
      maxBuffer: 1024 * 1024, // 1MB buffer for output
    });
  } catch (error: any) {
    // timeout command exits with 124 when it times out, which is expected
    if (error.code !== 124 && !error.message.includes('124')) {
      throw new Error(`Failed to get Claude usage: ${error.message}`);
    }
  }

  try {
    // Read the captured output
    const { readFileSync, unlinkSync } = await import('fs');
    const output = readFileSync(tmpFile, 'utf-8');

    // Clean up temp file
    try {
      unlinkSync(tmpFile);
    } catch {
      // Ignore cleanup errors
    }

    return parseUsage(output);
  } catch (error: any) {
    throw new Error(`Failed to parse Claude usage: ${error.message}`);
  }
}

/**
 * Pings Claude to check if it's responsive
 */
export async function pingClaude(): Promise<boolean> {
  try {
    await execAsync('timeout 5 claude hello', {
      maxBuffer: 1024 * 1024,
    });
    return true;
  } catch (error: any) {
    // timeout command exits with 124 when it times out, which is expected
    if (error.code === 124 || error.message.includes('124')) {
      return true;
    }
    console.error('Failed to ping Claude:', error.message);
    return false;
  }
}
