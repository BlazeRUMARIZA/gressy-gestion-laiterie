# API Endpoint Test Report

This document contains instructions and results for testing all API endpoints.

## Prerequisites

1. **Server must be running** on port 5000 (default)
2. **Database must be configured** and accessible
3. **Default admin user** should exist (username: `admin`, password: `admin123`)

## Running the Tests

### Option 1: Using the Test Script

```bash
# From the server directory
cd server
node test-endpoints.js
```

Or with a custom API URL:
```bash
API_URL=http://your-server:5000 node test-endpoints.js
```

### Option 2: Manual Testing with curl

See the sections below for curl commands to test each endpoint manually.

## Endpoints to Test

### 1. Authentication Endpoints

#### POST /api/auth/register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123",
    "role": "staff"
  }'
```

**Expected:** 201 Created with token and user object

#### POST /api/auth/login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Expected:** 200 OK with token and user object

---

### 2. Cow Management Endpoints

**Note:** All cow endpoints require authentication token in the `Authorization: Bearer <token>` header.

#### GET /api/cows
```bash
curl -X GET http://localhost:5000/api/cows \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Query Parameters:**
- `status` - Filter by status (active, sick, pregnant, sold, deceased)
- `search` - Search by tag_number or name

**Example with filters:**
```bash
curl -X GET "http://localhost:5000/api/cows?status=active&search=001" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected:** 200 OK with array of cows

#### GET /api/cows/:id
```bash
curl -X GET http://localhost:5000/api/cows/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected:** 200 OK with cow object, or 404 if not found

#### POST /api/cows
```bash
curl -X POST http://localhost:5000/api/cows \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "tag_number": "TAG-001",
    "name": "Bella",
    "breed": "Holstein",
    "date_of_birth": "2020-01-15",
    "gender": "female",
    "weight": 500.5,
    "status": "active",
    "purchase_date": "2020-02-01",
    "purchase_price": 1500.00,
    "notes": "Test cow"
  }'
```

**Expected:** 201 Created with cow object

#### PUT /api/cows/:id
```bash
curl -X PUT http://localhost:5000/api/cows/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "tag_number": "TAG-001",
    "name": "Bella Updated",
    "breed": "Holstein",
    "date_of_birth": "2020-01-15",
    "gender": "female",
    "weight": 520.0,
    "status": "active",
    "purchase_date": "2020-02-01",
    "purchase_price": 1500.00,
    "notes": "Updated test cow"
  }'
```

**Expected:** 200 OK with updated cow object

#### DELETE /api/cows/:id
```bash
curl -X DELETE http://localhost:5000/api/cows/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected:** 200 OK with success message

---

### 3. Milk Production Endpoints

**Note:** All milk endpoints require authentication.

#### GET /api/milk
```bash
curl -X GET http://localhost:5000/api/milk \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Query Parameters:**
- `startDate` - Filter records from this date (YYYY-MM-DD)
- `endDate` - Filter records until this date (YYYY-MM-DD)
- `cow_id` - Filter by specific cow ID

**Example with filters:**
```bash
curl -X GET "http://localhost:5000/api/milk?startDate=2024-01-01&endDate=2024-12-31&cow_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected:** 200 OK with array of milk records

#### GET /api/milk/:id
```bash
curl -X GET http://localhost:5000/api/milk/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected:** 200 OK with milk record object, or 404 if not found

#### POST /api/milk
```bash
curl -X POST http://localhost:5000/api/milk \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "cow_id": 1,
    "date": "2024-11-20",
    "morning_liters": 10.5,
    "afternoon_liters": 9.8,
    "evening_liters": 11.2,
    "quality_score": 4.5,
    "notes": "Good production day"
  }'
```

**Expected:** 201 Created with milk record object

