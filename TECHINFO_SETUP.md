# Techinfo Company - Quick Setup Guide

## 🏢 Company Details

**Company Name:** Techinfo  
**Company ID:** TEC001  
**License Type:** Lifetime  
**Employee Limit:** 50

---

## 🔑 Admin Login Credentials

| Field | Value |
|-------|-------|
| **Email** | info@tecinfoes.com |
| **Password** | Admin123 |
| **Role** | Admin |
| **Employee ID** | EMP001 |

---

## 📍 Office Location (UPDATE THIS!)

The admin account is configured with a default location:

| Field | Current Value | Action Required |
|-------|---------------|-----------------|
| Location Name | Techinfo Office | ✅ OK (can update) |
| Latitude | 13.0827 | ⚠️ UPDATE with actual coordinates |
| Longitude | 80.2707 | ⚠️ UPDATE with actual coordinates |
| Geofence Radius | 150 meters | ✅ OK (can adjust) |

### How to Get Your Office GPS Coordinates:

1. **Google Maps Method:**
   - Go to https://www.google.com/maps
   - Search for "Techinfo" or your office address
   - Right-click on your exact office location
   - Click on the coordinates (they will be copied)
   - Example: `13.0827, 80.2707`

2. **Update in Script:**
   - Open: `backend/src/scripts/registerTechinfo.js`
   - Find the `ADMIN_LOCATION` section (around line 21)
   - Replace latitude and longitude values

---

## 🚀 How to Register Techinfo Company

### Step 1: Fix MongoDB Connection (If Not Done)

1. Go to https://cloud.mongodb.com
2. Ensure cluster is active (not paused)
3. Network Access → Add IP Address → `0.0.0.0/0`
4. Verify Database Access user exists with correct credentials

### Step 2: Run Registration Script

Open terminal and run:

```bash
cd backend
node src/scripts/registerTechinfo.js
```

**Expected Output:**
```
✅ MongoDB Connected Successfully
📋 Creating Company...
✅ Company Created Successfully!
👤 Creating Admin Account...
✅ Admin Account Created Successfully!

🎉 TECHINFO COMPANY REGISTERED SUCCESSFULLY!

🔑 ADMIN LOGIN CREDENTIALS:
   Email:     info@tecinfoes.com
   Password:  Admin123
   Role:      Admin
```

### Step 3: Login to System

1. Open browser: http://localhost:3000
2. Click "Login"
3. Enter credentials:
   - Email: `info@tecinfoes.com`
   - Password: `Admin123`
4. Click "Sign In"

---

## 📱 What You Can Do as Admin

### Employee Management
- ✅ Add new employees
- ✅ Assign each employee their own work location
- ✅ Set individual geofence radius for each employee
- ✅ Update employee details
- ✅ Activate/deactivate employees

### Attendance Management
- ✅ View all employee attendance
- ✅ See today's attendance summary
- ✅ Generate attendance reports
- ✅ Export attendance data
- ✅ View working hours

### Company Settings
- ✅ Update company information
- ✅ View employee count
- ✅ Manage license details

---

## 👥 Adding Your First Employee

Once logged in as admin:

1. **Navigate to Employees**
   - Click "Employees" in the navigation menu

2. **Click "Add Employee"**

3. **Fill Employee Details:**
   - Employee ID: `EMP002` (must be unique)
   - Name: Employee full name
   - Email: Employee email address
   - Password: Initial password (employee can change later)
   - Department: e.g., Sales, IT, Field Service
   - Role: Select "employee" (not admin)

4. **Set Employee's Work Location** (Important!)
   - Location Name: e.g., "Client Office A", "Branch Office"
   - Latitude: GPS coordinate (use Google Maps)
   - Longitude: GPS coordinate
   - Radius: Distance in meters (e.g., 100, 150)

5. **Click "Create Employee"**

---

## 📍 Employee Work Location Examples

Different employees can have different work locations:

| Employee | Location | Coordinates | Radius |
|----------|----------|-------------|--------|
| Field Sales Rep | Client Office A | 13.0850, 80.2750 | 100m |
| Office Manager | Main Office | 13.0827, 80.2707 | 150m |
| Warehouse Staff | Warehouse | 13.0900, 80.2800 | 200m |
| Branch Manager | Branch Office | 12.9716, 77.5946 | 150m |

**Each employee checks in/out at their assigned location!**

---

## 🔄 Testing GPS Attendance

### Test Admin Attendance:

1. Login as admin
2. Click "Dashboard"
3. Click "Check In" button
4. Allow browser location access
5. System will validate you're within 150m of Admin location
6. If within geofence: Check-in successful ✅
7. Later, click "Check Out"

### Test Employee Attendance:

1. Logout from admin
2. Login with employee credentials
3. Employee must be at their assigned location
4. Click "Check In"
5. System validates against employee's geofence
6. Check-in allowed only if within radius

---

## ⚠️ Important Notes

### Security:
- ✅ Change admin password after first login
- ✅ Use strong passwords for all employees
- ✅ Don't share admin credentials
- ✅ Regularly review employee access

### GPS Accuracy:
- 📍 GPS accuracy: ±5-50 meters
- 📍 Set radius larger than expected (min 50m recommended)
- 📍 GPS works best outdoors
- 📍 May be less accurate inside buildings
- 📍 HTTPS required in production (browser security)

### Geofence Tips:
- 🎯 Small office: 50-100 meters
- 🎯 Large campus: 150-200 meters
- 🎯 Field location: 100-150 meters
- 🎯 Warehouse: 200-300 meters

### Data Privacy:
- 🔒 Location logs auto-delete after 90 days
- 🔒 Only capture location during check-in/out
- 🔒 Inform employees about GPS tracking
- 🔒 Comply with local privacy regulations

---

## 🔧 Troubleshooting

### Cannot Register Company:
- ✅ Check MongoDB connection
- ✅ Run: `node src/scripts/testConnection.js`
- ✅ Ensure database name is: `attendance_app`

### Company Already Exists:
- Script will show warning
- Use different company_id or delete existing

### Login Not Working:
- ✅ Verify email: `info@tecinfoes.com` (exact match)
- ✅ Verify password: `Admin123` (case-sensitive)
- ✅ Check backend server is running
- ✅ Open browser console for errors

### GPS Not Working:
- ✅ Enable location permission in browser
- ✅ HTTPS required in production
- ✅ Check if location services enabled on device
- ✅ Try outdoors for better GPS signal

---

## 📞 Support Files

- **Registration Script:** `backend/src/scripts/registerTechinfo.js`
- **Database Test:** `backend/src/scripts/testConnection.js`
- **API Documentation:** `backend/API_DOCUMENTATION.md`
- **Setup Guide:** `backend/SETUP_GUIDE.md`
- **Company Setup:** `COMPANY_SETUP_CHECKLIST.md`

---

## ✅ Registration Checklist

- [ ] Fix MongoDB Atlas connection
- [ ] Update GPS coordinates in registration script
- [ ] Run: `node src/scripts/registerTechinfo.js`
- [ ] Confirm company created successfully
- [ ] Login at http://localhost:3000
- [ ] Test admin account
- [ ] Add first employee with their location
- [ ] Test employee login
- [ ] Test GPS check-in/out functionality
- [ ] Configure employee geofences
- [ ] Review attendance dashboard

---

**Last Updated:** March 6, 2026  
**Company:** Techinfo  
**Admin Contact:** info@tecinfoes.com
