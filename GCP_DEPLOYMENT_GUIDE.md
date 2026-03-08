# GCP Deployment Guide - Tecinfo Attendance System

This guide will help you deploy the Attendance System to Google Cloud Platform with the domain **tecinfo.st.infodra.ai**.

## Architecture Overview

- **Backend**: Cloud Run (Node.js/Express API)
- **Frontend**: Cloud Run (Nginx serving React SPA)
- **Database**: MongoDB Atlas (Managed MongoDB)
- **Domain**: Cloud DNS + Load Balancer
- **SSL**: Google-managed SSL certificate

---

## Prerequisites

1. **GCP Account** with billing enabled
2. **Google Cloud SDK (gcloud)** installed
3. **MongoDB Atlas** account (free tier available)
4. **Domain access** to configure DNS for infodra.ai

---

## Step 1: Setup MongoDB Atlas

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Create a free cluster or use existing

2. **Create Database**
   - Database name: `attendance_app`
   - Create collections: `companies`, `employees`, `attendances`, `locationlogs`

3. **Configure Network Access**
   - Go to Network Access → Add IP Address
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add specific GCP Cloud Run IP ranges

4. **Create Database User**
   - Go to Database Access → Add New Database User
   - Username: `attendance_admin`
   - Password: Generate secure password
   - Grant "Read and write to any database" privilege

5. **Get Connection String**
   - Click "Connect" → "Connect your application"
   - Copy connection string (looks like):
   ```
   mongodb+srv://attendance_admin:<password>@cluster0.xxxxx.mongodb.net/attendance_app?retryWrites=true&w=majority
   ```
   - Replace `<password>` with your actual password

---

## Step 2: Setup GCP Project

### 2.1 Create or Select Project

```bash
# Login to GCP
gcloud auth login

# Create new project (or use existing)
gcloud projects create infodra-ai-platform --name="Infodra AI Platform"

# Set as active project
gcloud config set project infodra-ai-platform

# Enable billing (required for Cloud Run)
# Do this via GCP Console: https://console.cloud.google.com/billing
```

### 2.2 Enable Required APIs

```bash
# Enable required services
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com \
  compute.googleapis.com \
  dns.googleapis.com
```

### 2.3 Set Default Region

```bash
# Set your preferred region (choose closest to your users)
gcloud config set run/region asia-south1  # Mumbai
# Or use: us-central1, europe-west1, etc.
```

---

## Step 3: Prepare Application for Production

### 3.1 Backend Environment Variables

Create `backend/.env.production`:

```env
# Database
MONGODB_URI=mongodb+srv://attendance_admin:<password>@cluster0.xxxxx.mongodb.net/attendance_app?retryWrites=true&w=majority

# Server
PORT=8080
NODE_ENV=production

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long

# CORS Origins (your frontend domain)
ALLOWED_ORIGINS=https://tecinfo.st.infodra.ai,https://www.tecinfo.st.infodra.ai

# Multi-tenant domain
BASE_DOMAIN=st.infodra.ai
```

### 3.2 Frontend Environment Variables

Create `frontend/.env.production`:

```env
VITE_API_BASE_URL=https://api.st.infodra.ai/api
```

---

## Step 4: Deploy Backend to Cloud Run

### 4.1 Build and Deploy

```bash
# Navigate to backend directory
cd backend

# Build and deploy to Cloud Run
gcloud run deploy attendance-backend \
  --source . \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars "$(cat .env.production | grep -v '^#' | xargs | tr ' ' ',')"

# Alternative: Set env vars individually
gcloud run deploy attendance-backend \
  --source . \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars MONGODB_URI="your-mongodb-uri" \
  --set-env-vars JWT_SECRET="your-jwt-secret" \
  --set-env-vars NODE_ENV=production \
  --set-env-vars PORT=8080
```

**Note**: The deployment will take 3-5 minutes. Cloud Run will automatically create a service URL.

### 4.2 Get Backend URL

```bash
gcloud run services describe attendance-backend --region asia-south1 --format='value(status.url)'
```

You'll get something like: `https://attendance-backend-xxxxxxxxx-as.a.run.app`

---

## Step 5: Deploy Frontend to Cloud Run

### 5.1 Update Frontend API URL

Update `frontend/.env.production` with your backend URL:

```env
VITE_API_BASE_URL=https://attendance-backend-xxxxxxxxx-as.a.run.app/api
```

### 5.2 Build and Deploy

```bash
# Navigate to frontend directory
cd frontend

# Build and deploy to Cloud Run
gcloud run deploy attendance-frontend \
  --source . \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated
```

### 5.3 Get Frontend URL

```bash
gcloud run services describe attendance-frontend --region asia-south1 --format='value(status.url)'
```

You'll get something like: `https://attendance-frontend-xxxxxxxxx-as.a.run.app`

