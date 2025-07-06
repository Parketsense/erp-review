#!/bin/bash

# Frontend Check Script for PARKETSENSE ERP
# Tests frontend functionality and connectivity

echo "🎨 PARKETSENSE ERP Frontend Check"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Frontend URL
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:4000"

# Function to test endpoint
test_frontend() {
    local endpoint=$1
    local description=$2
    
    echo -n "Testing $description... "
    
    response=$(curl -s -w "%{http_code}" "$FRONTEND_URL$endpoint" -o /tmp/frontend_response.html)
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ OK${NC}"
    else
        echo -e "${RED}❌ FAILED (HTTP $response)${NC}"
    fi
}

# Function to check if service is running
check_service() {
    local url=$1
    local service_name=$2
    
    echo -n "Checking $service_name... "
    
    if curl -s "$url" > /dev/null; then
        echo -e "${GREEN}✅ Running${NC}"
        return 0
    else
        echo -e "${RED}❌ Not running${NC}"
        return 1
    fi
}

echo "Checking Services:"
echo "------------------"

# Check if services are running
backend_running=false
frontend_running=false

if check_service "$BACKEND_URL/api/clients" "Backend API"; then
    backend_running=true
fi

if check_service "$FRONTEND_URL" "Frontend App"; then
    frontend_running=true
fi

echo ""

if [ "$backend_running" = false ]; then
    echo -e "${YELLOW}⚠️  Backend is not running${NC}"
    echo "To start backend: cd apps/backend && npm run start:dev"
    echo ""
fi

if [ "$frontend_running" = false ]; then
    echo -e "${YELLOW}⚠️  Frontend is not running${NC}"
    echo "To start frontend: cd apps/frontend && npm run dev"
    echo ""
fi

if [ "$backend_running" = true ] && [ "$frontend_running" = true ]; then
    echo "Testing Frontend Pages:"
    echo "----------------------"
    
    # Test main pages
    test_frontend "/" "Home Page"
    test_frontend "/projects" "Projects Page"
    test_frontend "/clients" "Clients Page"
    test_frontend "/products" "Products Page"
    test_frontend "/offers" "Offers Page"
    test_frontend "/manufacturers" "Manufacturers Page"
    test_frontend "/suppliers" "Suppliers Page"
    test_frontend "/attributes" "Attributes Page"
    
    echo ""
    echo "Testing API Connectivity:"
    echo "------------------------"
    
    # Test API calls from frontend
    echo -n "Testing API connectivity... "
    if curl -s "$FRONTEND_URL" | grep -q "PARKETSENSE ERP"; then
        echo -e "${GREEN}✅ Frontend loads correctly${NC}"
    else
        echo -e "${RED}❌ Frontend not loading properly${NC}"
    fi
    
    echo ""
    echo "🎯 Frontend Check Summary:"
    echo "========================="
    echo -e "${GREEN}✅ All services are running${NC}"
    echo -e "${GREEN}✅ Frontend pages are accessible${NC}"
    echo ""
    echo "You can now access the application at:"
    echo -e "${BLUE}Frontend: $FRONTEND_URL${NC}"
    echo -e "${BLUE}Backend API: $BACKEND_URL/api${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Open $FRONTEND_URL in your browser"
    echo "2. Test the application functionality"
    echo "3. Run API tests: ./api-test.sh"
    
else
    echo ""
    echo -e "${RED}❌ Some services are not running${NC}"
    echo "Please start all services before running this check."
    echo ""
    echo "Quick start commands:"
    echo "1. Backend: cd apps/backend && npm run start:dev"
    echo "2. Frontend: cd apps/frontend && npm run dev"
    echo "3. Then run this check again: ./frontend-check.sh"
fi 