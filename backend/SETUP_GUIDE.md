# Quick Start Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Copy the `.env.example` file to `.env`:

```bash
# On Windows (PowerShell)
Copy-Item .env.example .env

# On Linux/Mac
cp .env.example .env
```

Edit the `.env` file and update the following:

```env
# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/gps_attendance_system

# JWT Secret (change this to a random secure string)
JWT_SECRET=your_secure_random_string_here

# Other settings as needed
PORT=5000
NODE_ENV=development
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On Windows
net start MongoDB

# On Linux
sudo systemctl start mongod

# On Mac
brew services start mongodb-community
```

### 4. Run the Application

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

### 5. Test the API

Test the health check endpoint:

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-03-06T10:00:00.000Z"
}
```

## Testing the System

### 1. Register a Company

```bash
curl -X POST http://localhost:5000/api/auth/register-company \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "My Company",
    "admin_email": "admin@mycompany.com",
    "admin_password": "password123",
    "admin_name": "Admin User",
    "office_latitude": 37.7749,
    "office_longitude": -122.4194,
    "subscription_plan": "basic"
  }'
```

Save the returned token for subsequent requests.

### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mycompany.com",
    "password": "password123"
  }'
```

### 3. Create an Employee (Admin only)

```bash
curl -X POST http://localhost:5000/api/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "John Doe",
    "email": "john@mycompany.com",
    "password": "password123",
    "department": "Engineering"
  }'
```

### 4. Login (as employee)

```bash
curl -X POST http://localhost:5000/api/attendance/login \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "latitude": 37.7749,
    "longitude": -122.4194
  }'
```

### 5. Logout (as employee)

```bash
curl -X POST http://localhost:5000/api/attendance/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "latitude": 37.7749,
    "longitude": -122.4194
  }'
```

## Using Postman

For easier testing, you can import the following endpoints into Postman:

1. Create a new collection named "GPS Attendance System"
2. Set up an environment variable `{{baseUrl}}` = `http://localhost:5000/api`
3. Set up an environment variable `{{token}}` to store your JWT token
4. Add the endpoints as documented in `API_DOCUMENTATION.md`

## Troubleshooting

### MongoDB Connection Error

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution:** Make sure MongoDB is running and the connection string in `.env` is correct.

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:** Either stop the process using port 5000 or change the PORT in `.env` file.

### JWT Token Invalid

**Error:** `Not authorized to access this route`

**Solution:** Make sure you're sending the token in the Authorization header as `Bearer YOUR_TOKEN`

## Project Structure Overview

```
src/
├── config/          # Configuration files (database)
├── controllers/     # Request handlers
├── middleware/      # Custom middleware (auth, validation, error handling)
├── models/          # MongoDB schemas
├── routes/          # API routes
├── services/        # Business logic (GPS, attendance)
├── utils/           # Utility functions
└── server.js        # Application entry point
```

## Next Steps

1. Review the full API documentation in `API_DOCUMENTATION.md`
2. Customize the geofence radius in company settings
3. Add more employees and test the multi-tenant features
4. Implement frontend application to consume this API

## Production Deployment

Before deploying to production:

1. Change `NODE_ENV` to `production`
2. Use a strong, unique `JWT_SECRET`
3. Use a cloud MongoDB instance (MongoDB Atlas)
4. Enable HTTPS
5. Set up proper logging and monitoring
6. Configure CORS for your frontend domain
7. Set up rate limiting
8. Add API documentation with Swagger/OpenAPI

## Support

For issues or questions, refer to:
- API Documentation: `API_DOCUMENTATION.md`
- README: `README.md`
