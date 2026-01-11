#!/bin/bash

# MazdoorMitra - Run Script
# This script initializes the environment and runs the application

set -e  # Exit on error

echo "🚀 MazdoorMitra - Starting Application"
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    exit 1
fi

echo "✓ npm version: $(npm --version)"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 Installing dependencies..."
    npm install
    echo "✓ Dependencies installed"
else
    echo "✓ Dependencies already installed"
fi

# Setup environment file
if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        echo ""
        echo "⚙️  Setting up environment file..."
        cp .env.example .env.local
        echo "✓ Created .env.local from .env.example"
        echo ""
        echo "⚠️  IMPORTANT: Please update .env.local with your actual Supabase credentials"
        echo "   Edit .env.local and add your:"
        echo "   - NEXT_PUBLIC_SUPABASE_URL"
        echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
        echo ""
        read -p "Press Enter to continue once you've updated .env.local (or press Ctrl+C to exit)..."
    else
        echo ""
        echo "⚠️  Warning: .env.example not found"
        echo "   You may need to create .env.local manually"
    fi
else
    echo "✓ Environment file exists (.env.local)"
fi

echo ""
echo "======================================"
echo "🎯 Starting Development Server..."
echo "======================================"
echo ""
echo "The application will be available at:"
echo "👉 http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the development server
npm run dev
