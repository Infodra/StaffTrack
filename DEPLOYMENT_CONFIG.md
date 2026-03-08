# Multi-Tenant Deployment Configuration

## Overview

The GPS Attendance SaaS application now supports multi-tenant architecture using subdomains. Each company gets its own subdomain while sharing the same application instance.

## Domain Structure

```
infodra.ai                     → Main platform site
st.infodra.ai                  → StaffTracker landing page
tecinfo.st.infodra.ai          → Tecinfo company dashboard
company1.st.infodra.ai         → Company1 dashboard
company2.st.infodra.ai         → Company2 dashboard
api.infodra.ai                 → Backend API (Cloud Run)
```

---

## Backend Deployment (Google Cloud Run)

### Environment Variables (Production)

```env
# Server Configuration
PORT=8080
NODE_ENV=production

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gps_attendance_system?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_secure_random_string_minimum_32_characters
JWT_EXPIRE=7d

# Geofence Configuration
DEFAULT_GEOFENCE_RADIUS=100

# Multi-Tenant Configuration
BASE_DOMAIN=st.infodra.ai
API_DOMAIN=api.infodra.ai

# CORS Configuration
CORS_ORIGIN=https://st.infodra.ai
```

### Cloud Run Configuration

```yaml
# cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/gps-attendance-backend', './backend']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/gps-attendance-backend']
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'gps-attendance-api'
      - '--image'
      - 'gcr.io/$PROJECT_ID/gps-attendance-backend'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'
```

### Dockerfile (Backend)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8080

CMD ["node", "src/server.js"]
```

### Domain Mapping

```bash
# Map custom domain to Cloud Run service
gcloud run domain-mappings create \
  --service gps-attendance-api \
  --domain api.infodra.ai \
  --region us-central1
```

---

## Frontend Deployment (Vercel)

### Environment Variables (Production)

```env
VITE_API_BASE_URL=https://api.infodra.ai/api
VITE_APP_NAME=StaffTracker
VITE_APP_VERSION=1.0.0
```

### Vercel Configuration

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_BASE_URL": "https://api.infodra.ai/api"
  }
}
```

### DNS Configuration for Wildcard Subdomains

In your DNS provider (e.g., Cloudflare):

```
Type    Name    Content                     TTL
A       @       <Vercel IP>                 Auto
A       *       <Vercel IP>                 Auto
CNAME   st      cname.vercel-dns.com        Auto
CNAME   *.st    cname.vercel-dns.com        Auto
```

---

## MongoDB Atlas Setup

### Create Database

1. Create a new cluster in MongoDB Atlas
2. Create database: `gps_attendance_system`
3. Collections will be auto-created:
   - companies
   - employees
   - attendances
   - locationlogs

### Network Access

Allow Cloud Run IP ranges or use "Allow from Anywhere" (0.0.0.0/0) for serverless.

### Database User

Create a user with `readWrite` permissions:
```
Username: gps_app_user
Password: <strong-password>
```

---

## Initial Company Setup

### Register First Company (Tecinfo)

Use the API to register the first company:

```bash
curl -X POST https://api.infodra.ai/api/auth/register-company \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Tecinfo Solutions",
    "company_id": "TECINFO",
    "domain": "tecinfo.st.infodra.ai",
    "admin_email": "admin@tecinfo.com",
    "admin_password": "SecurePassword123!",
    "admin_name": "Admin User",
    "office_latitude": 17.385044,
    "office_longitude": 78.486671,
    "geofence_radius": 100,
    "subscription_plan": "enterprise"
  }'
```

### Expected Response

```json
{
  "success": true,
  "message": "Company registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "company": {
      "id": "507f1f77bcf86cd799439011",
      "company_id": "TECINFO",
      "name": "Tecinfo Solutions",
      "domain": "tecinfo.st.infodra.ai",
      "subscription_plan": "enterprise"
    },
    "user": {
      "id": "507f1f77bcf86cd799439012",
      "name": "Admin User",
      "email": "admin@tecinfo.com",
      "role": "admin"
    }
  }
}
```

---

## Testing Multi-Tenant Access

### Test Tenant Isolation

1. **Access Tecinfo dashboard:**
   - URL: https://tecinfo.st.infodra.ai
   - Login: admin@tecinfo.com / SecurePassword123!

