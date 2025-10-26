#!/bin/bash

# AgentDesk Docker Deployment Script
# Usage: ./docker-deploy.sh [start|stop|restart|logs|status|build]

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.production.yml"
ENV_FILE=".env.production"

# Check if .env.production exists
check_env_file() {
    if [ ! -f "$ENV_FILE" ]; then
        echo -e "${RED}Error: $ENV_FILE not found!${NC}"
        echo -e "${YELLOW}Please create it from env.production.example:${NC}"
        echo "  cp env.production.example .env.production"
        echo "  nano .env.production"
        exit 1
    fi
}

# Start services
start() {
    echo -e "${GREEN}🚀 Starting AgentDesk services...${NC}"
    check_env_file
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d
    echo -e "${GREEN}✅ Services started!${NC}"
    echo -e "${YELLOW}Access the services at:${NC}"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:3001/api"
    echo "  Widget:   http://localhost:3002"
}

# Stop services
stop() {
    echo -e "${YELLOW}🛑 Stopping AgentDesk services...${NC}"
    docker-compose -f "$COMPOSE_FILE" down
    echo -e "${GREEN}✅ Services stopped!${NC}"
}

# Restart services
restart() {
    echo -e "${YELLOW}🔄 Restarting AgentDesk services...${NC}"
    stop
    start
}

# Show logs
logs() {
    echo -e "${GREEN}📊 Showing logs (Ctrl+C to exit)...${NC}"
    docker-compose -f "$COMPOSE_FILE" logs -f
}

# Show status
status() {
    echo -e "${GREEN}📈 Services status:${NC}"
    docker-compose -f "$COMPOSE_FILE" ps
}

# Build images
build() {
    echo -e "${GREEN}🔨 Building images...${NC}"
    check_env_file
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build --parallel
    echo -e "${GREEN}✅ Build complete!${NC}"
}

# Rebuild and restart
rebuild() {
    echo -e "${GREEN}🔨 Rebuilding and restarting...${NC}"
    check_env_file
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build
    echo -e "${GREEN}✅ Rebuild complete!${NC}"
}

# Clean up
clean() {
    echo -e "${YELLOW}🧹 Cleaning up Docker resources...${NC}"
    read -p "This will remove containers, networks, and images. Continue? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose -f "$COMPOSE_FILE" down --rmi all -v
        echo -e "${GREEN}✅ Cleanup complete!${NC}"
    else
        echo -e "${YELLOW}Cleanup cancelled.${NC}"
    fi
}

# Show help
help() {
    echo "AgentDesk Docker Deployment Script"
    echo ""
    echo "Usage: ./docker-deploy.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start      Start all services"
    echo "  stop       Stop all services"
    echo "  restart    Restart all services"
    echo "  rebuild    Rebuild and restart all services"
    echo "  logs       Show logs (follow mode)"
    echo "  status     Show services status"
    echo "  build      Build images"
    echo "  clean      Remove containers, images, and volumes"
    echo "  help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./docker-deploy.sh start"
    echo "  ./docker-deploy.sh logs"
    echo "  ./docker-deploy.sh rebuild"
}

# Main script
case "${1:-help}" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    rebuild)
        rebuild
        ;;
    logs)
        logs
        ;;
    status)
        status
        ;;
    build)
        build
        ;;
    clean)
        clean
        ;;
    help|--help|-h)
        help
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo ""
        help
        exit 1
        ;;
esac

