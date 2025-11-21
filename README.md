# Claude Usage Monitor

Monitors your Claude Code usage and sends email notifications.

## Quick Setup

1. **Configure email:**
```bash
cp config.example.json config.json
# Edit config.json with your Gmail credentials
```

2. **Install and start:**
```bash
make install
```

## Commands

```bash
make install    # Install and start the monitor
make status     # Check current usage and service status
make test       # Send test email notifications
make help       # Show all available commands
```

## Documentation

See [DOCUMENTATION.md](DOCUMENTATION.md) for detailed configuration and usage information.
