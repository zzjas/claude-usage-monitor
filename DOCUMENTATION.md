# Claude Usage Monitor

A Node.js/TypeScript application that monitors your Claude Code usage and sends email notifications based on configurable thresholds.

## Features

- **Startup Notification**: Sends email with current usage when the monitor starts
- **Scheduled Monitoring**: Automatically checks Claude Code usage on a configurable schedule (e.g., hourly)
- **Smart Notifications**: Sends email alerts based on:
  - Weekly usage increases by threshold (e.g., every 10%)
  - Session usage dropping from >70% to 0% (session reset)
  - Usage milestones (80%, 90%, 95%, 99% for weekly; 70%, 80%, 90%, 95% for session)
- **Gmail Integration**: Sends notifications via Gmail SMTP
- **Usage History**: Tracks usage over time and stores in JSON format
- **Ping Health Check**: Verifies Claude is responsive before checking usage
- **One-Command Service**: Start/stop as background service with single commands

## Prerequisites

- Node.js (v18 or higher)
- Claude Code CLI installed and accessible in your PATH
- Gmail account with App Password for SMTP

## Quick Start

### Option 1: Using Make (Easiest)

1. **Create configuration:**
```bash
cp config.example.json config.json
```

2. **Edit `config.json`** with your Gmail credentials (see Configuration section below)

3. **Install and start:**
```bash
make install
```

That's it! The Makefile will install dependencies, build the project, and start the service.

**Common commands:**
```bash
make status    # Show current usage and service status
make test      # Send test email notifications
make logs      # View service logs
make stop      # Stop the service
make restart   # Restart the service
make clean     # Stop and remove the service
```

### Option 2: Using npm

1. **Install dependencies:**
```bash
npm install
```

2. **Create configuration:**
```bash
cp config.example.json config.json
```

3. **Edit `config.json`** with your Gmail credentials (see Configuration section below)

4. **Test email notifications (recommended):**
```bash
npm run simulate
```
You should receive 4 test emails to verify your setup is working.

5. **Start the service:**
```bash
npm run service:start
```

That's it! You'll receive a startup email with current usage, and the monitor will run in the background.

### Service Management Commands

```bash
npm run status          # Show current usage and service status (recommended!)
npm run simulate        # Test email notifications by sending 4 sample emails
npm run service:start   # Start the monitor as a background service
npm run service:stop    # Stop the monitor
npm run service:restart # Restart the monitor
npm run service:status  # Check PM2 process status
npm run service:logs    # View monitor logs
npm run service:clean   # Stop and remove the service completely
```

**Pro tip:** Use `npm run status` to get a quick overview of everything - current usage, service status, uptime, and last check time!

### Testing Email Notifications

Before starting the service, test your email configuration:

```bash
npm run simulate
```

This sends 4 test emails simulating different notification scenarios:
1. **Weekly usage increased by 10%** (20% → 35%)
2. **Session dropped from 75% to 0%** (session reset)
3. **Weekly usage reached 90%** (approaching limit warning)
4. **Session usage reached 80%** (milestone alert)

All test emails are prefixed with `[SIMULATION]` for easy identification. If you receive all 4 emails, your configuration is working correctly!

## Configuration

Edit `config.json` with the following settings:

### Email Configuration

```json
{
  "email": {
    "from": "your-email@gmail.com",
    "to": "your-email@gmail.com",
    "smtp": {
      "host": "smtp.gmail.com",
      "port": 587,
      "secure": false,
      "auth": {
        "user": "your-email@gmail.com",
        "pass": "your-gmail-app-password"
      }
    }
  }
}
```

**Setting up Gmail App Password:**
1. Go to your Google Account settings
2. Navigate to Security → 2-Step Verification
3. Scroll down to "App passwords"
4. Generate a new app password for "Mail"
5. Use this password in the `pass` field

### Schedule Configuration

Uses cron format. Examples:
- `"0 * * * *"` - Every hour at minute 0
- `"*/30 * * * *"` - Every 30 minutes
- `"0 */2 * * *"` - Every 2 hours
- `"0 9-17 * * *"` - Every hour from 9 AM to 5 PM

### Notification Configuration

```json
{
  "notifications": {
    "weeklyUsageThreshold": 10,
    "sessionDropThreshold": 70,
    "weeklyMilestones": [25, 50, 70, 80, 90, 95, 99],
    "sessionMilestones": [70, 80, 90, 95]
  }
}
```

**Configuration options:**

- `weeklyUsageThreshold`: Percentage increase to trigger notification (e.g., 10 = notify every 10% increase)
- `sessionDropThreshold`: Session percentage that triggers notification when it drops to 0
- `weeklyMilestones`: Array of weekly usage percentages that trigger notifications when reached
  - **Note:** "Weekly" refers to "Weekly (All Models)" usage
  - Default: `[25, 50, 70, 80, 90, 95, 99]`
  - Milestones ≥80% include warning about approaching limit