#### PUT /api/milk/:id
```bash
curl -X PUT http://localhost:5000/api/milk/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "cow_id": 1,
    "date": "2024-11-20",
    "morning_liters": 11.0,
    "afternoon_liters": 10.0,
    "evening_liters": 11.5,
    "quality_score": 4.7,
    "notes": "Updated production"
  }'
```

**Expected:** 200 OK with updated milk record

#### DELETE /api/milk/:id
```bash
curl -X DELETE http://localhost:5000/api/milk/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected:** 200 OK with success message

#### GET /api/milk/stats/summary
```bash
curl -X GET "http://localhost:5000/api/milk/stats/summary?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected:** 200 OK with statistics object containing:
- `total_cows` - Number of distinct cows
- `total_liters` - Total milk production
- `avg_liters_per_cow` - Average liters per cow
- `total_records` - Number of records

---

### 4. Health Records Endpoints

**Note:** All health endpoints require authentication.

#### GET /api/health
```bash
curl -X GET http://localhost:5000/api/health \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Query Parameters:**
- `startDate` - Filter records from this date
- `endDate` - Filter records until this date
- `cow_id` - Filter by specific cow ID
- `health_status` - Filter by status (healthy, sick, recovering, critical)

**Example with filters:**
```bash
curl -X GET "http://localhost:5000/api/health?health_status=sick&startDate=2024-01-01" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected:** 200 OK with array of health records

#### GET /api/health/:id
```bash
curl -X GET http://localhost:5000/api/health/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected:** 200 OK with health record object, or 404 if not found

#### POST /api/health
```bash
curl -X POST http://localhost:5000/api/health \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "cow_id": 1,
    "date": "2024-11-20",
    "health_status": "healthy",
    "diagnosis": "Routine checkup",
    "treatment": "Vaccination",
    "veterinarian": "Dr. Smith",
    "cost": 50.00,
    "next_checkup_date": "2024-12-01",
    "notes": "Cow is in good health"
  }'
```

**Expected:** 201 Created with health record object

#### PUT /api/health/:id
```bash
curl -X PUT http://localhost:5000/api/health/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "cow_id": 1,
    "date": "2024-11-20",
    "health_status": "sick",
    "diagnosis": "Updated diagnosis",
    "treatment": "Updated treatment",
    "veterinarian": "Dr. Jones",
    "cost": 75.00,
    "next_checkup_date": "2024-12-15",
    "notes": "Updated health record"
  }'
```

**Expected:** 200 OK with updated health record

#### DELETE /api/health/:id
```bash
curl -X DELETE http://localhost:5000/api/health/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected:** 200 OK with success message

---

### 5. Feed Records Endpoints

**Note:** All feed endpoints require authentication.

#### GET /api/feed
```bash
curl -X GET http://localhost:5000/api/feed \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Query Parameters:**
- `startDate` - Filter records from this date
- `endDate` - Filter records until this date
- `cow_id` - Filter by specific cow ID
- `feed_type` - Filter by feed type (partial match)

**Example with filters:**
```bash
curl -X GET "http://localhost:5000/api/feed?feed_type=Hay&startDate=2024-01-01" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected:** 200 OK with array of feed records

#### GET /api/feed/:id
```bash
curl -X GET http://localhost:5000/api/feed/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected:** 200 OK with feed record object, or 404 if not found

#### POST /api/feed
```bash
curl -X POST http://localhost:5000/api/feed \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "cow_id": 1,
    "feed_type": "Alfalfa Hay",
    "quantity": 25.5,
    "unit": "kg",
    "date": "2024-11-20",
    "cost": 125.00,
    "supplier": "Feed Supplier Inc.",
    "notes": "High quality feed"
  }'
```

**Expected:** 201 Created with feed record object

#### PUT /api/feed/:id
```bash
curl -X PUT http://localhost:5000/api/feed/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "cow_id": 1,
    "feed_type": "Updated Alfalfa Hay",
    "quantity": 30.0,
    "unit": "kg",
    "date": "2024-11-20",
    "cost": 150.00,
    "supplier": "Updated Supplier",
    "notes": "Updated feed record"
  }'