---

## Step 6: Setup Custom Domain with Load Balancer

### 6.1 Reserve Static IP Address

```bash
# Reserve global static IP
gcloud compute addresses create attendance-ip --global

# Get the IP address
gcloud compute addresses describe attendance-ip --global --format='value(address)'
```

**Note**: Save this IP address - you'll need it for DNS configuration.

### 6.2 Create Serverless Network Endpoint Groups (NEGs)

```bash
# Backend NEG
gcloud compute network-endpoint-groups create attendance-backend-neg \
  --region=asia-south1 \
  --network-endpoint-type=SERVERLESS \
  --cloud-run-service=attendance-backend

# Frontend NEG
gcloud compute network-endpoint-groups create attendance-frontend-neg \
  --region=asia-south1 \
  --network-endpoint-type=SERVERLESS \
  --cloud-run-service=attendance-frontend
```

### 6.3 Create Backend Services

```bash
# Backend service for API
gcloud compute backend-services create attendance-backend-service \
  --global

gcloud compute backend-services add-backend attendance-backend-service \
  --global \
  --network-endpoint-group=attendance-backend-neg \
  --network-endpoint-group-region=asia-south1

# Frontend service
gcloud compute backend-services create attendance-frontend-service \
  --global

gcloud compute backend-services add-backend attendance-frontend-service \
  --global \
  --network-endpoint-group=attendance-frontend-neg \
  --network-endpoint-group-region=asia-south1
```

### 6.4 Create URL Map

```bash
# Create URL map
gcloud compute url-maps create attendance-url-map \
  --default-service=attendance-frontend-service

# Add path matcher for API
gcloud compute url-maps add-path-matcher attendance-url-map \
  --path-matcher-name=api-matcher \
  --default-service=attendance-frontend-service \
  --path-rules="/api/*=attendance-backend-service"
```

### 6.5 Create SSL Certificate

```bash
# Create managed SSL certificate
gcloud compute ssl-certificates create attendance-ssl-cert \
  --domains=tecinfo.st.infodra.ai,www.tecinfo.st.infodra.ai,api.st.infodra.ai \
  --global
```

**Note**: SSL certificate provisioning can take 15-60 minutes after DNS is configured.

### 6.6 Create HTTPS Target Proxy

```bash
gcloud compute target-https-proxies create attendance-https-proxy \
  --ssl-certificates=attendance-ssl-cert \
  --url-map=attendance-url-map \
  --global
```

### 6.7 Create Forwarding Rule

```bash
gcloud compute forwarding-rules create attendance-https-rule \
  --address=attendance-ip \
  --target-https-proxy=attendance-https-proxy \
  --global \
  --ports=443
```

### 6.8 Create HTTP to HTTPS Redirect

```bash
# Create HTTP URL map
gcloud compute url-maps create attendance-http-redirect \
  --default-url-redirect-response-code=301 \
  --default-url-redirect-https-redirect

# Create HTTP proxy
gcloud compute target-http-proxies create attendance-http-proxy \
  --url-map=attendance-http-redirect \
  --global

# Create forwarding rule for HTTP
gcloud compute forwarding-rules create attendance-http-rule \
  --address=attendance-ip \
  --target-http-proxy=attendance-http-proxy \
  --global \
  --ports=80
```

---

## Step 7: Configure DNS

You need to configure DNS for the domain `st.infodra.ai` to point to your GCP Load Balancer.

### 7.1 Get the Static IP Address

```bash
gcloud compute addresses describe attendance-ip --global --format='value(address)'
```

### 7.2 Add DNS Records

In your DNS provider (where infodra.ai is registered), add these A records:

```
Type  | Name                  | Value (IP Address)     | TTL
------|-----------------------|------------------------|------
A     | tecinfo.st.infodra.ai | <YOUR_STATIC_IP>       | 3600
A     | api.st.infodra.ai     | <YOUR_STATIC_IP>       | 3600
CNAME | www.tecinfo.st       | tecinfo.st.infodra.ai  | 3600
```

**Example** (if IP is 34.120.45.67):
```
A     tecinfo.st.infodra.ai     34.120.45.67
A     api.st.infodra.ai         34.120.45.67
CNAME www.tecinfo.st.infodra.ai tecinfo.st.infodra.ai
```

### 7.3 Wait for DNS Propagation

DNS changes can take 5 minutes to 48 hours to propagate worldwide. Use this to check:
```bash
nslookup tecinfo.st.infodra.ai
```

---

## Step 8: Update Backend CORS and Tenant Configuration

### 8.1 Update Backend CORS

The backend should already support wildcard subdomains. Verify in `backend/src/server.js`:

```javascript
// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Allow all subdomains of infodra.ai
    if (/\.infodra\.ai$/.test(origin) || origin === 'https://infodra.ai') {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};
```

