const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/auth';

async function testAuthFlow() {
  console.log('🧪 Testing Authentication Flow...\n');

  try {
    // Test 1: Signup
    console.log('1. Testing Signup...');
    const signupData = {
      email: 'test@example.com',
      password: 'TestPassword123!',
      name: 'Test User'
    };

    const signupResponse = await axios.post(`${BASE_URL}/signup`, signupData);
    console.log('✅ Signup successful:', signupResponse.data.message);
    
    // Test 2: Login
    console.log('\n2. Testing Login...');
    const loginData = {
      email: 'test@example.com',
      password: 'TestPassword123!'
    };

    const loginResponse = await axios.post(`${BASE_URL}/login`, loginData);
    console.log('✅ Login successful:', loginResponse.data.message);
    
    const { accessToken, refreshToken } = loginResponse.data.tokens;
    console.log('🔑 Access token received');

    // Test 3: Protected route access
    console.log('\n3. Testing Protected Route Access...');
    const meResponse = await axios.get(`${BASE_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    console.log('✅ Protected route access successful:', meResponse.data.user.email);

    // Test 4: Token refresh
    console.log('\n4. Testing Token Refresh...');
    const refreshResponse = await axios.post(`${BASE_URL}/refresh`, {
      refreshToken: refreshToken
    });
    console.log('✅ Token refresh successful');

    // Test 5: Logout
    console.log('\n5. Testing Logout...');
    const logoutResponse = await axios.post(`${BASE_URL}/logout`, {}, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    console.log('✅ Logout successful:', logoutResponse.data.message);

    console.log('\n🎉 All authentication tests passed!');

  } catch (error) {
    if (error.response) {
      console.error('❌ Test failed:', error.response.status, error.response.data);
    } else {
      console.error('❌ Network error:', error.message);
    }
  }
}

// Run tests
testAuthFlow();
