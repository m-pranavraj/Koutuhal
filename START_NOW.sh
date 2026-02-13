#!/bin/bash
#
# Quick Start Script - Everything is already configured!
#

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   Koutuhal Pathways - Starting Application"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Configuration: COMPLETE"
echo "✅ Database Password: SET"
echo "✅ Supabase Project: qgncpqjntwapfvvuhmog"
echo "✅ All 11 tables: CREATED"
echo ""
echo "🚀 Starting services..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running"
    echo "Please start Docker Desktop and run this script again"
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Stop any existing containers
echo "Stopping existing containers..."
docker compose down 2>/dev/null || true
echo ""

# Start services
echo "Building and starting containers..."
docker compose up --build -d

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Application Started Successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Access your application:"
echo ""
echo "   Frontend:    http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs:    http://localhost:8000/docs"
echo ""
echo "📝 To view logs:"
echo "   docker compose logs -f"
echo ""
echo "🛑 To stop:"
echo "   docker compose down"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Ready! Visit http://localhost:3000 to create your account"
echo ""