- `sessionMilestones`: Array of session usage percentages that trigger notifications when reached
  - Default: `[70, 80, 90, 95]`
  - Milestones ≥80% include warning about approaching limit

**Note about Weekly Opus:** The monitor tracks "Weekly (Opus)" usage but does not send notifications about it. All weekly notifications are based on "Weekly (All Models)" usage only.

## Checking Status

The `status` command provides a comprehensive overview:

```bash
npm run status
```

This displays:
- **Service Status**: Whether the monitor is running, uptime, memory usage, CPU usage
- **Current Usage**: Real-time session and weekly usage percentages with color-coded progress bars
- **History**: Last check time and total number of checks

Example output:
```
┌─────────────────────────────────────────┐
│     Claude Usage Monitor - Status      │
└─────────────────────────────────────────┘

⚙️  Service Status:
   Status: ● Running
   Uptime: 2h 15m 30s
   Restarts: 0
   Memory: 45 MB
   CPU: 0.2%

📊 Current Usage:
   Current Session:      [████              ] 28%
   Weekly (All Models):  [██████            ] 35%
   Weekly (Opus):        [                  ] 0%

🕒 History:
   Last Check: 11/21/2025, 3:30:45 PM
   Time Ago: 5m ago
   Total Checks: 47
```

## Advanced Usage

### Development Mode

For development and testing:

```bash
npm run dev
```

This runs the monitor in the foreground with TypeScript directly (no build step).

### Manual Build and Run

If you want to run without PM2:

```bash
npm run build
npm start
```

Note: This runs in the foreground and will stop when you close the terminal.

### Start on System Boot (Optional)

To make the monitor start automatically when your system boots:

```bash
# Save the current PM2 process list
npm run service:start
npx pm2 save

# Setup PM2 to start on boot
npx pm2 startup
# Follow the instructions shown by the command above
```

## Notification Examples

You'll receive email notifications for:

1. **Startup Notification**
   - Subject: "Claude Usage Monitor Started"
   - Body: Current usage report for all metrics

2. **Weekly Usage Increase (Incremental)**
   - "Weekly usage increased by 15% (from 13% to 28%)"
   - Triggered when usage increases by the configured threshold (default: 10%)

3. **Session Reset**
   - "Session usage dropped from 72% to 0% (session reset)"
   - Triggered when session drops from ≥70% to 0%

4. **Weekly Milestones**
   - "Weekly usage reached 25%"
   - "Weekly usage reached 50%"
   - "Weekly usage reached 70%"
   - "Weekly usage reached 90% (Warning: approaching limit)"
   - Default milestones: 25%, 50%, 70%, 80%, 90%, 95%, 99%

5. **Session Milestones**
   - "Session usage reached 70%"
   - "Session usage reached 90% (Warning: approaching limit)"
   - Default milestones: 70%, 80%, 90%, 95%

## File Structure

```
claude-usage-monitor/
├── src/
│   ├── index.ts                 # Main entry point
│   ├── status.ts                # Status checker (npm run status)
│   ├── simulate.ts              # Email simulation tester (npm run simulate)
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   ├── services/
│   │   ├── claudeService.ts     # Claude CLI interaction
│   │   ├── emailService.ts      # Email sending
│   │   ├── notificationService.ts # Notification logic
│   │   └── scheduler.ts         # Cron scheduling
│   └── utils/
│       ├── config.ts            # Configuration loading
│       ├── parseUsage.ts        # Usage output parsing
│       └── storage.ts           # History persistence
├── config.json                  # Your configuration (gitignored)
├── config.example.json          # Configuration template
├── ecosystem.config.js          # PM2 configuration
├── Makefile                     # Make commands for easy management
├── usage-history.json           # Usage history (auto-generated)
├── logs/                        # PM2 logs (auto-generated)
├── package.json
├── tsconfig.json
├── README.md                    # Quick start guide
└── DOCUMENTATION.md             # Detailed documentation (this file)
```

## Troubleshooting

### "timeout: command not found"

Install the `timeout` command (usually part of `coreutils`):
- Ubuntu/Debian: `sudo apt-get install coreutils`
- macOS: Should be pre-installed

### Claude command hangs

The application uses `timeout 5` to prevent hanging. If you're still experiencing issues, check:
- Claude CLI is properly installed
- You're logged in to Claude Code
- The terminal has proper permissions

### Email not sending

Check:
- Gmail App Password is correct (not your regular password)
- SMTP settings match your email provider
- Your firewall allows outbound SMTP connections
- Two-factor authentication is enabled on your Google account

### No notifications received

- Check the logs: `npm run service:logs`
- Verify your notification thresholds are appropriate
- Review `usage-history.json` to see if usage changes are being detected
- Make sure you received the startup notification (if not, check email settings)

### Service not running

Check the service status:
```bash
npm run service:status
```

View recent logs:
```bash
npm run service:logs
```

If the service keeps crashing, check:
- `config.json` is valid JSON
- All required config fields are present
- Gmail credentials are correct

## License

MIT
