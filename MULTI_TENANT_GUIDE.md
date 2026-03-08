# Multi-Tenant Migration Guide

> **Summary:** This document outlines all changes made to convert the GPS Attendance System into a multi-tenant SaaS application supporting subdomain-based company isolation.

---

## 🎯 What's New

The application now supports **multiple companies** (tenants) accessing their own isolated data through unique subdomains:

- **tecinfo.st.infodra.ai** → Tecinfo Solutions
- **company1.st.infodra.ai** → Company1
- **company2.st.infodra.ai** → Company2

Each company gets:
✅ Complete data isolation
✅ Unique subdomain
✅ Independent employee and attendance management
✅ Custom geofence configuration

---

## 📁 Files Modified

### Backend Changes

#### 1. **New File:** `backend/src/middleware/tenantMiddleware.js`
   - Extracts company identifier from request hostname
   - Loads company record from database
   - Attaches `req.company` and `req.tenant` to request object
   - Supports development mode with `X-Company-ID` header

#### 2. **Updated:** `backend/src/models/Company.js`
   - Added `domain` field (e.g., "tecinfo.st.infodra.ai")
   - Added `office_location` object with latitude/longitude
   - Added `geofence_radius` field (meters)

#### 3. **Updated:** `backend/src/server.js`
   - Imported and registered `tenantMiddleware` globally
   - Updated CORS configuration to support wildcard subdomains
   - Added support for `X-Company-ID` header in development

#### 4. **Updated:** `backend/src/controllers/authController.js`
   - Modified `registerCompany()` to generate company_id and domain
   - Enhanced `login()` to enforce tenant isolation
   - Returns full company details including office location

#### 5. **Updated:** `backend/.env.example`
   - Added multi-tenant configuration variables
   - Added BASE_DOMAIN and API_DOMAIN settings
   - Enhanced documentation

### Frontend Changes

#### 6. **Updated:** `frontend/src/utils/helpers.js`
   - Added `getTenantFromHostname()` - extracts subdomain
   - Added `getCompanyDisplayName()` - formats tenant name
   - Added `isMultiTenantMode()` - detects production vs development

#### 7. **Updated:** `frontend/src/services/api.js`
   - Added tenant detection in request interceptor
   - Includes `X-Company-ID` header for development mode
   - Updated default API URL to localhost

#### 8. **Updated:** `frontend/src/layouts/Navbar.jsx`
   - Dynamically displays company name from tenant or stored data
   - Shows tenant-specific branding

#### 9. **Updated:** `frontend/src/pages/Login.jsx`
   - Displays company name based on subdomain
   - Enhanced branding for multi-tenant experience

#### 10. **Updated:** `frontend/.env.example`
   - Changed default API URL to localhost
   - Added documentation for production configuration

### Documentation

#### 11. **New File:** `DEPLOYMENT_CONFIG.md`
   - Complete production deployment guide
   - Google Cloud Run and Vercel setup
   - DNS configuration for wildcard subdomains
   - MongoDB Atlas setup
   - Security best practices
   - Monitoring and scaling guidelines

---

## 🔧 How It Works

### Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│  Browser: tecinfo.st.infodra.ai                     │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  Frontend (Vercel)                                  │
│  - Detects tenant from subdomain                    │
│  - Displays company branding                        │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  Backend API: api.infodra.ai (Cloud Run)            │
│  - Tenant Middleware extracts company               │
│  - Enforces data isolation                          │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  MongoDB Atlas                                       │
│  - companies collection                             │
│  - employees collection (filtered by company_id)    │
│  - attendances collection (filtered by company_id)  │
└─────────────────────────────────────────────────────┘
```

### Request Flow

1. **User accesses:** `https://tecinfo.st.infodra.ai`
2. **Frontend** detects tenant: "tecinfo"
3. **API request** sent to: `https://api.infodra.ai/api/auth/login`
4. **Tenant Middleware** extracts "tecinfo" from Host header
5. **Loads Company** from database: `Company.findOne({ company_id: 'TECINFO' })`
6. **Attaches to request:** `req.company` and `req.tenant`
7. **Controllers** filter queries: `Employee.find({ company_id: req.company.company_id })`
8. **Returns** only data for Tecinfo

---

## 🧪 Testing Locally

### 1. Start Backend and Frontend

Both servers should be running:
```bash
# Backend (already running)
cd backend
npm run dev

# Frontend (already running)
cd frontend
npm run dev
```

### 2. Create Test Company

Register Tecinfo:

