#!/bin/bash

# Test script for backend API endpoints
# Make sure the server is running before executing this script

BASE_URL="http://localhost:3000"

echo "🧪 Testing Backend API Endpoints"
echo "================================"
echo ""

# Test 1: Health check
echo "1️⃣  Testing health check..."
curl -s "$BASE_URL/health" | jq '.'
echo ""

# Test 2: Get all assets (should be empty initially)
echo "2️⃣  Testing GET /api/assets (should be empty)..."
curl -s "$BASE_URL/api/assets" | jq '.'
echo ""

# Test 3: Create a fixed deposit
echo "3️⃣  Testing POST /api/assets (Fixed Deposit)..."
FD_RESPONSE=$(curl -s -X POST "$BASE_URL/api/assets" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "fixed-deposit",
    "bankName": "HDFC Bank",
    "accountNumber": "FD123456",
    "principalAmount": 100000,
    "interestRate": 7.5,
    "startDate": "2024-01-01",
    "maturityDate": "2025-01-01"
  }')
echo "$FD_RESPONSE" | jq '.'
FD_ID=$(echo "$FD_RESPONSE" | jq -r '.data.id')
echo "Created FD with ID: $FD_ID"
echo ""

# Test 4: Create a savings account
echo "4️⃣  Testing POST /api/assets (Savings Account)..."
SA_RESPONSE=$(curl -s -X POST "$BASE_URL/api/assets" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "savings-account",
    "bankName": "ICICI Bank",
    "accountNumber": "SA789012",
    "currentBalance": 50000,
    "interestRate": 3.5
  }')
echo "$SA_RESPONSE" | jq '.'
SA_ID=$(echo "$SA_RESPONSE" | jq -r '.data.id')
echo "Created Savings Account with ID: $SA_ID"
echo ""

# Test 5: Get all assets (should have 2 now)
echo "5️⃣  Testing GET /api/assets (should have 2 assets)..."
curl -s "$BASE_URL/api/assets" | jq '.'
echo ""

# Test 6: Get asset by ID
echo "6️⃣  Testing GET /api/assets/:id..."
curl -s "$BASE_URL/api/assets/$FD_ID" | jq '.'
echo ""

# Test 7: Get stats
echo "7️⃣  Testing GET /api/assets/stats..."
curl -s "$BASE_URL/api/assets/stats" | jq '.'
echo ""

# Test 8: Update asset
echo "8️⃣  Testing PUT /api/assets/:id..."
curl -s -X PUT "$BASE_URL/api/assets/$FD_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "fixed-deposit",
    "bankName": "HDFC Bank Updated",
    "accountNumber": "FD123456",
    "principalAmount": 150000,
    "interestRate": 8.0,
    "startDate": "2024-01-01",
    "maturityDate": "2025-01-01"
  }' | jq '.'
echo ""

# Test 9: Delete asset
echo "9️⃣  Testing DELETE /api/assets/:id..."
curl -s -X DELETE "$BASE_URL/api/assets/$SA_ID" | jq '.'
echo ""

# Test 10: Verify deletion
echo "🔟 Testing GET /api/assets (should have 1 asset after deletion)..."
curl -s "$BASE_URL/api/assets" | jq '.'
echo ""

# Test 11: Test validation error
echo "1️⃣1️⃣  Testing validation error (negative amount)..."
curl -s -X POST "$BASE_URL/api/assets" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "fixed-deposit",
    "bankName": "Test Bank",
    "principalAmount": -1000,
    "interestRate": 7.5,
    "startDate": "2024-01-01",
    "maturityDate": "2025-01-01"
  }' | jq '.'
echo ""

# Test 12: Test 404 error
echo "1️⃣2️⃣  Testing 404 error (non-existent ID)..."
curl -s "$BASE_URL/api/assets/00000000-0000-0000-0000-000000000000" | jq '.'
echo ""

echo "✅ API testing complete!"
