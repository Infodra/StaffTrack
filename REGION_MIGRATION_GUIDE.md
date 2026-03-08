# Region Migration Guide: asia-south1 → us-central1

## Why Migrating?
Cloud Run's domain mapping feature is only available in certain regions. asia-south1 (Mumbai) doesn't support it, so we're moving to **us-central1** (Iowa, USA) which does.

## What Changed?
✅ Updated `cloudbuild.yaml` to deploy to `us-central1` instead of `asia-south1`

## Step-by-Step Migration

### Step 1: Commit and Push the Regional Change
```powershell
# In your project root
cd "C:\Users\VijayalakshmiChandra\OneDrive - Infodra Technologies Private Limited\Documents\AppStore\Attendance"

# Check what changed
git status

# Add the updated file
git add cloudbuild.yaml

# Commit
git commit -m "Change region to us-central1 for domain mapping support"

# Push to trigger automatic deployment
git push origin main
```

### Step 2: Monitor Deployment
1. **Cloud Build will automatically start**: https://console.cloud.google.com/cloud-build/builds?project=infodra-ai-platform
2. Wait for both services to deploy (typically 2-3 minutes)
3. Check for SUCCESS status

### Step 3: Delete Old asia-south1 Services (Optional - Save Costs)
After new deployment succeeds:
1. Go to Cloud Run: https://console.cloud.google.com/run?project=infodra-ai-platform
2. Find old services in asia-south1 region
3. Delete them to avoid duplicate charges

OR keep them as backup temporarily.

### Step 4: Copy Environment Variables to New Services

#### Backend Environment Variables:
1. Go to new **attendance-backend** service in us-central1
2. Click **"EDIT & DEPLOY NEW REVISION"**
3. Go to **"Variables & Secrets"** tab
4. Add these environment variables:

```
MONGODB_URI = <your MongoDB Atlas connection string>
JWT_SECRET = EqdszbCcjSv5ZUgGrDYy1VwFeoipf2aTMlI0X7kxB4869htPHKuLnJ3RWQAmNO
NODE_ENV = production
ALLOWED_ORIGINS = https://tecinfo.st.infodra.ai
BASE_DOMAIN = st.infodra.ai
```

5. Click **"DEPLOY"**

#### Frontend Environment Variables:
1. Go to new **attendance-frontend** service in us-central1
2. Click **"EDIT & DEPLOY NEW REVISION"**
3. Go to **"Variables & Secrets"** tab
4. Add this environment variable:

```
VITE_API_BASE_URL = <your new backend URL from us-central1>
```

Example: `https://attendance-backend-<hash>-uc.a.run.app`

5. Click **"DEPLOY"**

### Step 5: Configure Autoscaling (Optional)
For both services:
1. Edit service → **"SCALING & CONTAINER"** tab
2. Set **Minimum instances: 0**
3. Set **Maximum instances: 5**
4. Click **"DEPLOY"**

### Step 6: Map Custom Domains

#### 6.1 Navigate to Domain Mappings
https://console.cloud.google.com/run/domains?project=infodra-ai-platform

#### 6.2 Map Frontend Domain
1. Click **"ADD MAPPING"**
2. **Select service**: attendance-frontend (us-central1)
3. **Enter domain**: `tecinfo.st.infodra.ai`
4. Click **"CONTINUE"**
5. Follow verification steps if first time
6. Note the DNS records required

#### 6.3 Map Backend Domain
1. Click **"ADD MAPPING"** again
2. **Select service**: attendance-backend (us-central1)
3. **Enter domain**: `api.st.infodra.ai`
4. Click **"CONTINUE"**
5. Note the DNS records required

### Step 7: Update DNS Records

Go to your domain registrar (where you manage infodra.ai) and add:

```
Type: CNAME
Name: tecinfo.st
Value: ghs.googlehosted.com
TTL: 3600

Type: CNAME
Name: api.st
Value: ghs.googlehosted.com
TTL: 3600
```

### Step 8: Wait for DNS and SSL
- **DNS Propagation**: 15 minutes - 48 hours (usually ~1 hour)
- **SSL Certificate**: Automatically provisions after DNS is verified
- Check status in Cloud Run Domain Mappings page

### Step 9: Test Your Application

#### Test Backend API:
```powershell
# Health check
curl https://api.st.infodra.ai/api/health

# Should return: {"status":"ok","message":"Server is running"}
```

#### Test Frontend:
1. Open browser: https://tecinfo.st.infodra.ai
2. You should see login page
3. Try logging in (after initializing company data)

### Step 10: Initialize Company Data (MongoDB)

Once backend is accessible on custom domain:

```powershell
# Register Tecinfo company
curl -X POST https://api.st.infodra.ai/api/auth/register/company `
  -H "Content-Type: application/json" `
  -d '{
    "companyName": "TECINFO",
    "subdomain": "tecinfo",
    "email": "admin@tecinfo.com",
    "password": "admin123",
    "contactNumber": "+91-9876543210",
    "address": "Coimbatore, Tamil Nadu",
    "officeLocation": {
      "latitude": 11.0168,
      "longitude": 76.9558
    },
    "allowedRadius": 100
  }'
```

## Performance Considerations

### Latency Impact:
- **From India**: ~200-250ms (vs ~20-30ms with asia-south1)
- **From US**: ~20-50ms (better than before)

### For Your Use Case:
- **7 employees** checking in/out 2x per day = **very minimal impact**
- Employee experience: Login/logout takes 0.2 seconds vs 0.03 seconds
- **Trade-off is acceptable** for domain mapping capability

## Cost Comparison

Both regions have same pricing:
- Cloud Run: Same rates
- No additional costs from region change
- If keeping both regions temporarily: 2x cost until old services deleted

## Rollback Plan (If Needed)

If you need to go back to asia-south1:
1. Edit `cloudbuild.yaml` and change `us-central1` back to `asia-south1`
2. Commit and push
3. Services will redeploy to asia-south1
4. Delete us-central1 services

## Summary Checklist

- [ ] Pushed updated `cloudbuild.yaml` to GitHub
- [ ] Verified deployment succeeded in Cloud Build
- [ ] Configured backend environment variables (MongoDB, JWT, etc.)
- [ ] Configured frontend environment variable (API URL)
- [ ] Set autoscaling (min: 0, max: 5)
- [ ] Added domain mapping for tecinfo.st.infodra.ai
- [ ] Added domain mapping for api.st.infodra.ai
- [ ] Configured CNAME records at domain registrar
- [ ] Waited for DNS propagation and SSL certificate
- [ ] Tested backend API health endpoint
- [ ] Tested frontend login page
- [ ] Initialized Tecinfo company in MongoDB
- [ ] Tested login with admin@tecinfo.com
- [ ] Deleted old asia-south1 services (optional)

## Support Links

- Cloud Run Console: https://console.cloud.google.com/run?project=infodra-ai-platform
- Domain Mappings: https://console.cloud.google.com/run/domains?project=infodra-ai-platform
- Cloud Build History: https://console.cloud.google.com/cloud-build/builds?project=infodra-ai-platform
- GitHub Repository: https://github.com/Infodra/Stafftracker

## Questions?

Common issues:
- **"Domain still not working"**: Wait longer for DNS (check with `nslookup tecinfo.st.infodra.ai`)
- **"SSL pending"**: Cloud Run auto-provisions after DNS verified (can take up to 1 hour)
- **"API errors"**: Check backend environment variables are set correctly
- **"Login not working"**: Ensure company registered in MongoDB via API
