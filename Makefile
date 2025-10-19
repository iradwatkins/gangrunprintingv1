# GangRun Printing - Makefile
# Simplified deployment and management commands

.PHONY: deploy restart logs clean status health help

# Default target - show help
help:
	@echo "========================================"
	@echo "  GangRun Printing - Quick Commands"
	@echo "========================================"
	@echo ""
	@echo "Available commands:"
	@echo "  make deploy   - Full deployment (kills old processes, builds fresh, starts)"
	@echo "  make restart  - Quick restart of app container only"
	@echo "  make logs     - View application logs (live tail)"
	@echo "  make status   - Show all container status"
	@echo "  make health   - Check application health"
	@echo "  make clean    - Clean Docker cache and unused images"
	@echo ""

# Full deployment using deploy.sh script
deploy:
	@echo "Starting full deployment..."
	@./deploy.sh

# Quick restart of app container only
restart:
	@echo "Restarting app container..."
	@docker-compose restart app
	@sleep 5
	@docker ps --filter "name=gangrunprinting_app" --format "table {{.Names}}\t{{.Status}}"

# View application logs (live tail)
logs:
	@docker logs -f --tail=50 gangrunprinting_app

# Show status of all containers
status:
	@echo "========================================"
	@echo "  Container Status"
	@echo "========================================"
	@docker ps --filter "name=gangrunprinting" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Check application health
health:
	@echo "Checking application health..."
	@curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3020
	@echo "Container health:"
	@docker inspect gangrunprinting_app --format='{{.State.Health.Status}}' 2>/dev/null || echo "No health check configured"

# Clean Docker cache and unused images
clean:
	@echo "Cleaning Docker cache and unused images..."
	@docker image prune -af --filter "label=com.docker.compose.project=gangrunprinting"
	@docker builder prune -af
	@echo "Cleanup complete!"
