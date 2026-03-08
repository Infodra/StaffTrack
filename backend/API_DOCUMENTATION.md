# GPS Attendance System - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### 1. Register Company
**POST** `/auth/register-company`

Register a new company with an admin user.

**Request Body:**
```json
{
  "company_name": "Tech Corp",
  "admin_email": "admin@techcorp.com",
  "admin_password": "password123",
  "admin_name": "John Doe",
  "office_latitude": 37.7749,
  "office_longitude": -122.4194,
  "subscription_plan": "basic",
  "geofence_radius": 100
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Company registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "company": {
      "id": "60d5ec49f1a2c8b1f8e4e1a1",
      "name": "Tech Corp",
      "subscription_plan": "basic"
    },
    "user": {
      "id": "60d5ec49f1a2c8b1f8e4e1a2",
      "name": "John Doe",
      "email": "admin@techcorp.com",
      "role": "admin"
    }
  }
}
```

### 2. Login
**POST** `/auth/login`

Login for admin or employee.

**Request Body:**
```json
{
  "email": "admin@techcorp.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "company": {
      "id": "60d5ec49f1a2c8b1f8e4e1a1",
      "name": "Tech Corp",
      "subscription_plan": "basic"
    },
    "user": {
      "id": "60d5ec49f1a2c8b1f8e4e1a2",
      "name": "John Doe",
      "email": "admin@techcorp.com",
      "role": "admin",
      "department": "General"
    }
  }
}
```

---

## Employee Endpoints

### 3. Create Employee
**POST** `/employees`

Create a new employee (Admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@techcorp.com",
  "password": "password123",
  "role": "employee",
  "department": "Engineering"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "_id": "60d5ec49f1a2c8b1f8e4e1a3",
    "company_id": "60d5ec49f1a2c8b1f8e4e1a1",
    "name": "Jane Smith",
    "email": "jane@techcorp.com",
    "role": "employee",
    "department": "Engineering",
    "status": "active",
    "created_at": "2026-03-06T10:00:00.000Z"
  }
}
```

### 4. Get All Employees
**GET** `/employees`

Get all employees in the company.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 50)
- `status` (optional): Filter by status (active, inactive, suspended)
- `department` (optional): Filter by department
- `search` (optional): Search by name or email

**Example:**
```
GET /employees?page=1&limit=20&status=active&department=Engineering
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "employees": [
      {
        "_id": "60d5ec49f1a2c8b1f8e4e1a3",
        "name": "Jane Smith",
        "email": "jane@techcorp.com",
        "role": "employee",
        "department": "Engineering",
        "status": "active"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "pages": 1,
      "limit": 20
    }
  }
}
```

### 5. Get Employee by ID
**GET** `/employees/:id`

Get a specific employee by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49f1a2c8b1f8e4e1a3",
    "name": "Jane Smith",
    "email": "jane@techcorp.com",
    "role": "employee",
    "department": "Engineering",
    "status": "active"
  }
}
```

### 6. Update Employee
**PUT** `/employees/:id`

Update employee information.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Jane Doe",
  "department": "DevOps",
  "status": "active"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Employee updated successfully",
  "data": {
    "_id": "60d5ec49f1a2c8b1f8e4e1a3",
    "name": "Jane Doe",
    "email": "jane@techcorp.com",
    "department": "DevOps",
    "status": "active"
  }
}
```

### 7. Delete Employee
**DELETE** `/employees/:id`

Delete an employee (Admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Employee deleted successfully",
  "data": null
}
```

---

## Attendance Endpoints

### 8. Login
**POST** `/attendance/login`

Login with GPS location.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "latitude": 37.7749,
  "longitude": -122.4194
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Checked in successfully",
  "data": {
    "attendance_id": "60d5ec49f1a2c8b1f8e4e1a4",
    "check_in_time": "2026-03-06T09:00:00.000Z",
    "date": "2026-03-06T00:00:00.000Z",
    "status": "present"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "You are 250m away from the office. Please move within 100m radius to login."
}
```

### 9. Logout
**POST** `/attendance/logout`

Logout with GPS location.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "latitude": 37.7749,
  "longitude": -122.4194
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Checked out successfully",
  "data": {
    "attendance_id": "60d5ec49f1a2c8b1f8e4e1a4",
    "check_in_time": "2026-03-06T09:00:00.000Z",
    "check_out_time": "2026-03-06T18:00:00.000Z",
    "working_hours": 9,
    "date": "2026-03-06T00:00:00.000Z",
    "status": "present"
  }
}
```

### 10. Get Attendance History
**GET** `/attendance/history`

Get attendance history for the logged-in employee (or any employee if admin).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `startDate` (optional): Start date (ISO 8601 format)
- `endDate` (optional): End date (ISO 8601 format)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 30)
- `employee_id` (optional, admin only): Get history for specific employee

