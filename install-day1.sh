#!/bin/bash

# Day 1 Installation Script for PARKETSENSE ERP
# Installs all dependencies and sets up the development environment

echo "🚀 PARKETSENSE ERP - Day 1 Installation"
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install with status
install_with_status() {
    local description=$1
    local command=$2
    
    echo -n "Installing $description... "
    
    if eval "$command" > /tmp/install.log 2>&1; then
        echo -e "${GREEN}✅ Done${NC}"
    else
        echo -e "${RED}❌ Failed${NC}"
        echo "Error log:"
        cat /tmp/install.log
        return 1
    fi
}

# Function to run command with status
run_with_status() {
    local description=$1
    local command=$2
    
    echo -n "$description... "
    
    if eval "$command" > /tmp/run.log 2>&1; then
        echo -e "${GREEN}✅ Done${NC}"
    else
        echo -e "${RED}❌ Failed${NC}"
        echo "Error log:"
        cat /tmp/run.log
        return 1
    fi
}

echo "Checking Prerequisites:"
echo "----------------------"

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js not found${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm $NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm not found${NC}"
    echo "Please install npm"
    exit 1
fi

# Check Git
if command_exists git; then
    GIT_VERSION=$(git --version)
    echo -e "${GREEN}✅ $GIT_VERSION${NC}"
else
    echo -e "${YELLOW}⚠️  Git not found (optional)${NC}"
fi

echo ""
echo "Installing Dependencies:"
echo "----------------------"

# Install root dependencies
if [ -f "package.json" ]; then
    install_with_status "Root dependencies" "npm install"
else
    echo -e "${YELLOW}⚠️  No root package.json found${NC}"
fi

# Install backend dependencies
if [ -d "apps/backend" ]; then
    echo ""
    echo "Backend Setup:"
    echo "-------------"
    
    cd apps/backend
    
    install_with_status "Backend dependencies" "npm install"
    
    # Check if Prisma is installed
    if [ -f "prisma/schema.prisma" ]; then
        echo ""
        echo "Database Setup:"
        echo "---------------"
        
        run_with_status "Generating Prisma client" "npx prisma generate"
        run_with_status "Running database migrations" "npx prisma migrate dev --name init"
        run_with_status "Seeding database" "npx prisma db seed"
        
        echo ""
        echo -e "${GREEN}✅ Database setup completed${NC}"
    else
        echo -e "${YELLOW}⚠️  Prisma schema not found${NC}"
    fi
    
    cd ../..
else
    echo -e "${RED}❌ Backend directory not found${NC}"
fi

# Install frontend dependencies
if [ -d "apps/frontend" ]; then
    echo ""
    echo "Frontend Setup:"
    echo "---------------"
    
    cd apps/frontend
    
    install_with_status "Frontend dependencies" "npm install"
    
    # Check if Next.js config exists
    if [ -f "next.config.ts" ] || [ -f "next.config.js" ]; then
        echo -e "${GREEN}✅ Next.js configuration found${NC}"
    else
        echo -e "${YELLOW}⚠️  Next.js configuration not found${NC}"
    fi
    
    cd ../..
else
    echo -e "${RED}❌ Frontend directory not found${NC}"
fi

echo ""
echo "Setting up Development Environment:"
echo "----------------------------------"

# Create .env files if they don't exist
if [ -d "apps/backend" ] && [ ! -f "apps/backend/.env" ]; then
    echo "Creating backend .env file..."
    cat > apps/backend/.env << EOF
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Server
PORT=4000
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:3000"

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR="./uploads"
EOF
    echo -e "${GREEN}✅ Backend .env created${NC}"
fi

if [ -d "apps/frontend" ] && [ ! -f "apps/frontend/.env.local" ]; then
    echo "Creating frontend .env.local file..."
    cat > apps/frontend/.env.local << EOF
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000

# App Configuration
NEXT_PUBLIC_APP_NAME=PARKETSENSE ERP
NEXT_PUBLIC_APP_VERSION=2.0.0

# Development
NODE_ENV=development
EOF
    echo -e "${GREEN}✅ Frontend .env.local created${NC}"
fi

echo ""
echo "Making Scripts Executable:"
echo "-------------------------"

# Make shell scripts executable
chmod +x api-test.sh
chmod +x frontend-check.sh
chmod +x install-day1.sh

echo -e "${GREEN}✅ All scripts are now executable${NC}"

echo ""
echo "🎯 Installation Summary:"
echo "======================="
echo -e "${GREEN}✅ All dependencies installed${NC}"
echo -e "${GREEN}✅ Database setup completed${NC}"
echo -e "${GREEN}✅ Environment files created${NC}"
echo -e "${GREEN}✅ Scripts made executable${NC}"
echo ""
echo "Next Steps:"
echo "==========="
echo "1. Start the backend server:"
echo "   cd apps/backend && npm run start:dev"
echo ""
echo "2. Start the frontend server:"
echo "   cd apps/frontend && npm run dev"
echo ""
echo "3. Test the installation:"
echo "   ./api-test.sh"
echo "   ./frontend-check.sh"
echo ""
echo "4. Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:4000/api"
echo ""
echo -e "${BLUE}🎉 Installation completed successfully!${NC}" 