2. **Register another company:**
   ```bash
   curl -X POST https://api.infodra.ai/api/auth/register-company \
     -H "Content-Type: application/json" \
     -d '{
       "company_name": "ABC Corporation",
       "company_id": "ABC",
       "domain": "abc.st.infodra.ai",
       "admin_email": "admin@abc.com",
       "admin_password": "SecurePassword456!",
       "admin_name": "ABC Admin",
       "office_latitude": 12.971599,
       "office_longitude": 77.594566,
       "geofence_radius": 150
     }'
   ```

3. **Verify tenant isolation:**
   - Users from TECINFO cannot access ABC data
   - Each company has separate employee lists
   - Attendance records are isolated by company

---

## Development Mode

### Local Development with Multi-Tenant

For local testing, use the custom header approach:

```bash
# Test with Tecinfo tenant
curl -X GET http://localhost:5000/api/employees \
  -H "Authorization: Bearer <token>" \
  -H "X-Company-ID: TECINFO"

# Test with ABC tenant
curl -X GET http://localhost:5000/api/employees \
  -H "Authorization: Bearer <token>" \
  -H "X-Company-ID: ABC"
```

The frontend can be tested locally by editing your hosts file:

```
# Windows: C:\Windows\System32\drivers\etc\hosts
# Mac/Linux: /etc/hosts

127.0.0.1 tecinfo.localhost
127.0.0.1 abc.localhost
```

Then access:
- http://tecinfo.localhost:3000
- http://abc.localhost:3000

---

## Security Considerations

1. **JWT Secret:** Use a strong, random string (minimum 32 characters)
2. **CORS:** Strictly configured to allow only *.st.infodra.ai
3. **Tenant Isolation:** All queries filter by company_id
4. **Rate Limiting:** Consider adding rate limiting middleware
5. **HTTPS Only:** Enforce HTTPS in production
6. **Environment Variables:** Never commit .env files to git

---

## Monitoring & Logging

### Cloud Run Logging

```bash
# View logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=gps-attendance-api"
```

### Key Metrics to Monitor

- **Request Count:** Track requests per tenant
- **Error Rate:** Monitor 4xx and 5xx errors
- **Response Time:** API latency per endpoint
- **Database Queries:** MongoDB query performance
- **Memory Usage:** Cloud Run memory consumption

---

## Scaling

### Cloud Run Auto-Scaling

```bash
gcloud run services update gps-attendance-api \
  --min-instances=1 \
  --max-instances=10 \
  --concurrency=80 \
  --memory=512Mi
```

### MongoDB Atlas Scaling

Upgrade cluster tier as needed:
- M0 (Free): Testing only
- M10: Up to 100 companies
- M20: Up to 500 companies
- M30+: Enterprise scale

---

## Backup & Recovery

### MongoDB Atlas Backups

Enable automatic continuous backups in Atlas:
- Configure backup frequency
- Set retention period
- Test restore procedures

---

## Support & Maintenance

### Adding New Companies

Companies can self-register via the API or you can add them manually:

```javascript
// Run in MongoDB shell or script
db.companies.insertOne({
  company_id: "NEWCO",
  company_name: "New Company Inc",
  admin_email: "admin@newco.com",
  domain: "newco.st.infodra.ai",
  office_location: {
    latitude: 28.7041,
    longitude: 77.1025
  },
  geofence_radius: 100,
  employee_limit: 50,
  subscription_plan: "premium",
  status: "active",
  created_at: new Date()
});
```

---

## Troubleshooting

### Common Issues

**1. Company not found error:**
- Verify company_id matches subdomain
- Check company status is 'active'
- Ensure DNS is properly configured

**2. CORS errors:**
- Verify origin matches *.st.infodra.ai pattern
- Check CORS_ORIGIN environment variable
- Ensure credentials: true is set

**3. Login fails:**
- Verify employee belongs to correct company
- Check company status
- Validate JWT_SECRET is consistent

**4. Geofence validation fails:**
- Verify office_location coordinates
- Check geofence_radius is reasonable
- Ensure client sends accurate GPS coordinates

---

## Next Steps

1. Deploy backend to Google Cloud Run
2. Deploy frontend to Vercel
3. Configure DNS for wildcard subdomains
4. Register initial companies
5. Set up monitoring and alerts
6. Configure backups
7. Create operational runbooks
