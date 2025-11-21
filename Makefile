.PHONY: install status test start stop restart logs clean help

# Default target
help:
	@echo "Claude Usage Monitor - Makefile Commands"
	@echo ""
	@echo "Available commands:"
	@echo "  make install    Install dependencies and start the service"
	@echo "  make status     Show current usage and service status"
	@echo "  make test       Send test email notifications"
	@echo "  make start      Start the background service"
	@echo "  make stop       Stop the background service"
	@echo "  make restart    Restart the background service"
	@echo "  make logs       View service logs"
	@echo "  make clean      Stop and remove the service completely"
	@echo ""

# Install dependencies and start service
install:
	@echo "📦 Installing dependencies..."
	npm install
	@echo ""
	@echo "🔧 Building project..."
	npm run build
	@echo ""
	@echo "🚀 Starting service..."
	npm run service:start
	@echo ""
	@echo "✅ Installation complete!"
	@echo ""
	@echo "Next steps:"
	@echo "  1. Check service status: make status"
	@echo "  2. View logs: make logs"
	@echo ""

# Show current status
status:
	@npm run status

# Run email simulation test
test:
	@npm run simulate

# Start the service
start:
	@npm run service:start

# Stop the service
stop:
	@npm run service:stop

# Restart the service
restart:
	@npm run service:restart

# View logs
logs:
	@npm run service:logs

# Clean up (stop and remove service)
clean:
	@npm run service:clean
	@echo "✅ Service stopped and removed"
