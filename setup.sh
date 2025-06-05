#!/bin/bash

echo "🚀 Setting up Fragrance Battle AI..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready &> /dev/null; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    exit 1
fi

echo "📦 Installing dependencies..."

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend && npm install && cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend && npm install && cd ..

# Create .env files if they don't exist
echo "🔧 Setting up environment variables..."

# Backend .env
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "Created backend/.env from example"
fi

# Frontend .env
if [ ! -f frontend/.env ]; then
    cp frontend/.env.example frontend/.env
    echo "Created frontend/.env from example"
fi

# Run database migrations
echo "🗃️ Setting up database..."
cd backend && npm run migrate:up && cd ..

# Seed the database
echo "🌱 Seeding database..."
cd backend && npm run seed && cd ..

echo "✅ Setup complete! You can now start the application:"
echo "1. Start the backend: cd backend && npm run dev"
echo "2. Start the frontend: cd frontend && npm run dev"
echo "3. Visit http://localhost:3000 in your browser"
