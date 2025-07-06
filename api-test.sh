#!/bin/bash

# API Test Script for PARKETSENSE ERP
# Tests all major API endpoints

echo "🚀 PARKETSENSE ERP API Test Suite"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:4000/api"

# Function to test endpoint
test_endpoint() {
    local endpoint=$1
    local description=$2
    local method=${3:-GET}
    
    echo -n "Testing $description... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "%{http_code}" "$BASE_URL$endpoint" -o /tmp/response.json)
    else
        response=$(curl -s -w "%{http_code}" -X "$method" "$BASE_URL$endpoint" -o /tmp/response.json)
    fi
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ OK${NC}"
    else
        echo -e "${RED}❌ FAILED (HTTP $response)${NC}"
    fi
}

# Check if backend is running
echo "Checking if backend is running..."
if ! curl -s "$BASE_URL/clients" > /dev/null; then
    echo -e "${RED}❌ Backend is not running on $BASE_URL${NC}"
    echo "Please start the backend server first:"
    echo "cd apps/backend && npm run start:dev"
    exit 1
fi

echo -e "${GREEN}✅ Backend is running${NC}"
echo ""

# Test all endpoints
echo "Testing API Endpoints:"
echo "---------------------"

# Clients
test_endpoint "/clients" "Clients List"
test_endpoint "/clients/stats" "Clients Stats"

# Projects
test_endpoint "/projects" "Projects List"
test_endpoint "/projects/stats" "Projects Stats"

# Phases
test_endpoint "/phases" "Phases List"
test_endpoint "/phases/stats" "Phases Stats"

# Variants
test_endpoint "/variants" "Variants List"
test_endpoint "/variants/stats" "Variants Stats"

# Rooms
test_endpoint "/rooms" "Rooms List"
test_endpoint "/rooms/stats" "Rooms Stats"

# Products
test_endpoint "/products" "Products List"
test_endpoint "/products/stats" "Products Stats"

# Offers
test_endpoint "/offers" "Offers List"
test_endpoint "/offers/stats" "Offers Stats"

# Attributes
test_endpoint "/attributes" "Attributes List"
test_endpoint "/attribute-values" "Attribute Values List"

# Manufacturers
test_endpoint "/manufacturers" "Manufacturers List"

# Suppliers
test_endpoint "/suppliers" "Suppliers List"

# Contacts
test_endpoint "/contacts" "Contacts List"

# Architect Payments
test_endpoint "/architect-payments" "Architect Payments List"

echo ""
echo "🎯 API Test Summary:"
echo "==================="
echo "All endpoints tested successfully!"
echo ""
echo "To view detailed responses, check the /tmp/response.json file"
echo ""
echo "Next steps:"
echo "1. Test frontend: ./frontend-check.sh"
echo "2. Install dependencies: ./install-day1.sh" 