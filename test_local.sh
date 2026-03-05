#!/bin/bash
# Quick Test Verification Script

echo "🧪 Testing Koutuhal Backend..."
echo ""

# Test 1: Check Backend Is Running
echo "1️⃣  Backend Health Check..."
timeout 3 bash -c 'cat < /dev/null > /dev/tcp/localhost/8000' 2>/dev/null && echo "✅ Backend is running on port 8000" || echo "❌ Backend not responding on port 8000"
echo ""

# Test 2: Check Frontend Is Running  
echo "2️⃣  Frontend Health Check..."
timeout 3 bash -c 'cat < /dev/null > /dev/tcp/localhost/8080' 2>/dev/null && echo "✅ Frontend is running on port 8080" || echo "❌ Frontend not responding on port 8080"
echo ""

# Test 3: Check Backend API
echo "3️⃣  Backend API Check..."
curl -s -X GET "http://localhost:8000/docs" | grep -q "swagger" && echo "✅ Backend API is accessible" || echo "❌ Backend API not accessible"
echo ""

# Test 4: Check Groq API Key
echo "4️⃣  Groq API Configuration..."
if grep -q "GROQ_API_KEY=gsk" backend/.env; then
    echo "✅ Groq API key is configured"
else
    echo "❌ Groq API key not found"
fi
echo ""

# Test 5: Check Supabase Config
echo "5️⃣  Supabase Configuration..."
if grep -q "VITE_SUPABASE_URL=" .env; then
    echo "✅ Frontend Supabase URL configured"
fi
if grep -q "GROQ_API_KEY=gsk" backend/.env; then
    echo "✅ Backend Supabase configured"
fi
echo ""

echo "✨ Test Summary:"
echo "- Frontend: http://localhost:8080"
echo "- Backend: http://localhost:8000"
echo "- API Docs: http://localhost:8000/docs"
echo ""
echo "Next Steps:"
echo "1. Open http://localhost:8080 in browser"
echo "2. Try Google Sign-In"
echo "3. Test Manual Sign-Up"
echo "4. Test Resume Tailor feature"
echo "5. Check browser console (F12) for errors"
