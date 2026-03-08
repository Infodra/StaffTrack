# MongoDB Collection Schemas - GPS Attendance System

## Database: `attendance_app`

This document describes the MongoDB collections designed for the GPS Attendance System.

---

## 1. companies Collection

Stores company information for multi-tenant SaaS architecture.

### Schema:

```javascript
{
  company_id: String (required, unique, uppercase),
  company_name: String (required),
  admin_email: String (required, unique, lowercase, validated),
  employee_limit: Number (default: 50),
  license_type: String (enum: ['lifetime', 'annual', 'monthly'], default: 'lifetime'),
  status: String (enum: ['active', 'suspended', 'cancelled'], default: 'active'),
  created_at: Date (default: Date.now),
  timestamps: true
}
```

### Indexes:
- `company_id`: unique index
- `admin_email`: unique index

### Example Document:

```json
{
  "_id": ObjectId("..."),
  "company_id": "TEC001",
  "company_name": "Tecinfo",
  "admin_email": "admin@tecinfo.com",
  "employee_limit": 50,
  "license_type": "lifetime",
  "status": "active",
  "created_at": ISODate("2026-03-06T10:00:00Z"),
  "createdAt": ISODate("2026-03-06T10:00:00Z"),
  "updatedAt": ISODate("2026-03-06T10:00:00Z")
}
```

---

## 2. employees Collection

Stores employee accounts with their individual geofence locations where attendance is allowed.

### Schema:

```javascript
{
  employee_id: String (required, unique, uppercase),
  company_id: String (required, indexed, uppercase),
  name: String (required),
  email: String (required, unique, lowercase, validated),
  password: String (required, hashed, select: false),
  role: String (enum: ['admin', 'employee'], default: 'employee'),
  department: String (default: 'General'),
  status: String (enum: ['active', 'inactive', 'suspended'], default: 'active'),
  
  // Individual employee geofence (working location)
  location_name: String (default: 'Office Location'),
  latitude: Number (required),
  longitude: Number (required),
  radius_meters: Number (required, default: 150),
  
  created_at: Date (default: Date.now),
  timestamps: true
}
```

### Indexes:
- `employee_id`: unique index
- `email`: unique index
- `{company_id: 1, employee_id: 1}`: compound index
- `{company_id: 1, email: 1}`: compound index
- `{company_id: 1, status: 1}`: compound index

### Example Document:

```json
{
  "_id": ObjectId("..."),
  "employee_id": "EMP001",
  "company_id": "TEC001",
  "name": "Raj Kumar",
  "email": "raj@tecinfo.com",
  "password": "$2a$10$hashedpassword...",
  "role": "employee",
  "department": "Field Service",
  "status": "active",
  "location_name": "Client Office",
  "latitude": 13.0827,
  "longitude": 80.2707,
  "radius_meters": 150,
  "created_at": ISODate("2026-03-06T10:00:00Z"),
  "createdAt": ISODate("2026-03-06T10:00:00Z"),
  "updatedAt": ISODate("2026-03-06T10:00:00Z")
}
```

### Key Feature:
Each employee has their **own working location** (geofence) defined by:
- `location_name`: Name of the location
- `latitude`, `longitude`: GPS coordinates
- `radius_meters`: Allowed radius from the location

This allows field employees to have different work locations.

---

## 3. attendance Collection

Stores daily attendance records for employees.

### Schema:

```javascript
{
  attendance_id: String (required, unique, uppercase),
  company_id: String (required, indexed, uppercase),
  employee_id: String (required, indexed, uppercase),
  date: String (required, indexed, format: 'YYYY-MM-DD'),
  check_in: Date (required),
  check_out: Date (default: null),
  working_hours: Number (default: 0),
  status: String (enum: ['present', 'absent', 'late', 'half-day', 'on-leave'], default: 'present'),
  timestamps: true
}
```

### Indexes:
- `attendance_id`: unique index
- `company_id`: index
- `employee_id`: index
- `date`: index
- `{company_id: 1, employee_id: 1, date: 1}`: compound index (for unique daily attendance)

### Example Document:

```json
{
  "_id": ObjectId("..."),
  "attendance_id": "ATT001",
  "company_id": "TEC001",
  "employee_id": "EMP001",
  "date": "2026-03-06",
  "check_in": ISODate("2026-03-06T09:02:00Z"),
  "check_out": ISODate("2026-03-06T18:10:00Z"),
  "working_hours": 9,
  "status": "present",
  "createdAt": ISODate("2026-03-06T09:02:00Z"),
  "updatedAt": ISODate("2026-03-06T18:10:00Z")
}
```

---

## 4. location_logs Collection

