#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import { getClaudeUsage } from './services/claudeService';
import { loadHistory } from './utils/storage';
import { loadConfig } from './utils/config';

const execAsync = promisify(exec);

interface PM2Status {
  running: boolean;
  uptime?: string;
  restarts?: number;
  memory?: string;
  cpu?: string;
}

async function getPM2Status(): Promise<PM2Status> {
  try {
    const { stdout } = await execAsync('npx pm2 jlist');
    const processes = JSON.parse(stdout);
    const monitor = processes.find((p: any) => p.name === 'claude-monitor');

    if (!monitor) {
      return { running: false };
    }

    const uptimeMs = Date.now() - monitor.pm2_env.pm_uptime;
    const uptimeSec = Math.floor(uptimeMs / 1000);
    const hours = Math.floor(uptimeSec / 3600);
    const minutes = Math.floor((uptimeSec % 3600) / 60);
    const seconds = uptimeSec % 60;

    let uptimeStr = '';
    if (hours > 0) uptimeStr += `${hours}h `;
    if (minutes > 0) uptimeStr += `${minutes}m `;
    uptimeStr += `${seconds}s`;

    const memoryMB = Math.round(monitor.monit.memory / 1024 / 1024);

    return {
      running: true,
      uptime: uptimeStr.trim(),
      restarts: monitor.pm2_env.restart_time,
      memory: `${memoryMB} MB`,
      cpu: `${monitor.monit.cpu}%`,
    };
  } catch (error) {
    return { running: false };
  }
}

async function showStatus() {
  console.log('\n┌─────────────────────────────────────────┐');
  console.log('│     Claude Usage Monitor - Status      │');
  console.log('└─────────────────────────────────────────┘\n');

  // Get PM2 Status
  console.log('⚙️  Service Status:');
  const pm2Status = await getPM2Status();

  if (pm2Status.running) {
    console.log(`   Status: \x1b[32m●\x1b[0m Running`);
    console.log(`   Uptime: ${pm2Status.uptime}`);
    console.log(`   Restarts: ${pm2Status.restarts}`);
    console.log(`   Memory: ${pm2Status.memory}`);
    console.log(`   CPU: ${pm2Status.cpu}`);
  } else {
    console.log(`   Status: \x1b[31m●\x1b[0m Stopped`);
    console.log(`   \x1b[33mRun 'npm run service:start' to start the monitor\x1b[0m`);
  }

  // Get Current Usage
  console.log('\n📊 Current Usage:');
  try {
    const usage = await getClaudeUsage();

    const sessionBar = createProgressBar(usage.currentSession);
    const weeklyBar = createProgressBar(usage.weeklyAllModels);
    const sonnetBar = createProgressBar(usage.weeklySonnet);

    console.log(`   Current Session:      ${sessionBar} ${usage.currentSession}%`);
    console.log(`   Weekly (All Models):  ${weeklyBar} ${usage.weeklyAllModels}%`);
    console.log(`   Weekly (Sonnet):      ${sonnetBar} ${usage.weeklySonnet}%`);
  } catch (error: any) {
    console.log(`   \x1b[31mFailed to fetch usage: ${error.message}\x1b[0m`);
  }

  // Get Last Check Info
  console.log('\n🕒 History:');
  try {
    const config = loadConfig();
    const history = loadHistory(config.storage.dataFile);

    if (history.history.length > 0) {
      const lastCheck = history.history[history.history.length - 1];
      const lastCheckTime = new Date(lastCheck.timestamp);
      const timeAgo = getTimeAgo(lastCheck.timestamp);

      console.log(`   Last Check: ${lastCheckTime.toLocaleString()}`);
      console.log(`   Time Ago: ${timeAgo}`);
      console.log(`   Total Checks: ${history.history.length}`);
    } else {
      console.log(`   No history yet`);
    }
  } catch (error: any) {
    console.log(`   \x1b[33mNo history available\x1b[0m`);
  }

  console.log('\n');
}

function createProgressBar(percentage: number, width: number = 20): string {
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;

  let color = '\x1b[32m'; // Green
  if (percentage >= 90) color = '\x1b[31m'; // Red
  else if (percentage >= 70) color = '\x1b[33m'; // Yellow

  return `${color}[${'█'.repeat(filled)}${' '.repeat(empty)}]\x1b[0m`;
}

function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

showStatus().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
