# Git Configuration for Staff Tracker

## Quick Start Commands

### 1. Initialize Git Repository and Push to GitHub

```powershell
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Staff Tracker with Login/Logout features"

# Add GitHub remote
git remote add origin https://github.com/Infodra/Stafftracker.git

# Set main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

### 2. Set Up GCP Deployment

**Option A: Cloud Build (Automatic on Push)**
1. Go to: https://console.cloud.google.com/cloud-build/triggers?project=infodra-ai-platform
2. Click "Connect Repository" → Choose GitHub → Select `Infodra/Stafftracker`
3. Create trigger with `cloudbuild.yaml` configuration
4. Every push to `main` will auto-deploy

**Option B: GitHub Actions**
1. Create service account in GCP
2. Add `GCP_SA_KEY` secret to GitHub repository
3. Add `MONGODB_URI` and `JWT_SECRET` secrets
4. Push code - GitHub Actions will deploy automatically

**Option C: Manual Deployment**
```powershell
# After pushing to GitHub
gcloud run deploy attendance-backend --source=./backend --region=asia-south1
gcloud run deploy attendance-frontend --source=./frontend --region=asia-south1
```

### 3. Daily Workflow

```powershell
# Make changes
git add .
git commit -m "Description of changes"
git push origin main

# Deployment happens automatically (if Cloud Build or Actions configured)
```

## Files Created for Deployment

- ✅ `cloudbuild.yaml` - Cloud Build configuration for GCP
- ✅ `.gcloudignore` - Files to ignore when deploying to GCP
- ✅ `.github/workflows/deploy.yml` - GitHub Actions workflow
- ✅ `GITHUB_DEPLOYMENT_GUIDE.md` - Detailed deployment guide

## Next Steps

1. **Push code to GitHub** (commands above)
2. **Set up environment variables** in GCP Cloud Run
3. **Configure DNS** for custom domains
4. **Set up Load Balancer** (see GCP_DEPLOYMENT_GUIDE.md)

## Important Links

- **GitHub**: https://github.com/Infodra/Stafftracker
- **GCP Console**: https://console.cloud.google.com/welcome?project=infodra-ai-platform
- **Cloud Build**: https://console.cloud.google.com/cloud-build?project=infodra-ai-platform
- **Cloud Run**: https://console.cloud.google.com/run?project=infodra-ai-platform
