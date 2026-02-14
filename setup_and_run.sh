#!/bin/bash
#
# Koutuhal Pathways - One-Command Setup & Run
# This script configures everything and starts the application
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   Koutuhal Pathways - Automated Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${NC}"
echo ""

# Supabase project details
PROJECT_REF="qgncpqjntwapfvvuhmog"
DB_HOST="db.${PROJECT_REF}.supabase.co"

echo -e "${GREEN}✓${NC} Detected Supabase project: ${PROJECT_REF}"
echo ""

# Check if backend/.env exists
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}✗${NC} backend/.env not found"
    exit 1
fi

# Check if password is already configured
CURRENT_PASSWORD=$(grep "^POSTGRES_PASSWORD=" backend/.env | cut -d'=' -f2)

if [ "$CURRENT_PASSWORD" = "postgres" ] || [ "$CURRENT_PASSWORD" = "\${SUPABASE_DB_PASSWORD:-postgres}" ] || [ -z "$CURRENT_PASSWORD" ]; then
    echo -e "${YELLOW}⚠${NC}  Supabase database password needed"
    echo ""
    echo "To get your password:"
    echo "  1. Visit: https://supabase.com/dashboard/project/${PROJECT_REF}"
    echo "  2. Click: Settings → Database"
    echo "  3. Find or click 'Reset Database Password'"
    echo ""
    echo -ne "${BLUE}Enter your Supabase database password:${NC} "
    read -s DB_PASSWORD
    echo ""

    if [ -z "$DB_PASSWORD" ]; then
        echo -e "${RED}✗${NC} No password entered. Exiting."
        exit 1
    fi

    # Update backend/.env
    echo -e "${GREEN}✓${NC} Updating backend configuration..."

    # Backup existing .env
    cp backend/.env backend/.env.backup

    # Update password and host
    sed -i.tmp "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${DB_PASSWORD}|" backend/.env
    sed -i.tmp "s|^POSTGRES_SERVER=.*|POSTGRES_SERVER=${DB_HOST}|" backend/.env
    rm -f backend/.env.tmp

    echo -e "${GREEN}✓${NC} Configuration updated"
else
    echo -e "${GREEN}✓${NC} Database password already configured"
fi

echo ""
echo -e "${BLUE}Starting services...${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}✗${NC} Docker is not running"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

# Start Docker Compose
echo -e "${GREEN}✓${NC} Docker is running"
echo -e "${BLUE}Building and starting containers...${NC}"
echo ""

docker-compose up --build -d

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Application started successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Access your application:"
echo -e "  ${BLUE}Frontend:${NC}    http://localhost:3000"
echo -e "  ${BLUE}Backend API:${NC} http://localhost:8000"
echo -e "  ${BLUE}API Docs:${NC}    http://localhost:8000/docs"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "To stop:"
echo "  docker-compose down"
echo ""
echo -e "${GREEN}🚀 You can now create your account at http://localhost:3000${NC}"
echo ""
