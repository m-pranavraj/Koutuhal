#!/bin/bash
#
# Koutuhal Pathways - Supabase Configuration Script
# This script automatically configures the backend to connect to Supabase
#

set -e

echo "==================================================="
echo "Koutuhal Pathways - Supabase Auto-Configuration"
echo "==================================================="
echo ""

# Supabase project details
PROJECT_REF="nudmtgbbqkjgwqwztveo"
DB_HOST="db.${PROJECT_REF}.supabase.co"

echo "📊 Detected Configuration:"
echo "   Project: ${PROJECT_REF}"
echo "   Database Host: ${DB_HOST}"
echo ""

# Check if .env already has a password configured
if [ -f "backend/.env" ]; then
    if grep -q "POSTGRES_PASSWORD=postgres$" backend/.env || grep -q "POSTGRES_PASSWORD=\${" backend/.env; then
        echo "⚠️  Backend .env needs Supabase database password"
        echo ""
        echo "📝 To get your password:"
        echo "   1. Visit: https://supabase.com/dashboard/project/${PROJECT_REF}"
        echo "   2. Go to: Settings → Database"
        echo "   3. Find or reset your database password"
        echo ""
        echo "💡 Then run:"
        echo "   export SUPABASE_DB_PASSWORD='your-password-here'"
        echo "   docker-compose up --build"
        echo ""

        # Check if password is in environment
        if [ -n "$SUPABASE_DB_PASSWORD" ]; then
            echo "✅ Found SUPABASE_DB_PASSWORD in environment"
            echo "   Updating backend/.env..."

            # Update the .env file
            sed -i.bak "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${SUPABASE_DB_PASSWORD}|" backend/.env
            sed -i.bak "s|POSTGRES_SERVER=.*|POSTGRES_SERVER=${DB_HOST}|" backend/.env

            echo "✅ Configuration updated!"
            echo ""
            echo "🚀 You can now run:"
            echo "   docker-compose up --build"
            exit 0
        else
            exit 1
        fi
    else
        echo "✅ Backend .env appears to be configured"
    fi
else
    echo "❌ backend/.env not found!"
    exit 1
fi

echo ""
echo "==================================================="
