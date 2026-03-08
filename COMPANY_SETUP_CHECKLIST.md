# Company Setup Checklist - GPS Attendance System

## 📋 Required Information to Configure Your Company

This document lists all the information you need to provide to set up your GPS Attendance System.

---

## 1. 🏢 Company Information

| Field | Description | Example | Required |
|-------|-------------|---------|----------|
| **Company ID** | Unique identifier for your company (3-10 characters) | TEC001, INFOD001 | ✅ Yes |
| **Company Name** | Full legal or business name | Tecinfo, Infodra Technologies | ✅ Yes |
| **Admin Email** | Primary administrator email address | admin@tecinfo.com | ✅ Yes |
| **Admin Password** | Password for admin login (min 6 characters) | SecurePass123 | ✅ Yes |
| **Admin Name** | Name of the administrator | Raj Kumar | ✅ Yes |
| **Employee Limit** | Maximum number of employees allowed | 50, 100, 500 | ✅ Yes |
| **License Type** | Subscription plan type | lifetime, annual, monthly | ✅ Yes |
| **Department** | Admin's department (optional) | Management, IT, HR | ⚪ Optional |

---

## 2. 👥 Employee Information

For each employee, you need to provide:

### Basic Details:

| Field | Description | Example | Required |
|-------|-------------|---------|----------|
| **Employee ID** | Unique identifier | EMP001, EMP002 | ✅ Yes |
| **Employee Name** | Full name | Priya Sharma | ✅ Yes |
| **Email** | Employee email (used for login) | priya@tecinfo.com | ✅ Yes |
| **Password** | Initial password (employee can change later) | welcome123 | ✅ Yes |
| **Role** | Access level | employee or admin | ✅ Yes |
| **Department** | Department/team name | Field Service, Sales, IT | ⚪ Optional |
| **Status** | Employment status | active, inactive | ✅ Yes |

### 📍 Geofence Location Details (Important!):

Each employee must have a designated working location where they can login/logout.

| Field | Description | Example | Required |
|-------|-------------|---------|----------|
| **Location Name** | Name of the work location | Client Office A, Main Office, Warehouse | ✅ Yes |
| **Latitude** | GPS latitude coordinate | 13.0827 | ✅ Yes |
| **Longitude** | GPS longitude coordinate | 80.2707 | ✅ Yes |
| **Radius (meters)** | Allowed distance from location | 100, 150, 200 | ✅ Yes |

**Important Notes:**
- Field employees can have **different work locations**
- Each employee validates attendance against **their own geofence**
- You can update locations later if employees change work sites

### How to Get GPS Coordinates:

