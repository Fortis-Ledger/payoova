// Simple authentication test for Windows
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/auth';

async function testAuth() {
  console.log('🧪 Testing Authentication System...\n');

  try {
    // Test server connection first
    console.log('1. Testing server connection...');
    const healthCheck = await axios.get('http://localhost:5000/api/auth/me', {
      headers: { 'Authorization': 'Bearer invalid' }
    }).catch(err => {
      if (err.response && err.response.status === 401) {
        console.log('✅ Server is running and responding');
        return { status: 401 };
      }
      throw err;
    });

    // Test signup
    console.log('\n2. Testing Signup...');
    const signupData = {
      email: 'test@example.com',
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User'
    };

    try {
      const signupResponse = await axios.post(`${BASE_URL}/signup`, signupData);
      console.log('✅ Signup successful:', signupResponse.data.message);
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message.includes('already exists')) {
        console.log('ℹ️ User already exists, proceeding to login test');
      } else {
        throw error;
      }
    }

    // Test login
    console.log('\n3. Testing Login...');
    const loginData = {
      email: 'test@example.com',
      password: 'TestPassword123!'
    };

    const loginResponse = await axios.post(`${BASE_URL}/login`, loginData);
    console.log('✅ Login successful');
    
    const { accessToken, refreshToken } = loginResponse.data.tokens;
    console.log('🔑 Tokens received');

    // Test protected route
    console.log('\n4. Testing Protected Route...');
    const meResponse = await axios.get(`${BASE_URL}/me`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    console.log('✅ Protected route access successful');

    // Test token refresh
    console.log('\n5. Testing Token Refresh...');
    const refreshResponse = await axios.post(`${BASE_URL}/refresh`, {
      refreshToken: refreshToken
    });
    console.log('✅ Token refresh successful');

    console.log('\n🎉 All authentication tests passed!');
    console.log('\n📋 Authentication System Status:');
    console.log('- ✅ Server running on http://localhost:5000');
    console.log('- ✅ Password authentication working');
    console.log('- ✅ JWT tokens working');
    console.log('- ✅ Protected routes working');
    console.log('- ✅ Token refresh working');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Server is not running. Start the server first with:');
      console.error('   npx tsx server/index.ts');
    } else if (error.response) {
      console.error('❌ Test failed:', error.response.status, error.response.data);
    } else {
      console.error('❌ Network error:', error.message);
    }
  }
}

// Run the test
testAuth();