```

**Expected:** 200 OK with updated feed record

#### DELETE /api/feed/:id
```bash
curl -X DELETE http://localhost:5000/api/feed/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected:** 200 OK with success message

#### GET /api/feed/stats/summary
```bash
curl -X GET "http://localhost:5000/api/feed/stats/summary?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected:** 200 OK with statistics object containing:
- `total_quantity` - Total feed quantity
- `total_cost` - Total feed cost
- `total_records` - Number of records
- `feed_types_count` - Number of distinct feed types

---

### 6. Dashboard Endpoints

#### GET /api/dashboard/stats
```bash
curl -X GET http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected:** 200 OK with dashboard statistics object containing:
- `cows` - Object with cow statistics (total_cows, active_cows, sick_cows, pregnant_cows)
- `todayMilk` - Today's milk production stats
- `monthMilk` - This month's milk production stats
- `healthIssues` - Recent health issues count
- `feedCosts` - Monthly feed costs
- `milkTrend` - Milk production trend (last 7 days)

---

### 7. Health Check Endpoint (Note: Route Conflict)

⚠️ **IMPORTANT:** There is a route conflict with `/api/health`. The health check endpoint at line 25 of `server/index.js` is shadowed by the health records route at line 20.

**Current behavior:** `GET /api/health` returns health records (not a health check)

**Expected fix:** Change health check route to `/api/health-check` or `/health`

---

## Testing Authorization

All protected endpoints should return **401 Unauthorized** when:
1. No Authorization header is provided
2. Invalid token is provided
3. Expired token is provided

**Test unauthorized access:**
```bash
# Without token
curl -X GET http://localhost:5000/api/cows

# With invalid token
curl -X GET http://localhost:5000/api/cows \
  -H "Authorization: Bearer invalid.token.here"
```

**Expected:** 401 Unauthorized with error message

---

## Test Results Template

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| /api/auth/register | POST | ⬜ | |
| /api/auth/login | POST | ⬜ | |
| /api/cows | GET | ⬜ | |
| /api/cows/:id | GET | ⬜ | |
| /api/cows | POST | ⬜ | |
| /api/cows/:id | PUT | ⬜ | |
| /api/cows/:id | DELETE | ⬜ | |
| /api/milk | GET | ⬜ | |
| /api/milk/:id | GET | ⬜ | |
| /api/milk | POST | ⬜ | |
| /api/milk/:id | PUT | ⬜ | |
| /api/milk/:id | DELETE | ⬜ | |
| /api/milk/stats/summary | GET | ⬜ | |
| /api/health | GET | ⬜ | |
| /api/health/:id | GET | ⬜ | |
| /api/health | POST | ⬜ | |
| /api/health/:id | PUT | ⬜ | |
| /api/health/:id | DELETE | ⬜ | |
| /api/feed | GET | ⬜ | |
| /api/feed/:id | GET | ⬜ | |
| /api/feed | POST | ⬜ | |
| /api/feed/:id | PUT | ⬜ | |
| /api/feed/:id | DELETE | ⬜ | |
| /api/feed/stats/summary | GET | ⬜ | |
| /api/dashboard/stats | GET | ⬜ | |

---

## Common Issues

1. **401 Unauthorized**: Make sure you're including a valid JWT token in the Authorization header
2. **404 Not Found**: Check that the server is running and the endpoint path is correct
3. **500 Server Error**: Check server logs for database connection issues or other errors
4. **Database errors**: Ensure MySQL is running and database credentials are correct in `.env` file

## Notes

- The test script (`server/test-endpoints.js`) automatically creates test data and cleans it up after testing
- Test data includes: 1 test cow, 1 milk record, 1 health record, 1 feed record
- All test data is deleted at the end of the test run
- The script requires the server to be running before execution

