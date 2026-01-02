/**
 * Comprehensive API Endpoint Test Script
 * Tests all endpoints of the Dairy Management System
 */

/**
 * Comprehensive API Endpoint Test Script
 * Tests all endpoints of the Dairy Management System
 * 
 * Usage:
 *   node test-endpoints.js
 *   API_URL=http://localhost:5000 node test-endpoints.js
 */

const axios = require('axios');

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

// Test results storage
const testResults = {
  passed: [],
  failed: [],
  total: 0
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

let authToken = null;
let testUserId = null;
let testCowId = null;
let testMilkId = null;
let testHealthId = null;
let testFeedId = null;

// Helper function to log test results
function logTest(testName, passed, message = '') {
  testResults.total++;
  if (passed) {
    testResults.passed.push({ test: testName, message });
    console.log(`${colors.green}✓${colors.reset} ${testName}`);
    if (message) console.log(`  ${message}`);
  } else {
    testResults.failed.push({ test: testName, message });
    console.log(`${colors.red}✗${colors.reset} ${testName}`);
    if (message) console.log(`  ${colors.red}${message}${colors.reset}`);
  }
}

// Helper function to make authenticated requests
async function apiRequest(method, endpoint, data = null, useAuth = true) {
  const config = {
    method,
    url: `${API_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (useAuth && authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }

  if (data) {
    config.data = data;
  }

  try {
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
}

// Test functions
async function testHealthCheck() {
  console.log(`\n${colors.blue}=== Testing Health Check ===${colors.reset}`);
  
  // Note: This endpoint conflicts with /api/health routes
  // Testing if it's accessible (it should be shadowed by health records route)
  const result = await apiRequest('GET', '/health', null, false);
  
  if (result.status === 404 || result.status === 200) {
    logTest('Health Check Endpoint', true, 
      `Status: ${result.status} (Note: This endpoint is shadowed by /api/health routes)`);
  } else {
    logTest('Health Check Endpoint', false, `Unexpected status: ${result.status}`);
  }
}

async function testAuthEndpoints() {
  console.log(`\n${colors.blue}=== Testing Authentication Endpoints ===${colors.reset}`);

  // Test Register
  const registerData = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@test.com`,
    password: 'testpass123',
    role: 'staff'
  };

  let result = await apiRequest('POST', '/auth/register', registerData, false);
  if (result.success && result.data.token) {
    logTest('POST /api/auth/register', true, 'User registered successfully');
    authToken = result.data.token;
    testUserId = result.data.user.id;
  } else {
    logTest('POST /api/auth/register', false, JSON.stringify(result.error));
    // Try login with default admin credentials
    console.log(`${colors.yellow}Attempting login with default admin credentials...${colors.reset}`);
    const loginResult = await apiRequest('POST', '/auth/login', {
      username: 'admin',
      password: 'admin123'
    }, false);
    if (loginResult.success && loginResult.data.token) {
      authToken = loginResult.data.token;
      logTest('POST /api/auth/login (admin)', true, 'Logged in with default admin');
    } else {
      logTest('POST /api/auth/login (admin)', false, JSON.stringify(loginResult.error));
      throw new Error('Cannot proceed without authentication');
    }
  }

  // Test Login
  result = await apiRequest('POST', '/auth/login', {
    username: registerData.username || 'admin',
    password: registerData.password || 'admin123'
  }, false);
  
  if (result.success && result.data.token) {
    logTest('POST /api/auth/login', true, 'Login successful');
    authToken = result.data.token;
  } else {
    logTest('POST /api/auth/login', false, JSON.stringify(result.error));
  }

  // Test Register with existing user (should fail)
  if (registerData.username) {
    result = await apiRequest('POST', '/auth/register', registerData, false);
    logTest('POST /api/auth/register (duplicate)', !result.success && result.status === 400,
      result.success ? 'Should have failed' : 'Correctly rejected duplicate user');
  }

  // Test Login with invalid credentials
  result = await apiRequest('POST', '/auth/login', {
    username: 'nonexistent',
    password: 'wrongpassword'
  }, false);
  logTest('POST /api/auth/login (invalid)', !result.success && result.status === 400,
    result.success ? 'Should have failed' : 'Correctly rejected invalid credentials');
}

async function testCowEndpoints() {
  console.log(`\n${colors.blue}=== Testing Cow Endpoints ===${colors.reset}`);

  // Test GET /api/cows
  let result = await apiRequest('GET', '/cows');
  logTest('GET /api/cows', result.success, 
    result.success ? `Found ${Array.isArray(result.data) ? result.data.length : 0} cows` : JSON.stringify(result.error));

  // Test GET /api/cows with filters
  result = await apiRequest('GET', '/cows?status=active');
  logTest('GET /api/cows?status=active', result.success, 'Filtered by status');

  result = await apiRequest('GET', '/cows?search=test');
  logTest('GET /api/cows?search=test', result.success, 'Filtered by search');

  // Test POST /api/cows
  const cowData = {
    tag_number: `TAG-${Date.now()}`,
    name: 'Test Cow',
    breed: 'Holstein',
    date_of_birth: '2020-01-15',
    gender: 'female',
    weight: 500.5,
    status: 'active',
    purchase_date: '2020-02-01',
    purchase_price: 1500.00,
    notes: 'Test cow for API testing'
  };

  result = await apiRequest('POST', '/cows', cowData);
  if (result.success && result.data.id) {
    testCowId = result.data.id;
    logTest('POST /api/cows', true, `Created cow with ID: ${testCowId}`);
  } else {
    logTest('POST /api/cows', false, JSON.stringify(result.error));
  }

  // Test GET /api/cows/:id
  if (testCowId) {
    result = await apiRequest('GET', `/cows/${testCowId}`);
    logTest('GET /api/cows/:id', result.success, 
      result.success ? `Retrieved cow ${testCowId}` : JSON.stringify(result.error));
  }

  // Test PUT /api/cows/:id
  if (testCowId) {
    const updateData = { ...cowData, name: 'Updated Test Cow', weight: 520.0 };
    result = await apiRequest('PUT', `/cows/${testCowId}`, updateData);
    logTest('PUT /api/cows/:id', result.success, 
      result.success ? 'Updated cow successfully' : JSON.stringify(result.error));
  }

  // Test POST /api/cows (duplicate tag number - should fail)
  result = await apiRequest('POST', '/cows', cowData);
  logTest('POST /api/cows (duplicate tag)', !result.success && result.status === 400,
    result.success ? 'Should have failed' : 'Correctly rejected duplicate tag');

  // Test GET /api/cows/:id (non-existent)
  result = await apiRequest('GET', '/cows/99999');
  logTest('GET /api/cows/:id (non-existent)', !result.success && result.status === 404,
    result.success ? 'Should have failed' : 'Correctly returned 404');
}

async function testMilkEndpoints() {
  console.log(`\n${colors.blue}=== Testing Milk Production Endpoints ===${colors.reset}`);

  // Test GET /api/milk
  let result = await apiRequest('GET', '/milk');
  logTest('GET /api/milk', result.success, 
    result.success ? `Found ${Array.isArray(result.data) ? result.data.length : 0} records` : JSON.stringify(result.error));

  // Test GET /api/milk with filters
  result = await apiRequest('GET', '/milk?startDate=2024-01-01');
  logTest('GET /api/milk?startDate=2024-01-01', result.success, 'Filtered by start date');

  // Test POST /api/milk
  if (testCowId) {
    const milkData = {
      cow_id: testCowId,
      date: new Date().toISOString().split('T')[0],
      morning_liters: 10.5,
      afternoon_liters: 9.8,
      evening_liters: 11.2,
      quality_score: 4.5,
      notes: 'Test milk record'
    };

    result = await apiRequest('POST', '/milk', milkData);
    if (result.success && result.data.id) {
      testMilkId = result.data.id;
      logTest('POST /api/milk', true, `Created milk record with ID: ${testMilkId}`);
    } else {
      logTest('POST /api/milk', false, JSON.stringify(result.error));
    }
  } else {
    logTest('POST /api/milk', false, 'Skipped - no test cow available');
  }

  // Test GET /api/milk/:id
  if (testMilkId) {
    result = await apiRequest('GET', `/milk/${testMilkId}`);
    logTest('GET /api/milk/:id', result.success, 
      result.success ? `Retrieved milk record ${testMilkId}` : JSON.stringify(result.error));
  }

  // Test PUT /api/milk/:id
  if (testMilkId) {
    const updateData = {
      cow_id: testCowId,
      date: new Date().toISOString().split('T')[0],
      morning_liters: 11.0,
      afternoon_liters: 10.0,
      evening_liters: 11.5,
      quality_score: 4.7,
      notes: 'Updated test milk record'
    };
    result = await apiRequest('PUT', `/milk/${testMilkId}`, updateData);
    logTest('PUT /api/milk/:id', result.success, 
      result.success ? 'Updated milk record successfully' : JSON.stringify(result.error));
  }

  // Test GET /api/milk/stats/summary
  result = await apiRequest('GET', '/milk/stats/summary');
  logTest('GET /api/milk/stats/summary', result.success, 
    result.success ? 'Retrieved milk statistics' : JSON.stringify(result.error));

  // Test GET /api/milk/:id (non-existent)
  result = await apiRequest('GET', '/milk/99999');
  logTest('GET /api/milk/:id (non-existent)', !result.success && result.status === 404,
    result.success ? 'Should have failed' : 'Correctly returned 404');
}

async function testHealthEndpoints() {
  console.log(`\n${colors.blue}=== Testing Health Records Endpoints ===${colors.reset}`);

  // Test GET /api/health
  let result = await apiRequest('GET', '/health');
  logTest('GET /api/health', result.success, 
    result.success ? `Found ${Array.isArray(result.data) ? result.data.length : 0} records` : JSON.stringify(result.error));

  // Test GET /api/health with filters
  result = await apiRequest('GET', '/health?health_status=sick');
  logTest('GET /api/health?health_status=sick', result.success, 'Filtered by health status');

  // Test POST /api/health
  if (testCowId) {
    const healthData = {
      cow_id: testCowId,
      date: new Date().toISOString().split('T')[0],
      health_status: 'healthy',
      diagnosis: 'Routine checkup',
      treatment: 'Vaccination',
      veterinarian: 'Dr. Smith',
      cost: 50.00,
      next_checkup_date: '2024-12-01',
      notes: 'Test health record'
    };

    result = await apiRequest('POST', '/health', healthData);
    if (result.success && result.data.id) {
      testHealthId = result.data.id;
      logTest('POST /api/health', true, `Created health record with ID: ${testHealthId}`);
    } else {
      logTest('POST /api/health', false, JSON.stringify(result.error));
    }
  } else {
    logTest('POST /api/health', false, 'Skipped - no test cow available');
  }

  // Test GET /api/health/:id
  if (testHealthId) {
    result = await apiRequest('GET', `/health/${testHealthId}`);
    logTest('GET /api/health/:id', result.success, 
      result.success ? `Retrieved health record ${testHealthId}` : JSON.stringify(result.error));
  }

  // Test PUT /api/health/:id
  if (testHealthId) {
    const updateData = {
      cow_id: testCowId,
      date: new Date().toISOString().split('T')[0],
      health_status: 'sick',
      diagnosis: 'Updated diagnosis',
      treatment: 'Updated treatment',
      veterinarian: 'Dr. Jones',
      cost: 75.00,
      next_checkup_date: '2024-12-15',
      notes: 'Updated test health record'
    };
    result = await apiRequest('PUT', `/health/${testHealthId}`, updateData);
    logTest('PUT /api/health/:id', result.success, 
      result.success ? 'Updated health record successfully' : JSON.stringify(result.error));
  }

  // Test GET /api/health/:id (non-existent)
  result = await apiRequest('GET', '/health/99999');
  logTest('GET /api/health/:id (non-existent)', !result.success && result.status === 404,
    result.success ? 'Should have failed' : 'Correctly returned 404');
}

async function testFeedEndpoints() {
  console.log(`\n${colors.blue}=== Testing Feed Records Endpoints ===${colors.reset}`);

  // Test GET /api/feed
  let result = await apiRequest('GET', '/feed');
  logTest('GET /api/feed', result.success, 
    result.success ? `Found ${Array.isArray(result.data) ? result.data.length : 0} records` : JSON.stringify(result.error));

  // Test GET /api/feed with filters
  result = await apiRequest('GET', '/feed?feed_type=Hay');
  logTest('GET /api/feed?feed_type=Hay', result.success, 'Filtered by feed type');

  // Test POST /api/feed
  const feedData = {
    cow_id: testCowId || null,
    feed_type: 'Alfalfa Hay',
    quantity: 25.5,
    unit: 'kg',
    date: new Date().toISOString().split('T')[0],
    cost: 125.00,
    supplier: 'Feed Supplier Inc.',
    notes: 'Test feed record'
  };

  result = await apiRequest('POST', '/feed', feedData);
  if (result.success && result.data.id) {
    testFeedId = result.data.id;
    logTest('POST /api/feed', true, `Created feed record with ID: ${testFeedId}`);
  } else {
    logTest('POST /api/feed', false, JSON.stringify(result.error));
  }

  // Test GET /api/feed/:id
  if (testFeedId) {
    result = await apiRequest('GET', `/feed/${testFeedId}`);
    logTest('GET /api/feed/:id', result.success, 
      result.success ? `Retrieved feed record ${testFeedId}` : JSON.stringify(result.error));
  }

  // Test PUT /api/feed/:id
  if (testFeedId) {
    const updateData = {
      cow_id: testCowId || null,
      feed_type: 'Updated Alfalfa Hay',
      quantity: 30.0,
      unit: 'kg',
      date: new Date().toISOString().split('T')[0],
      cost: 150.00,
      supplier: 'Updated Supplier',
      notes: 'Updated test feed record'
    };
    result = await apiRequest('PUT', `/feed/${testFeedId}`, updateData);
    logTest('PUT /api/feed/:id', result.success, 
      result.success ? 'Updated feed record successfully' : JSON.stringify(result.error));
  }

  // Test GET /api/feed/stats/summary
  result = await apiRequest('GET', '/feed/stats/summary');
  logTest('GET /api/feed/stats/summary', result.success, 
    result.success ? 'Retrieved feed statistics' : JSON.stringify(result.error));

  // Test GET /api/feed/:id (non-existent)
  result = await apiRequest('GET', '/feed/99999');
  logTest('GET /api/feed/:id (non-existent)', !result.success && result.status === 404,
    result.success ? 'Should have failed' : 'Correctly returned 404');
}

async function testDashboardEndpoints() {
  console.log(`\n${colors.blue}=== Testing Dashboard Endpoints ===${colors.reset}`);

  // Test GET /api/dashboard/stats
  const result = await apiRequest('GET', '/dashboard/stats');
  logTest('GET /api/dashboard/stats', result.success, 
    result.success ? 'Retrieved dashboard statistics' : JSON.stringify(result.error));

  if (result.success && result.data) {
    console.log(`  Dashboard data includes: ${Object.keys(result.data).join(', ')}`);
  }
}

async function testUnauthorizedAccess() {
  console.log(`\n${colors.blue}=== Testing Unauthorized Access ===${colors.reset}`);

  // Save current token
  const savedToken = authToken;
  authToken = null;

  // Test protected endpoint without token
  let result = await apiRequest('GET', '/cows', null, false);
  logTest('GET /api/cows (no token)', !result.success && result.status === 401,
    result.success ? 'Should have failed' : 'Correctly rejected unauthorized access');

  // Test with invalid token
  authToken = 'invalid.token.here';
  result = await apiRequest('GET', '/cows');
  logTest('GET /api/cows (invalid token)', !result.success && result.status === 401,
    result.success ? 'Should have failed' : 'Correctly rejected invalid token');

  // Restore token
  authToken = savedToken;
}

async function cleanup() {
  console.log(`\n${colors.blue}=== Cleaning Up Test Data ===${colors.reset}`);

  // Delete in reverse order of dependencies
  if (testFeedId) {
    const result = await apiRequest('DELETE', `/feed/${testFeedId}`);
    logTest('DELETE /api/feed/:id', result.success, 'Deleted test feed record');
  }

  if (testHealthId) {
    const result = await apiRequest('DELETE', `/health/${testHealthId}`);
    logTest('DELETE /api/health/:id', result.success, 'Deleted test health record');
  }

  if (testMilkId) {
    const result = await apiRequest('DELETE', `/milk/${testMilkId}`);
    logTest('DELETE /api/milk/:id', result.success, 'Deleted test milk record');
  }

  if (testCowId) {
    const result = await apiRequest('DELETE', `/cows/${testCowId}`);
    logTest('DELETE /api/cows/:id', result.success, 'Deleted test cow');
  }
}

// Main test runner
async function runTests() {
  console.log(`${colors.blue}
╔═══════════════════════════════════════════════════════════════╗
║     Dairy Management System - API Endpoint Test Suite        ║
╚═══════════════════════════════════════════════════════════════╝
${colors.reset}`);

  try {
    // Check if server is accessible
    console.log(`Testing server at: ${BASE_URL}`);
    try {
      await axios.get(`${BASE_URL}/api/health`);
      console.log(`${colors.green}✓ Server is accessible${colors.reset}\n`);
    } catch (error) {
      console.log(`${colors.yellow}⚠ Server health check failed, but continuing...${colors.reset}\n`);
    }

    await testHealthCheck();
    await testAuthEndpoints();
    await testCowEndpoints();
    await testMilkEndpoints();
    await testHealthEndpoints();
    await testFeedEndpoints();
    await testDashboardEndpoints();
    await testUnauthorizedAccess();
    await cleanup();

    // Print summary
    console.log(`\n${colors.blue}╔═══════════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.blue}║                      Test Summary                               ║${colors.reset}`);
    console.log(`${colors.blue}╚═══════════════════════════════════════════════════════════════╝${colors.reset}`);
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`${colors.green}Passed: ${testResults.passed.length}${colors.reset}`);
    console.log(`${colors.red}Failed: ${testResults.failed.length}${colors.reset}`);
    console.log(`Success Rate: ${((testResults.passed.length / testResults.total) * 100).toFixed(2)}%`);

    if (testResults.failed.length > 0) {
      console.log(`\n${colors.red}Failed Tests:${colors.reset}`);
      testResults.failed.forEach(test => {
        console.log(`  - ${test.test}: ${test.message}`);
      });
    }

    process.exit(testResults.failed.length > 0 ? 1 : 0);
  } catch (error) {
    console.error(`${colors.red}Test suite error: ${error.message}${colors.reset}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests
runTests();

