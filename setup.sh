#!/bin/bash

echo "🚀 Setting up Fragrance Battle AI..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if Docker is running and PostgreSQL container is up
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! docker ps | grep -q fragrance-postgres; then
    echo "❌ PostgreSQL container is not running. Please start it with 'docker-compose up -d'"
    exit 1
fi

# Store the current directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Create necessary directories if they don't exist
mkdir -p "$SCRIPT_DIR/backend/database" "$SCRIPT_DIR/frontend"

echo "📦 Installing dependencies..."

# Install backend dependencies
echo "Installing backend dependencies..."
cd "$SCRIPT_DIR/backend"
if [ -f "package.json" ]; then
    npm install
else
    echo "❌ Backend package.json not found. Please ensure you're in the correct directory."
    exit 1
fi

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd "$SCRIPT_DIR/frontend"
if [ -f "package.json" ]; then
    npm install --legacy-peer-deps
else
    echo "❌ Frontend package.json not found. Please ensure you're in the correct directory."
    exit 1
fi

echo "🔧 Setting up environment variables..."
cd "$SCRIPT_DIR"

# Create .env files if they don't exist
if [ ! -f "$SCRIPT_DIR/backend/.env" ]; then
    if [ -f "$SCRIPT_DIR/backend/.env.example" ]; then
        cp "$SCRIPT_DIR/backend/.env.example" "$SCRIPT_DIR/backend/.env"
        echo "Created backend/.env from example"
    else
        echo "⚠️ Backend .env.example not found. Creating default .env"
        cat > "$SCRIPT_DIR/backend/.env" << EOL
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://fragrance_user:your_password@localhost:5432/fragrance_battle
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
OPENAI_API_KEY=your-openai-api-key
FRONTEND_URL=http://localhost:3000
EOL
    fi
fi

if [ ! -f "$SCRIPT_DIR/frontend/.env" ]; then
    if [ -f "$SCRIPT_DIR/frontend/.env.example" ]; then
        cp "$SCRIPT_DIR/frontend/.env.example" "$SCRIPT_DIR/frontend/.env"
        echo "Created frontend/.env from example"
    else
        echo "⚠️ Frontend .env.example not found. Creating default .env"
        cat > "$SCRIPT_DIR/frontend/.env" << EOL
VITE_API_URL=http://localhost:5000/api
EOL
    fi
fi

echo "🗃️ Setting up database..."

# Get current system user
CURRENT_USER=$(whoami)

# Create database user if it doesn't exist
echo "Creating database user..."
docker exec fragrance-postgres psql -U fragrance_user -c "SELECT 1 FROM pg_roles WHERE rolname='fragrance_user'" | grep -q 1 || docker exec fragrance-postgres psql -U fragrance_user -c "CREATE USER fragrance_user WITH PASSWORD 'your_password';"

# Create database if it doesn't exist
echo "Creating database..."
docker exec fragrance-postgres createdb -U fragrance_user fragrance_battle 2>/dev/null || echo "Database already exists"

# Grant privileges
echo "Granting database privileges..."
docker exec fragrance-postgres psql -U fragrance_user -d fragrance_battle -c "GRANT ALL PRIVILEGES ON DATABASE fragrance_battle TO fragrance_user;"
docker exec fragrance-postgres psql -U fragrance_user -d fragrance_battle -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO fragrance_user;"
docker exec fragrance-postgres psql -U fragrance_user -d fragrance_battle -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO fragrance_user;"

# Create current user role if it doesn't exist
echo "Setting up current user role..."
docker exec fragrance-postgres psql -U fragrance_user -c "SELECT 1 FROM pg_roles WHERE rolname='$CURRENT_USER'" | grep -q 1 || docker exec fragrance-postgres psql -U fragrance_user -c "CREATE USER $CURRENT_USER WITH SUPERUSER CREATEDB CREATEROLE;"

# Grant privileges to current user
docker exec fragrance-postgres psql -U fragrance_user -d fragrance_battle -c "GRANT ALL PRIVILEGES ON DATABASE fragrance_battle TO $CURRENT_USER;"
docker exec fragrance-postgres psql -U fragrance_user -d fragrance_battle -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $CURRENT_USER;"
docker exec fragrance-postgres psql -U fragrance_user -d fragrance_battle -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $CURRENT_USER;"

# Run migrations
echo "Running database migrations..."
cd "$SCRIPT_DIR/backend"
if [ -f "src/database/migrate.ts" ]; then
    npm run migrate:up
else
    echo "❌ Migration script not found. Please ensure migrations are set up correctly."
    exit 1
fi

# Seed database with sample data
echo "Seeding database with sample fragrances..."
if [ -f "src/database/seed.ts" ]; then
    npm run seed
else
    echo "❌ Seed script not found. Please ensure seeding is set up correctly."
    exit 1
fi

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Update the environment variables in backend/.env and frontend/.env with your actual values"
echo "2. Start the development servers:"
echo "   Backend: cd backend && npm run dev"
echo "   Frontend: cd frontend && npm run dev"
echo ""
echo "🌐 Your app will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo ""
echo "Happy fragrance testing! 🌸"
