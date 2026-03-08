# Deployment Links

## GitHub Repository
- **Repository URL**: https://github.com/Infodra/Stafftracker
- **Purpose**: Source code for Staff Tracker GPS Attendance Application

## Google Cloud Platform
- **Project ID**: `infodra-ai-platform`
- **Console**: https://console.cloud.google.com/welcome?project=infodra-ai-platform
- **Cloud Run Console**: https://console.cloud.google.com/run?project=infodra-ai-platform
- **Cloud Build Console**: https://console.cloud.google.com/cloud-build?project=infodra-ai-platform
- **DNS Console**: https://console.cloud.google.com/net-services/dns?project=infodra-ai-platform
- **Region**: asia-south1

## Deployment Commands

### Initial Setup
```bash
# Set GCP project
gcloud config set project infodra-ai-platform

# Verify current project
gcloud config get-value project
```

### Quick Deployment
```bash
# Run automated deployment script
bash deploy-gcp.sh
```

### Manual Deployment
```bash
# Backend
cd backend
gcloud run deploy attendance-backend \
  --source . \
  --region asia-south1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080

# Frontend
cd ../frontend
gcloud run deploy attendance-frontend \
  --source . \
  --region asia-south1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080
```

## Production URLs (After Deployment)
- **Frontend**: https://tecinfo.st.infodra.ai
- **Backend API**: https://api.st.infodra.ai
- **Admin Dashboard**: https://tecinfo.st.infodra.ai/admin

## Git Commands

### Push to GitHub
```bash
git add .
git commit -m "Update: Login/Logout terminology changes"
git push origin main
```

### Clone Repository
```bash
git clone https://github.com/Infodra/Stafftracker.git
cd Stafftracker
```

## Pre-Deployment Checklist
- [ ] Update `.env.production` files with MongoDB Atlas URI
- [ ] Verify GCP billing is enabled
- [ ] Configure DNS records for infodra.ai domain
- [ ] Test application locally
- [ ] Commit and push to GitHub
- [ ] Run deployment script or manual deployment
- [ ] Verify SSL certificate provisioning
- [ ] Test production URLs

## Support Resources
- GCP Documentation: https://cloud.google.com/run/docs
- MongoDB Atlas: https://cloud.mongodb.com/
- GitHub Issues: https://github.com/Infodra/Stafftracker/issues
