#!/bin/bash

echo "============================================"
echo "  AI Carbon Credit Marketplace & Verifier"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Kill processes on ports 3000 and 3001
echo -e "${YELLOW}🔧 Cleaning up used ports...${NC}"
for port in 3000 3001; do
  pid=$(lsof -ti :$port 2>/dev/null)
  if [ ! -z "$pid" ]; then
    echo -e "   Killing process on port $port (PID: $pid)"
    kill -9 $pid 2>/dev/null
  fi
done
echo -e "${GREEN}✅ Ports cleaned${NC}"
echo ""

# Check PostgreSQL
echo -e "${YELLOW}🐘 Checking PostgreSQL...${NC}"
if command -v pg_isready &>/dev/null; then
  if pg_isready -q; then
    echo -e "${GREEN}✅ PostgreSQL is running${NC}"
  else
    echo -e "${RED}❌ PostgreSQL is not running. Please start it first.${NC}"
    echo "   brew services start postgresql@14  (or your version)"
    exit 1
  fi
else
  echo -e "${YELLOW}⚠️  pg_isready not found, assuming PostgreSQL is running${NC}"
fi

# Create database if not exists
echo -e "${YELLOW}📦 Setting up database...${NC}"
createdb carbon_credit_marketplace 2>/dev/null
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Database created${NC}"
else
  echo -e "${GREEN}✅ Database already exists${NC}"
fi
echo ""

# Install dependencies
echo -e "${YELLOW}📥 Installing server dependencies...${NC}"
npm install
echo ""

echo -e "${YELLOW}📥 Installing client dependencies...${NC}"
cd client && npm install && cd ..
echo ""

# Check .env file
if [ ! -f .env ]; then
  echo -e "${RED}❌ .env file not found. Creating default...${NC}"
  cat > .env << 'EOF'
DATABASE_URL=postgres://erolakarsu@localhost:5432/carbon_credit_marketplace
JWT_SECRET=carbon-credit-marketplace-secret-key-2024
OPENROUTER_API_KEY=your-openrouter-api-key-here
OPENROUTER_MODEL=anthropic/claude-haiku-4.5
PORT=3001
CLIENT_PORT=3000
EOF
  echo -e "${YELLOW}⚠️  Please update OPENROUTER_API_KEY in .env file${NC}"
fi

# Seed database
echo -e "${YELLOW}🌱 Seeding database with sample data...${NC}"
node server/seeders/seed.js
echo ""

# Start application with hot reload
echo -e "${GREEN}🚀 Starting application with hot reload...${NC}"
echo -e "${GREEN}   Server: http://localhost:3001 (with nodemon for auto-reload)${NC}"
echo -e "${GREEN}   Client: http://localhost:3000 (with React hot reload)${NC}"
echo ""
echo -e "${YELLOW}📧 Demo Login: admin@carbonmarket.com / password123${NC}"
echo ""
echo "============================================"
echo "  Press Ctrl+C to stop all services"
echo "============================================"
echo ""

# Start server and client concurrently
npm start
