# GitHub to GCP Deployment Guide

This guide explains how to deploy the Staff Tracker application to Google Cloud Platform using GitHub as the source repository.

## Prerequisites

- GitHub account with access to: https://github.com/Infodra/Stafftracker
- GCP account with Project ID: `infodra-ai-platform`
- gcloud CLI installed and authenticated
- Git installed on your local machine
- MongoDB Atlas cluster set up and connection string ready

## Deployment Methods

### Method 1: Cloud Build Automatic Deployment (Recommended)

This method automatically deploys to GCP whenever you push code to GitHub.

#### Step 1: Initialize Git Repository

```powershell
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Staff Tracker with Login/Logout features"
```

#### Step 2: Connect to GitHub Repository

```powershell
# Add GitHub remote
git remote add origin https://github.com/Infodra/Stafftracker.git

# Verify remote
git remote -v

# Push to GitHub (first time with -u flag)
git push -u origin main
```

If you get an error about branches, try:
```powershell
git branch -M main
git push -u origin main
```

#### Step 3: Set Up Cloud Build Trigger in GCP

1. **Open Cloud Build Console**:
   - Go to: https://console.cloud.google.com/cloud-build/triggers?project=infodra-ai-platform

2. **Connect Repository**:
   - Click "Connect Repository"
   - Choose "GitHub"
   - Authenticate with GitHub
   - Select repository: `Infodra/Stafftracker`
   - Click "Connect"

3. **Create Trigger**:
   - Click "Create Trigger"
   - **Name**: `deploy-on-push`
   - **Description**: Auto-deploy Staff Tracker on push to main
   - **Event**: Push to a branch
   - **Source**: Choose your repository
   - **Branch**: `^main$`
   - **Configuration**: Cloud Build configuration file (yaml or json)
   - **Cloud Build configuration file location**: `/cloudbuild.yaml`
   - **Substitution variables** (Add these):
     - `_MONGODB_URI`: Your MongoDB Atlas connection string
     - `_JWT_SECRET`: Your JWT secret key
   - Click "Create"

4. **Set Environment Variables**:
   - In Cloud Build settings, go to your trigger
   - Add substitution variables for sensitive data
   - Or manually set them in Cloud Run after deployment

#### Step 4: Configure Environment Variables in Cloud Run

After first deployment:

```powershell
# Backend environment variables
gcloud run services update attendance-backend \
  --region=asia-south1 \
  --update-env-vars="MONGODB_URI=your_mongodb_uri_here,JWT_SECRET=your_jwt_secret_here,NODE_ENV=production,ALLOWED_ORIGINS=https://tecinfo.st.infodra.ai,BASE_DOMAIN=st.infodra.ai"

# Frontend environment variables
gcloud run services update attendance-frontend \
  --region=asia-south1 \
  --update-env-vars="VITE_API_BASE_URL=https://api.st.infodra.ai"
```

#### Step 5: Trigger Deployment

Now, whenever you push code to GitHub, it will automatically deploy:

```powershell
# Make changes to your code
git add .
git commit -m "Your commit message"
git push origin main

# Cloud Build will automatically detect the push and deploy
```

---

### Method 2: Manual Deployment from GitHub

If you prefer manual control over deployments:

#### Step 1: Push Code to GitHub

```powershell
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/Infodra/Stafftracker.git
git push -u origin main
```

#### Step 2: Deploy Backend from GitHub

```powershell
# Set project
gcloud config set project infodra-ai-platform

# Deploy backend
gcloud run deploy attendance-backend \
  --source=https://github.com/Infodra/Stafftracker \
  --source-path=backend \
  --region=asia-south1 \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --set-env-vars="NODE_ENV=production,MONGODB_URI=your_mongodb_uri,JWT_SECRET=your_jwt_secret"
```

#### Step 3: Deploy Frontend from GitHub

```powershell
# Deploy frontend
gcloud run deploy attendance-frontend \
  --source=https://github.com/Infodra/Stafftracker \
  --source-path=frontend \
  --region=asia-south1 \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --set-env-vars="VITE_API_BASE_URL=https://api.st.infodra.ai"
```

---

### Method 3: GitHub Actions CI/CD (Optional)

For more control with GitHub Actions:

1. Create `.github/workflows/deploy.yml` (already created if exists)
2. Set up GitHub Secrets for GCP credentials
3. Push triggers automatic deployment via GitHub Actions