1. **Google Maps Method:**
   - Go to https://www.google.com/maps
   - Right-click on the location
   - Click on the coordinates (they'll be copied)
   - Example: 13.0827, 80.2707

2. **Mobile Phone:**
   - Open Google Maps app
   - Long press on location
   - View coordinates at top

3. **GPS Tool:**
   - Visit: https://www.gps-coordinates.net/
   - Search location or click on map

---

## 3. 🔐 Environment Configuration

Backend settings (`.env` file):

| Field | Description | Current Value | Update? |
|-------|-------------|---------------|---------|
| **MONGODB_URI** | MongoDB connection string | mongodb+srv://Dev:Testing123@... | ✅ Update with your MongoDB credentials |
| **JWT_SECRET** | Secret key for authentication | your_jwt_secret_key... | ✅ Change to strong random string |
| **JWT_EXPIRE** | Token expiration time | 7d (7 days) | ⚪ Optional |
| **PORT** | Backend server port | 5000 | ⚪ Optional |
| **NODE_ENV** | Environment mode | development / production | ⚪ Optional |

Frontend settings (`frontend/.env`):

| Field | Description | Current Value | Update? |
|-------|-------------|---------------|---------|
| **VITE_API_URL** | Backend API endpoint | http://localhost:5000/api | ✅ Update for production |

---

## 4. 🌍 MongoDB Atlas Configuration

Database settings you need to configure:

| Task | Description | How to Do |
|------|-------------|-----------|
| **Cluster Status** | Ensure cluster is running | MongoDB Atlas Dashboard > Clusters |
| **Database Name** | Create/use database | attendance_app (auto-created) |
| **Database User** | Create database user | Database Access > Add New User |
| **Username** | Database username | Dev, admin, or custom |
| **Password** | Database password | Strong password |
| **IP Whitelist** | Allow connections | Network Access > Add IP: 0.0.0.0/0 |
| **Connection String** | Get MongoDB URI | Clusters > Connect > Drivers |

---

## 5. 📊 Sample Employee Data Template

Use this template to prepare your employee list:

```csv
employee_id,name,email,password,role,department,status,location_name,latitude,longitude,radius_meters
EMP001,Raj Kumar,raj@company.com,password123,admin,Management,active,Main Office,13.0827,80.2707,150
EMP002,Priya Sharma,priya@company.com,password123,employee,Field Service,active,Client Office A,13.0850,80.2750,100
EMP003,Arun Kumar,arun@company.com,password123,employee,Sales,active,Branch Office,13.0900,80.2800,150
EMP004,Lakshmi Devi,lakshmi@company.com,password123,employee,IT,active,Main Office,13.0827,80.2707,150
```

### Excel/Google Sheets Template:

| employee_id | name | email | password | role | department | status | location_name | latitude | longitude | radius_meters |
|------------|------|-------|----------|------|------------|--------|---------------|----------|-----------|---------------|
| EMP001 | Raj Kumar | raj@company.com | password123 | admin | Management | active | Main Office | 13.0827 | 80.2707 | 150 |
| EMP002 | Priya Sharma | priya@company.com | password123 | employee | Field Service | active | Client Office | 13.0850 | 80.2750 | 100 |

---

## 6. 🎯 Geofence Radius Guidelines

Choose appropriate radius based on work location type:

| Location Type | Recommended Radius | Example |
|---------------|-------------------|---------|
| **Small Office** | 50-100 meters | Single floor office |
| **Large Office/Campus** | 150-200 meters | Multi-building campus |
| **Field Location** | 100-150 meters | Client site, construction site |
| **Retail Store** | 50-100 meters | Shop, showroom |
| **Warehouse** | 200-300 meters | Large warehouse facility |
| **Open Area** | 150-250 meters | Outdoor work sites |

**GPS Accuracy Considerations:**
- Mobile GPS accuracy: ±5-50 meters
- Building structures can affect GPS signal
- Allow buffer for GPS inaccuracy
- Minimum recommended: 50 meters
- Maximum recommended: 500 meters

---

## 7. 📝 Implementation Checklist

### Phase 1: Initial Setup

- [ ] Get MongoDB Atlas cluster URL
- [ ] Configure Network Access (IP whitelist)
- [ ] Create database user credentials
- [ ] Update backend `.env` file with MongoDB URI
- [ ] Update backend `.env` with JWT secret
- [ ] Update frontend `.env` with API URL

### Phase 2: Company Registration

- [ ] Prepare company information (name, ID, admin email)
- [ ] Choose employee limit
- [ ] Select license type
- [ ] Decide admin password

### Phase 3: Employee Setup

- [ ] Create list of all employees
- [ ] Assign unique employee IDs
- [ ] Collect email addresses
- [ ] Generate initial passwords
- [ ] Assign departments
- [ ] Determine roles (admin/employee)

### Phase 4: Geofence Configuration

- [ ] Identify all work locations
- [ ] Get GPS coordinates for each location
- [ ] Name each location clearly
- [ ] Set appropriate radius for each location
- [ ] Test GPS accuracy at locations
- [ ] Assign employees to their work locations

### Phase 5: Testing

- [ ] Test MongoDB connection (run `node src/scripts/testConnection.js`)
- [ ] Initialize database (run `node src/scripts/initDatabase.js`)
- [ ] Start backend server
- [ ] Start frontend application
- [ ] Test admin login
- [ ] Test employee login
- [ ] Test GPS login/logout
- [ ] Verify geofence validation
- [ ] Test attendance reports

---

## 8. 🔄 Ongoing Updates

Information you can update later through the admin panel:

### Company Settings:
- ✅ Company name
- ✅ Admin email
- ✅ Employee limit
- ⚠️ Company ID (cannot be changed after creation)

### Employee Management:
- ✅ Add new employees
- ✅ Update employee details
- ✅ Change employee status (active/inactive)
- ✅ Update geofence locations
- ✅ Change radius
- ✅ Reset passwords
- ✅ Update departments
- ⚠️ Employee ID (cannot be changed after creation)

### Attendance:
- ✅ View attendance records
- ✅ Generate reports
- ✅ Export data
- ⚠️ Manual corrections (contact support)

---

## 9. 📞 Quick Reference

### Company Registration Endpoint:
```
POST /api/auth/register
```

**Required Body:**
```json
{
  "company_id": "TEC001",
  "company_name": "Tecinfo",
  "admin_email": "admin@tecinfo.com",
  "admin_password": "SecurePass123",
  "admin_name": "Raj Kumar",
  "employee_limit": 50,
  "license_type": "lifetime"
}
```

### Add Employee Endpoint:
```
POST /api/employees
```

**Required Body:**
```json
{
  "employee_id": "EMP001",
  "name": "Priya Sharma",
  "email": "priya@tecinfo.com",
  "password": "password123",
  "role": "employee",
  "department": "Field Service",
  "location_name": "Client Office A",
  "latitude": 13.0850,
  "longitude": 80.2750,
  "radius_meters": 100
}
```

---

## 10. ⚠️ Important Notes

1. **Security:**
   - Change default JWT_SECRET immediately
   - Use strong passwords
   - Enable HTTPS in production
   - Keep MongoDB credentials secure

2. **GPS Accuracy:**
   - Requires HTTPS in production (browser security)
   - GPS may not work indoors
   - Urban areas have better GPS signal
   - Weather can affect accuracy

3. **Data Privacy:**
   - Location logs auto-delete after 90 days
   - Inform employees about GPS tracking
   - Comply with local privacy laws

4. **Limitations:**
   - GPS spoofing is possible (consider additional security)
   - VPN can affect location accuracy
   - Airplane mode prevents GPS access

---

## 📧 Support

For questions or issues during setup:
1. Review [SETUP_GUIDE.md](SETUP_GUIDE.md)
2. Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
3. Review [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)
4. Test connection: `node src/scripts/testConnection.js`

---

**Last Updated:** March 6, 2026
