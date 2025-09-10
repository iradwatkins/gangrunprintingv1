#!/bin/bash
# GangrunPrinting v1 Deployment Script

echo "========================================="
echo "GangrunPrinting v1 Deployment"
echo "========================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Please copy .env.example to .env and configure"
    exit 1
fi

# Build the Docker image
echo "Building Docker image..."
docker build -t gangrunprinting:v1 .

# Check if web_network exists
if ! docker network ls | grep -q "web_network"; then
    echo "Creating web_network..."
    docker network create web_network --subnet=172.30.0.0/16
fi

# Stop and remove existing container if it exists
echo "Stopping existing container..."
docker stop gangrunprinting_app 2>/dev/null || true
docker rm gangrunprinting_app 2>/dev/null || true

# Start the container
echo "Starting GangrunPrinting container..."
docker-compose up -d

# Show status
echo ""
echo "Deployment complete!"
echo "Container status:"
docker ps | grep gangrunprinting_app

echo ""
echo "To view logs: docker logs -f gangrunprinting_app"
echo "Application running on: http://localhost:3002"