```bash
curl -X POST http://localhost:5000/api/auth/register-company \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Tecinfo Solutions",
    "company_id": "TECINFO",
    "admin_email": "admin@tecinfo.com",
    "admin_password": "Test@123",
    "admin_name": "Tecinfo Admin",
    "office_latitude": 17.385044,
    "office_longitude": 78.486671,
    "geofence_radius": 100
  }'
```

Expected Response:
```json
{
  "success": true,
  "message": "Company registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "company": {
      "id": "...",
      "company_id": "TECINFO",
      "name": "Tecinfo Solutions",
      "domain": "tecinfo.st.infodra.ai"
    }
  }
}
```

### 3. Test Login with Company Isolation

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Company-ID: TECINFO" \
  -d '{
    "email": "admin@tecinfo.com",
    "password": "Test@123"
  }'
```

### 4. Test with Multiple Companies

Create another company:

```bash
curl -X POST http://localhost:5000/api/auth/register-company \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "ABC Corporation",
    "company_id": "ABC",
    "admin_email": "admin@abc.com",
    "admin_password": "Test@456",
    "admin_name": "ABC Admin",
    "office_latitude": 12.971599,
    "office_longitude": 77.594566,
    "geofence_radius": 150
  }'
```

Verify isolation - this should fail:
```bash
# Login to TECINFO with ABC credentials (should fail)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Company-ID: TECINFO" \
  -d '{
    "email": "admin@abc.com",
    "password": "Test@456"
  }'
```

### 5. Test in Browser

Open your browser and access:
- **http://localhost:3000**

The frontend will:
- Show "StaffTrack" (default) since you're on localhost
- After login, store company data and display company name in navbar
- Use `X-Company-ID` header for API requests based on logged-in user

---

## 🚀 Production Deployment Checklist

### Pre-Deployment

- [ ] Set up MongoDB Atlas cluster
- [ ] Generate secure JWT_SECRET (minimum 32 characters)
- [ ] Configure Google Cloud Project
- [ ] Set up Vercel account
- [ ] Purchase/configure domain (infodra.ai)

### Backend (Google Cloud Run)

- [ ] Create Dockerfile in backend folder
- [ ] Build and push Docker image to GCR
- [ ] Deploy to Cloud Run
- [ ] Set environment variables in Cloud Run
- [ ] Map custom domain: api.infodra.ai
- [ ] Test API health endpoint

### Frontend (Vercel)

- [ ] Connect GitHub repository to Vercel
- [ ] Configure environment variables
- [ ] Deploy to production
- [ ] Configure custom domains:
  - st.infodra.ai
  - *.st.infodra.ai (wildcard)
- [ ] Test subdomain access

### DNS Configuration

- [ ] Add A/CNAME records for api.infodra.ai → Cloud Run
- [ ] Add A/CNAME records for st.infodra.ai → Vercel
- [ ] Add wildcard CNAME: *.st.infodra.ai → Vercel
- [ ] Wait for DNS propagation (up to 48 hours)

### Post-Deployment Testing

- [ ] Test API: https://api.infodra.ai/health
- [ ] Register test company via API
- [ ] Access company subdomain: https://tecinfo.st.infodra.ai
- [ ] Test login and attendance features
- [ ] Verify data isolation between companies
- [ ] Test geofence validation
- [ ] Check CORS configuration

---

## 🔒 Security Considerations

### ✅ Implemented

1. **Tenant Isolation:** All database queries filter by company_id
2. **CORS Protection:** Only allows *.st.infodra.ai origins
3. **JWT Authentication:** Token-based auth with secure secret
4. **Company Status Check:** Suspended companies cannot access
5. **Login Isolation:** Users can only login through their company subdomain

### ⚠️ Recommended Additions

1. **Rate Limiting:** Add express-rate-limit middleware
2. **Input Validation:** Enhanced validation on all endpoints
3. **SQL Injection Protection:** MongoDB already protects, but validate inputs
4. **HTTPS Only:** Enforce HTTPS redirects in production
5. **API Key for Admin Actions:** Protect company registration endpoint
6. **Audit Logging:** Log all tenant access and modifications

---

## 📊 Database Schema Changes

### Updated Company Schema

```javascript
{
  company_id: "TECINFO",           // NEW: unique identifier
  company_name: "Tecinfo Solutions",
  admin_email: "admin@tecinfo.com",
  domain: "tecinfo.st.infodra.ai", // NEW: subdomain
  office_location: {               // NEW: geofence center
    latitude: 17.385044,
    longitude: 78.486671
  },
  geofence_radius: 100,            // NEW: radius in meters
  employee_limit: 50,
  license_type: "enterprise",
  status: "active",
  created_at: Date,
  updated_at: Date
}
```

### Existing Collections (No Schema Changes)

- **employees:** Already has `company_id` field
- **attendances:** Already has `company_id` field
- **locationlogs:** Already has `company_id` field

All queries now use `company_id` from `req.company` for filtering.

---

## 🐛 Troubleshooting

### Issue: "Company not found" error

**Cause:** Company_id doesn't match subdomain or company doesn't exist

**Solution:**
```bash
# Check if company exists
mongo
use gps_attendance_system
db.companies.find({ company_id: "TECINFO" })

