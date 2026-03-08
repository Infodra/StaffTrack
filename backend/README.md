# GPS Attendance System - Backend

A production-ready multi-tenant SaaS GPS Attendance System built with Node.js, Express, and MongoDB.

## Features

- Multi-tenant architecture with data isolation
- GPS-based attendance with geofencing
- Auto login/logout
- JWT authentication
- Role-based access control (Admin/Employee)
- Company management
- Employee management
- Attendance tracking and reports
- Location logging

## Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- REST API architecture

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the environment variables in `.env` file

5. Start the server:
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## Environment Variables

See `.env.example` for required environment variables.

## API Endpoints

### Authentication
- `POST /api/auth/register-company` - Register a new company
- `POST /api/auth/login` - Login for admin/employee

### Employees
- `POST /api/employees` - Create employee (Admin only)
- `GET /api/employees` - Get all employees in company
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee (Admin only)

### Attendance
- `POST /api/attendance/login` - Login with GPS location
- `POST /api/attendance/logout` - Logout with GPS location
- `GET /api/attendance/history` - Get attendance history

### Company
- `GET /api/company` - Get company details
- `PUT /api/company/settings` - Update company settings (Admin only)

## Project Structure

```
src/
  config/
    db.js - Database configuration
  controllers/
    authController.js
    employeeController.js
    attendanceController.js
    companyController.js
  middleware/
    auth.js - JWT authentication
    errorHandler.js - Global error handling
    validation.js - Request validation
  models/
    Company.js
    Employee.js
    Attendance.js
    LocationLog.js
  routes/
    authRoutes.js
    employeeRoutes.js
    attendanceRoutes.js
    companyRoutes.js
  services/
    gpsService.js - Geofence calculations
    attendanceService.js - Attendance logic
  utils/
    tokenUtils.js - JWT utilities
    responseHandler.js - Standardized responses
  server.js - Application entry point
```

## License

ISC