### 8.2 Update Middleware for Production

Ensure `backend/src/middleware/tenantMiddleware.js` handles production domains correctly.

---

## Step 9: Setup Company Data

After deployment, initialize the Tecinfo company:

### 9.1 Create Company via API

```bash
curl -X POST https://api.st.infodra.ai/api/auth/register-company \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Tecinfo Engineering Solutions Pvt Ltd",
    "admin_name": "Admin User",
    "admin_email": "admin@tecinfo.com",
    "admin_password": "your-secure-password",
    "domain": "tecinfo.st.infodra.ai",
    "office_location": {
      "latitude": 12.9716,
      "longitude": 77.5946
    },
    "geofence_radius": 100
  }'
```

---

## Step 10: Verify Deployment

### 10.1 Check SSL Certificate Status

```bash
gcloud compute ssl-certificates describe attendance-ssl-cert --global
```

Wait until status shows `ACTIVE` (can take up to 60 minutes).

### 10.2 Test the Application

1. **Open in browser**: https://tecinfo.st.infodra.ai
2. **Login with**: admin@tecinfo.com / your-password
3. **Test attendance login/logout**
4. **Verify multi-tenant** by accessing different subdomains

### 10.3 Monitor Logs

```bash
# Backend logs
gcloud run services logs read attendance-backend --region asia-south1

# Frontend logs
gcloud run services logs read attendance-frontend --region asia-south1
```

---

## Step 11: Cost Optimization

### 11.1 Set Auto-scaling

```bash
# Backend - scale down to 0 when not in use
gcloud run services update attendance-backend \
  --region asia-south1 \
  --min-instances 0 \
  --max-instances 10

# Frontend
gcloud run services update attendance-frontend \
  --region asia-south1 \
  --min-instances 0 \
  --max-instances 10
```

### 11.2 Set Resource Limits

```bash
# Backend
gcloud run services update attendance-backend \
  --region asia-south1 \
  --memory 512Mi \
  --cpu 1

# Frontend
gcloud run services update attendance-frontend \
  --region asia-south1 \
  --memory 256Mi \
  --cpu 1
```

---

## Step 12: Setup Monitoring (Optional)

### 12.1 Enable Cloud Monitoring

```bash
# Cloud Monitoring is enabled by default for Cloud Run
# View metrics in GCP Console: https://console.cloud.google.com/run
```

### 12.2 Setup Uptime Checks

Create uptime checks in Cloud Console to monitor availability:
- Frontend: https://tecinfo.st.infodra.ai
- Backend API: https://api.st.infodra.ai/health

---

## Estimated Costs

**Monthly estimates** (low traffic):

- **Cloud Run**: $0-5 (first 2M requests free)
- **Load Balancer**: $18-25
- **Static IP**: $0 (free when in use)
- **MongoDB Atlas**: $0 (free tier) or $57+ (M10 cluster)
- **Egress**: $0.12/GB after 1GB

**Total**: ~$20-85/month depending on traffic and database tier

---

## Troubleshooting

### Issue: SSL Certificate Not Activating

**Solution**: 
- DNS must be properly configured first
- Can take up to 60 minutes
- Check: `gcloud compute ssl-certificates describe attendance-ssl-cert --global`

### Issue: CORS Errors

**Solution**: 
- Verify backend CORS configuration
- Check frontend is using correct API URL
- Redeploy backend with updated CORS settings

### Issue: Company Not Found Error

**Solution**: 
- Ensure X-Company-ID header is sent
- Check tenant middleware configuration
- Verify company exists in database with correct domain

### Issue: Cold Start Delays

**Solution**: 
- Set `--min-instances 1` for faster response
- Implement health check pings
- Use Cloud Scheduler to keep warm

---

## Maintenance Commands

### Update Backend

```bash
cd backend
gcloud run deploy attendance-backend --source . --region asia-south1
```

### Update Frontend

```bash
cd frontend
gcloud run deploy attendance-frontend --source . --region asia-south1
```

### View Logs

```bash
gcloud run services logs tail attendance-backend --region asia-south1
```

### Scale Services

```bash
gcloud run services update attendance-backend --max-instances 20 --region asia-south1
```

---

## Security Checklist

- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Enable MongoDB Atlas IP whitelist
- [ ] Use environment variables for secrets
- [ ] Enable Cloud Armor for DDoS protection
- [ ] Setup Cloud IAM roles properly
- [ ] Enable audit logging
- [ ] Regular security updates
- [ ] Backup MongoDB Atlas data regularly

---

## Support

For issues or questions:
- GCP Documentation: https://cloud.google.com/run/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com

---

**Deployment Complete!** 🎉

Your application should now be live at:
- **Frontend**: https://tecinfo.st.infodra.ai
- **API**: https://api.st.infodra.ai