# Ensure company_id is uppercase
db.companies.updateMany({}, { $set: { company_id: { $toUpper: "$company_id" } } })
```

### Issue: CORS error in browser

**Cause:** Origin not allowed or credentials issue

**Solution:**
- Verify CORS regex in server.js: `/\.infodra\.ai$/`
- Check if origin matches pattern
- Ensure `credentials: true` is set

### Issue: Login works but can't access other endpoints

**Cause:** Token doesn't include company context

**Solution:**
- Clear localStorage and login again
- Verify `req.company` is attached by middleware
- Check token is being sent in Authorization header

### Issue: Development mode - X-Company-ID not working

**Cause:** User data not stored or parsed incorrectly

**Solution:**
- Login first to store user data
- Check localStorage for 'user' key
- Verify company.company_id exists in stored user data

---

## 📝 Migration Steps for Existing Data

If you already have companies in the database, run this migration:

```javascript
// Run in MongoDB shell or migration script

// 1. Add missing fields to existing companies
db.companies.updateMany(
  { domain: { $exists: false } },
  [
    {
      $set: {
        domain: {
          $concat: [
            { $toLower: "$company_id" },
            ".st.infodra.ai"
          ]
        },
        office_location: {
          latitude: 0,
          longitude: 0
        },
        geofence_radius: 100
      }
    }
  ]
);

// 2. Ensure company_id is uppercase
db.companies.updateMany(
  {},
  [
    {
      $set: {
        company_id: { $toUpper: "$company_id" }
      }
    }
  ]
);

// 3. Update employees to match company_id format
db.employees.updateMany(
  {},
  [
    {
      $set: {
        company_id: { $toUpper: "$company_id" }
      }
    }
  ]
);

// 4. Update attendances to match company_id format
db.attendances.updateMany(
  {},
  [
    {
      $set: {
        company_id: { $toUpper: "$company_id" }
      }
    }
  ]
);

// 5. Verify data
db.companies.find({}, { company_id: 1, domain: 1, office_location: 1 });
```

---

## 🎉 Success Criteria

Your multi-tenant setup is successful when:

✅ Multiple companies can register independently
✅ Each company accesses via unique subdomain
✅ Users cannot see data from other companies
✅ Login only works on correct company subdomain
✅ Company branding displays correctly
✅ Geofence validation uses company office location
✅ All existing features work per company
✅ Performance is acceptable with multiple tenants

---

## 🔄 Rollback Plan

If issues arise, rollback steps:

1. **Revert Backend:**
   ```bash
   git checkout HEAD~1 backend/src/middleware/tenantMiddleware.js
   git checkout HEAD~1 backend/src/server.js
   git checkout HEAD~1 backend/src/models/Company.js
   git checkout HEAD~1 backend/src/controllers/authController.js
   ```

2. **Revert Frontend:**
   ```bash
   git checkout HEAD~1 frontend/src/utils/helpers.js
   git checkout HEAD~1 frontend/src/services/api.js
   git checkout HEAD~1 frontend/src/layouts/Navbar.jsx
   git checkout HEAD~1 frontend/src/pages/Login.jsx
   ```

3. **Remove middleware from server.js**
4. **Restart both servers**

---

## 📞 Support

For issues or questions:
- Check troubleshooting section above
- Review DEPLOYMENT_CONFIG.md for production details
- Test with curl commands to isolate frontend vs backend issues
- Verify database records with MongoDB shell

---

## ✨ Next Steps

1. **Test the multi-tenant functionality locally**
2. **Register 2-3 test companies**
3. **Verify complete data isolation**
4. **Plan production deployment**
5. **Set up monitoring and logging**
6. **Create operational runbooks**

---

**Last Updated:** March 8, 2026
**Version:** 1.0.0 Multi-Tenant Release