Stores GPS location data captured when employees login or logout.

### Schema:

```javascript
{
  company_id: String (required, indexed, uppercase),
  employee_id: String (required, indexed, uppercase),
  latitude: Number (required),
  longitude: Number (required),
  accuracy: Number (required, in meters),
  timestamp: Date (required, indexed, default: Date.now),
  timestamps: true
}
```

### Indexes:
- `company_id`: index
- `employee_id`: index
- `timestamp`: index
- `{company_id: 1, employee_id: 1}`: compound index
- `{employee_id: 1, timestamp: -1}`: compound index (for time-series queries)
- `{timestamp: 1}`: TTL index (expireAfterSeconds: 7776000) - Auto-delete after 90 days

### Example Document:

```json
{
  "_id": ObjectId("..."),
  "company_id": "TEC001",
  "employee_id": "EMP001",
  "latitude": 13.0827,
  "longitude": 80.2707,
  "accuracy": 10,
  "timestamp": ISODate("2026-03-06T09:02:00Z"),
  "createdAt": ISODate("2026-03-06T09:02:00Z"),
  "updatedAt": ISODate("2026-03-06T09:02:00Z")
}
```

### Key Feature:
- **TTL Index**: Automatically deletes location logs older than 90 days to manage storage
- **Accuracy**: GPS accuracy in meters (from device)

---

## Index Strategy

### Performance Indexes:

1. **Single Field Indexes:**
   - All `company_id` fields (for multi-tenant data isolation)
   - All `employee_id` fields (for employee-specific queries)
   - `date` field in attendance (for date range queries)
   - `timestamp` field in location_logs (for time-series queries)

2. **Compound Indexes:**
   - `{company_id: 1, employee_id: 1}` - For company-employee queries
   - `{company_id: 1, email: 1}` - For login/lookup
   - `{company_id: 1, status: 1}` - For active employee queries
   - `{company_id: 1, employee_id: 1, date: 1}` - For daily attendance

3. **Unique Indexes:**
   - `company_id` in companies
   - `admin_email` in companies
   - `employee_id` in employees
   - `email` in employees
   - `attendance_id` in attendance

4. **TTL Index:**
   - `timestamp` in location_logs (90 days retention)

---

## Data Relationships

```
companies
    ↓ (1:N)
employees
    ↓ (1:N)
attendance
    ↓ (1:N)
location_logs
```

- One company has many employees
- One employee has many attendance records
- Each attendance can have multiple location logs

---

## Geofencing Logic

### How It Works:

1. **Employee Setup:**
   - Each employee is assigned a working location with GPS coordinates
   - Geofence radius is defined (e.g., 150 meters)

2. **Login Process:**
   - Employee requests login with current GPS location
   - System calculates distance using Haversine formula:
     ```javascript
     distance = calculateDistance(
       employee.latitude,
       employee.longitude,
       currentLatitude,
       currentLongitude
     )
     ```
   - If `distance <= employee.radius_meters`, allow login
   - Store location in `location_logs`

3. **Individual Geofences:**
   - Field employees can have different work locations
   - Each validates against their own geofence
   - Admin can update employee locations as needed

---

## Sample Queries

### Get all employees of a company:
```javascript
db.employees.find({ company_id: "TEC001", status: "active" })
```

### Get today's attendance for an employee:
```javascript
db.attendance.findOne({
  company_id: "TEC001",
  employee_id: "EMP001",
  date: "2026-03-06"
})
```

### Get location history for last 7 days:
```javascript
db.location_logs.find({
  employee_id: "EMP001",
  timestamp: { 
    $gte: new Date(Date.now() - 7*24*60*60*1000) 
  }
}).sort({ timestamp: -1 })
```

### Count active employees per company:
```javascript
db.employees.aggregate([
  { $match: { status: "active" } },
  { $group: { _id: "$company_id", count: { $sum: 1 } } }
])
```

---

## Security Considerations

1. **Password Hashing:**
   - Passwords are hashed using bcrypt with salt rounds
   - Never stored in plain text
   - `select: false` prevents password from being returned in queries

2. **Data Isolation:**
   - All queries filter by `company_id`
   - Middleware ensures users can only access their company's data

3. **Location Privacy:**
   - Location logs auto-expire after 90 days
   - Only store necessary GPS data

4. **Role-Based Access:**
   - Admin role: Can manage all employees and view all attendance
   - Employee role: Can only view/manage their own attendance

---

## File Location

All Mongoose models are located in: `/backend/src/models/`

- `Company.js`
- `Employee.js`
- `Attendance.js`
- `LocationLog.js`

Each model includes full validation, indexes, and middleware (like password hashing).