**Example:**
```
GET /attendance/history?startDate=2026-03-01&endDate=2026-03-31&page=1&limit=30
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "_id": "60d5ec49f1a2c8b1f8e4e1a4",
        "date": "2026-03-06T00:00:00.000Z",
        "check_in": {
          "time": "2026-03-06T09:00:00.000Z",
          "location": {
            "latitude": 37.7749,
            "longitude": -122.4194
          }
        },
        "check_out": {
          "time": "2026-03-06T18:00:00.000Z",
          "location": {
            "latitude": 37.7749,
            "longitude": -122.4194
          }
        },
        "working_hours": 9,
        "status": "present",
        "employee_id": {
          "name": "Jane Smith",
          "email": "jane@techcorp.com",
          "department": "Engineering"
        }
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "pages": 1,
      "limit": 30
    }
  }
}
```

### 11. Get Today's Status
**GET** `/attendance/today`

Get today's attendance status for the logged-in employee.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "attendance_id": "60d5ec49f1a2c8b1f8e4e1a4",
    "date": "2026-03-06T00:00:00.000Z",
    "check_in_time": "2026-03-06T09:00:00.000Z",
    "check_out_time": null,
    "working_hours": 0,
    "status": "checked-in"
  }
}
```

### 12. Get Attendance Report
**GET** `/attendance/report`

Get attendance report for the company (Admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `startDate` (optional): Start date (default: first day of current month)
- `endDate` (optional): End date (default: today)
- `department` (optional): Filter by department

**Response (200):**
```json
{
  "success": true,
  "data": {
    "period": {
      "start_date": "2026-03-01T00:00:00.000Z",
      "end_date": "2026-03-06T00:00:00.000Z"
    },
    "report": [
      {
        "_id": "60d5ec49f1a2c8b1f8e4e1a3",
        "employee_name": "Jane Smith",
        "employee_email": "jane@techcorp.com",
        "department": "Engineering",
        "total_days": 6,
        "present_days": 6,
        "total_working_hours": 54,
        "average_working_hours": 9
      }
    ]
  }
}
```

---

## Company Endpoints

### 13. Get Company Details
**GET** `/company`

Get company information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "60d5ec49f1a2c8b1f8e4e1a1",
    "name": "Tech Corp",
    "admin_email": "admin@techcorp.com",
    "subscription_plan": "basic",
    "employee_limit": 10,
    "employee_count": 5,
    "office_location": {
      "latitude": 37.7749,
      "longitude": -122.4194
    },
    "geofence_radius": 100,
    "status": "active",
    "created_at": "2026-03-01T00:00:00.000Z"
  }
}
```

### 14. Update Company Settings
**PUT** `/company/settings`

Update company settings (Admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "company_name": "Tech Corporation",
  "office_latitude": 37.7750,
  "office_longitude": -122.4195,
  "geofence_radius": 150
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Company settings updated successfully",
  "data": {
    "id": "60d5ec49f1a2c8b1f8e4e1a1",
    "name": "Tech Corporation",
    "office_location": {
      "latitude": 37.7750,
      "longitude": -122.4195
    },
    "geofence_radius": 150
  }
}
```

### 15. Get Company Statistics
**GET** `/company/stats`

Get company statistics (Admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "employees": {
      "total": 5,
      "active": 5,
      "inactive": 0,
      "limit": 10,
      "remaining": 5
    },
    "attendance_today": {
      "checked_in": 4,
      "checked_out": 2,
      "currently_in_office": 2
    },
    "subscription": {
      "plan": "basic",
      "status": "active"
    }
  }
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Role 'employee' is not authorized to access this route"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Employee not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Server Error"
}
```

---

## Subscription Plans

| Plan       | Employee Limit |
|------------|----------------|
| Basic      | 10             |
| Premium    | 50             |
| Enterprise | 500            |

---

## GPS Geofencing

The system uses the Haversine formula to calculate the distance between the employee's location and the office location. 

- If the employee is within the geofence radius, login/logout is allowed.
- If outside the radius, an error message is returned with the distance.

Default geofence radius: **100 meters** (configurable per company)

---

## Additional Notes

1. **Multi-tenant Isolation**: All data is isolated by `company_id`. Employees can only access data from their own company.

2. **Role-Based Access**:
   - **Admin**: Can create/update/delete employees, view all reports, update company settings
   - **Employee**: Can only login/logout and view their own attendance history

3. **Date Handling**: All dates are stored in UTC. The server uses ISO 8601 format.

4. **Working Hours Calculation**: Automatically calculated when logout is recorded.

5. **Location Logs**: All login/logout locations are logged in the LocationLogs collection with a TTL of 90 days.