---

## Post-Deployment Steps

### 1. Configure Load Balancer and Custom Domains

```powershell
# Reserve static IP
gcloud compute addresses create attendance-ip --global

# Get the IP address
gcloud compute addresses describe attendance-ip --global --format="get(address)"

# Configure DNS (use the IP address from above)
# Add A records in your DNS provider:
# tecinfo.st.infodra.ai -> [Static IP]
# api.st.infodra.ai -> [Static IP]
```

### 2. Set Up SSL Certificates

```powershell
# Create managed SSL certificate
gcloud compute ssl-certificates create attendance-ssl \
  --domains=tecinfo.st.infodra.ai,api.st.infodra.ai \
  --global
```

### 3. Configure Load Balancer

Follow the detailed steps in `GCP_DEPLOYMENT_GUIDE.md` to set up:
- Network Endpoint Groups (NEGs)
- Backend Services
- URL Map
- HTTPS Proxy
- Forwarding Rules

### 4. Initialize Database

```bash
# Create initial company data
curl -X POST https://api.st.infodra.ai/api/companies/register \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Tecinfo Engineering Solutions Pvt Ltd",
    "company_id": "TECINFO",
    "domain": "tecinfo",
    "admin_name": "Admin",
    "admin_email": "admin@tecinfo.com",
    "admin_password": "admin123",
    "office_location": {
      "latitude": 11.0168,
      "longitude": 76.9558
    },
    "geofence_radius": 100
  }'
```

---

## Continuous Deployment Workflow

Once set up, your workflow will be:

```powershell
# 1. Make code changes locally
# 2. Test locally
npm run dev

# 3. Commit changes
git add .
git commit -m "Feature: Description of changes"

# 4. Push to GitHub
git push origin main

# 5. Cloud Build automatically deploys (if using Method 1)
# 6. Monitor deployment in Cloud Build Console
# 7. Verify at https://tecinfo.st.infodra.ai
```

---

## Monitoring Deployments

### View Cloud Build Logs
```powershell
# List recent builds
gcloud builds list --limit=10

# View specific build logs
gcloud builds log [BUILD_ID]
```

### View Cloud Run Services
```powershell
# List services
gcloud run services list --region=asia-south1

# Describe a service
gcloud run services describe attendance-backend --region=asia-south1

# View logs
gcloud run services logs read attendance-backend --region=asia-south1
```

### Cloud Console Links
- **Cloud Build**: https://console.cloud.google.com/cloud-build/builds?project=infodra-ai-platform
- **Cloud Run**: https://console.cloud.google.com/run?project=infodra-ai-platform
- **Logs**: https://console.cloud.google.com/logs?project=infodra-ai-platform

---

## Troubleshooting

### Build Fails
- Check Cloud Build logs
- Verify Dockerfile syntax
- Ensure all dependencies are in package.json

### Environment Variables Not Set
```powershell
# Update environment variables
gcloud run services update attendance-backend \
  --region=asia-south1 \
  --update-env-vars="KEY=value"
```

### Authentication Issues
```powershell
# Re-authenticate
gcloud auth login

# Verify project
gcloud config get-value project
```

### GitHub Connection Issues
```powershell
# Check remote
git remote -v

# Re-add remote if needed
git remote remove origin
git remote add origin https://github.com/Infodra/Stafftracker.git
```

---

## Quick Reference Commands

```powershell
# Push to GitHub
git add .
git commit -m "Your message"
git push origin main

# Manual deploy backend
gcloud run deploy attendance-backend --source=./backend --region=asia-south1

# Manual deploy frontend
gcloud run deploy attendance-frontend --source=./frontend --region=asia-south1

# View logs
gcloud run services logs read attendance-backend --region=asia-south1

# Update env vars
gcloud run services update attendance-backend --update-env-vars="KEY=value"

# List deployments
gcloud run services list --region=asia-south1
```

---

## Cost Optimization

- Cloud Run scales to zero when not in use
- First 2 million requests/month are free
- Estimated cost: $10-50/month depending on usage
- Monitor costs: https://console.cloud.google.com/billing?project=infodra-ai-platform

---

## Support

- **GitHub Issues**: https://github.com/Infodra/Stafftracker/issues
- **GCP Support**: https://console.cloud.google.com/support
- **Documentation**: See GCP_DEPLOYMENT_GUIDE.md for detailed manual deployment steps
