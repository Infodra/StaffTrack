# 🚀 Next Steps: Push to GitHub and Deploy to GCP

## ✅ Completed Setup

- ✅ Git repository initialized
- ✅ Initial commit created (116 files)
- ✅ GitHub remote configured: https://github.com/Infodra/Stafftracker
- ✅ Branch renamed to `main`
- ✅ Deployment files created:
  - cloudbuild.yaml (GCP Cloud Build)
  - .github/workflows/deploy.yml (GitHub Actions)
  - Dockerfile (Backend & Frontend)
  - .gcloudignore

---

## 📤 Step 1: Push to GitHub

You have two options for authentication:

### Option A: Using GitHub Personal Access Token (PAT)

1. **Create a Personal Access Token**:
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Select scopes: `repo` (full control of private repositories)
   - Click "Generate token"
   - **Copy the token immediately** (you won't see it again)

2. **Push with Token**:
   ```powershell
   git push -u origin main
   ```
   - When prompted for username: enter your GitHub username
   - When prompted for password: **paste your Personal Access Token** (not your GitHub password)

### Option B: Using GitHub CLI (Recommended)

```powershell
# Install GitHub CLI (if not installed)
winget install GitHub.cli

# Authenticate
gh auth login

# Follow prompts to authenticate via browser

# Push code
git push -u origin main
```

---

## ☁️ Step 2: Deploy to GCP via Cloud Build (Automatic)

### 2.1 Connect GitHub to Cloud Build

1. **Open Cloud Build Triggers**:
   - Go to: https://console.cloud.google.com/cloud-build/triggers?project=infodra-ai-platform

2. **Connect Repository**:
   - Click **"Connect Repository"**
   - Select **"GitHub"**
   - Click **"Authenticate"** and authorize Cloud Build
   - Select repository: **`Infodra/Stafftracker`**
   - Click **"Connect"**

3. **Create Build Trigger**:
   - Click **"Create Trigger"**
   - **Name**: `auto-deploy-main`
   - **Description**: Auto-deploy on push to main branch
   - **Event**: Push to a branch
   - **Source**: 
     - Repository: `Infodra/Stafftracker`
     - Branch: `^main$`
   - **Configuration**: Cloud Build configuration file
   - **Location**: `/cloudbuild.yaml`
   - Click **"Create"**

### 2.2 Test Deployment

```powershell
# Make a small change to test
echo "Test deployment" >> README.md

# Commit and push
git add .
git commit -m "Test: Trigger automatic deployment"
git push origin main

# Watch deployment in Cloud Build
# Go to: https://console.cloud.google.com/cloud-build/builds?project=infodra-ai-platform
```

---

## 🔐 Step 3: Configure Environment Variables

After first deployment, set environment variables:

```powershell
# Set GCP project
gcloud config set project infodra-ai-platform

# Update Backend environment variables
gcloud run services update attendance-backend \
  --region=asia-south1 \
  --update-env-vars="MONGODB_URI=your_mongodb_connection_string,JWT_SECRET=your_super_secret_jwt_key_min_32_chars,NODE_ENV=production,ALLOWED_ORIGINS=https://tecinfo.st.infodra.ai,BASE_DOMAIN=st.infodra.ai,PORT=8080"

# Update Frontend environment variables
gcloud run services update attendance-frontend \
  --region=asia-south1 \
  --update-env-vars="VITE_API_BASE_URL=https://api.st.infodra.ai"
```

---

## 🌐 Step 4: Configure Custom Domain (Load Balancer)

### 4.1 Reserve Static IP

```powershell
gcloud compute addresses create attendance-ip --global

# Get the IP address
gcloud compute addresses describe attendance-ip --global --format="get(address)"
```

### 4.2 Configure DNS

Add A records in your DNS provider (infodra.ai):
- `tecinfo.st.infodra.ai` → [Static IP from above]
- `api.st.infodra.ai` → [Static IP from above]

### 4.3 Set Up Load Balancer

Follow detailed steps in [GITHUB_DEPLOYMENT_GUIDE.md](GITHUB_DEPLOYMENT_GUIDE.md) or use the commands below:

```powershell
# Create Network Endpoint Groups
gcloud compute network-endpoint-groups create attendance-backend-neg \
  --region=asia-south1 \
  --network-endpoint-type=serverless \
  --cloud-run-service=attendance-backend

gcloud compute network-endpoint-groups create attendance-frontend-neg \
  --region=asia-south1 \
  --network-endpoint-type=serverless \
  --cloud-run-service=attendance-frontend

# Create backend services
gcloud compute backend-services create attendance-backend-service \
  --global

gcloud compute backend-services create attendance-frontend-service \
  --global

# Add NEGs to backend services
gcloud compute backend-services add-backend attendance-backend-service \
  --global \
  --network-endpoint-group=attendance-backend-neg \
  --network-endpoint-group-region=asia-south1

gcloud compute backend-services add-backend attendance-frontend-service \
  --global \
  --network-endpoint-group=attendance-frontend-neg \
  --network-endpoint-group-region=asia-south1

# Create URL map
gcloud compute url-maps create attendance-lb \
  --default-service=attendance-frontend-service

gcloud compute url-maps add-path-matcher attendance-lb \
  --path-matcher-name=api-matcher \
  --default-service=attendance-frontend-service \
  --path-rules="/api/*=attendance-backend-service"

# Create SSL certificate
gcloud compute ssl-certificates create attendance-ssl \
  --domains=tecinfo.st.infodra.ai,api.st.infodra.ai \
  --global

# Create HTTPS proxy
gcloud compute target-https-proxies create attendance-https-proxy \
  --ssl-certificates=attendance-ssl \
  --url-map=attendance-lb

# Create forwarding rule
gcloud compute forwarding-rules create attendance-https-rule \
  --address=attendance-ip \
  --target-https-proxy=attendance-https-proxy \
  --global \
  --ports=443
```

---

## 📊 Step 5: Monitor Deployment

### View Cloud Build Status
- Console: https://console.cloud.google.com/cloud-build/builds?project=infodra-ai-platform
- CLI: `gcloud builds list --limit=5`

### View Cloud Run Services
- Console: https://console.cloud.google.com/run?project=infodra-ai-platform
- CLI: `gcloud run services list --region=asia-south1`

### View Logs
```powershell
# Backend logs
gcloud run services logs read attendance-backend --region=asia-south1 --limit=50

# Frontend logs
gcloud run services logs read attendance-frontend --region=asia-south1 --limit=50

# Build logs
gcloud builds log [BUILD_ID]
```

---

## 🔄 Daily Workflow

After initial setup, your workflow is simple:

```powershell
# 1. Make changes to code
# 2. Test locally

# 3. Commit changes
git add .
git commit -m "Description of changes"

# 4. Push to GitHub
git push origin main

# 5. Cloud Build automatically deploys!
# Watch progress at: https://console.cloud.google.com/cloud-build/builds?project=infodra-ai-platform

# 6. Verify deployment
# Frontend: https://tecinfo.st.infodra.ai
# Backend: https://api.st.infodra.ai/health
```

---

## 🗂️ Repository Structure

```
Stafftracker/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions (alternative to Cloud Build)
├── backend/
│   ├── Dockerfile             # Backend container
│   ├── src/                   # Backend source code
│   └── package.json
├── frontend/
│   ├── Dockerfile             # Frontend container
│   ├── nginx.conf            # Nginx config for SPA
│   ├── src/                  # Frontend source code
│   └── package.json
├── cloudbuild.yaml           # Cloud Build configuration
├── .gcloudignore            # Files to ignore in GCP
└── GITHUB_DEPLOYMENT_GUIDE.md # Detailed guide
```

---

## 🆘 Troubleshooting

### Push Failed
```powershell
# If authentication fails, use Personal Access Token
# Generate at: https://github.com/settings/tokens

# Or use GitHub CLI
gh auth login
git push origin main
```

### Build Failed
- Check Cloud Build logs: https://console.cloud.google.com/cloud-build/builds?project=infodra-ai-platform
- Verify Dockerfile syntax
- Ensure package.json has all dependencies

### Deployment Failed
```powershell
# Check service status
gcloud run services describe attendance-backend --region=asia-south1
gcloud run services describe attendance-frontend --region=asia-south1

# View error logs
gcloud run services logs read attendance-backend --region=asia-south1
```

---

## 📚 Documentation References

- **[GITHUB_DEPLOYMENT_GUIDE.md](GITHUB_DEPLOYMENT_GUIDE.md)** - Complete deployment guide
- **[GCP_DEPLOYMENT_GUIDE.md](GCP_DEPLOYMENT_GUIDE.md)** - Manual GCP deployment steps
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Step-by-step checklist
- **[GIT_SETUP.md](GIT_SETUP.md)** - Quick Git commands reference

---

## 🎯 Success Checklist

- [ ] Code pushed to GitHub
- [ ] Cloud Build trigger created
- [ ] First deployment successful
- [ ] Environment variables configured
- [ ] Static IP reserved
- [ ] DNS records configured
- [ ] SSL certificate created
- [ ] Load Balancer configured
- [ ] Custom domains working (https://tecinfo.st.infodra.ai)
- [ ] Backend API accessible (https://api.st.infodra.ai/health)

---

## 📞 Support Links

- **GitHub Repository**: https://github.com/Infodra/Stafftracker
- **GCP Console**: https://console.cloud.google.com/welcome?project=infodra-ai-platform
- **Cloud Build**: https://console.cloud.google.com/cloud-build?project=infodra-ai-platform
- **Cloud Run**: https://console.cloud.google.com/run?project=infodra-ai-platform
- **Cloud DNS**: https://console.cloud.google.com/net-services/dns?project=infodra-ai-platform

---

**Ready to push?** Run this command:

```powershell
git push -u origin main
```

Then follow the authentication prompts!
