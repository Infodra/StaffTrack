# GCP Deployment Checklist

## Pre-Deployment Setup

### 1. MongoDB Atlas Setup
- [ ] Create MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
- [ ] Create a new cluster (free M0 tier or paid)
- [ ] Create database: `attendance_app`
- [ ] Create database user with read/write permissions
- [ ] Configure network access (allow all IPs: 0.0.0.0/0)
- [ ] Copy connection string

### 2. GCP Account Setup
- [ ] Create/access GCP account at https://console.cloud.google.com
- [ ] Enable billing on your GCP account
- [ ] Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install
- [ ] Login: `gcloud auth login`

### 3. Domain Preparation
- [ ] Access to DNS management for infodra.ai domain
- [ ] Subdomain to use: tecinfo.st.infodra.ai

---

## Configuration Files

### 4. Backend Configuration
- [ ] Copy `backend/.env.production.template` to `backend/.env.production`
- [ ] Fill in MongoDB URI with your Atlas connection string
- [ ] Generate strong JWT_SECRET (32+ characters)
- [ ] Update ALLOWED_ORIGINS with your domain
- [ ] Keep PORT as 8080 (required by Cloud Run)

### 5. Frontend Configuration
- [ ] Copy `frontend/.env.production.template` to `frontend/.env.production`
- [ ] API URL will be updated during deployment

---

## Deployment Steps

### 6. GCP Project Setup
- [ ] Run: `gcloud config set project infodra-ai-platform` (use existing project)
- [ ] Or create new: `gcloud projects create infodra-ai-platform --name="Infodra AI Platform"`
- [ ] Enable billing in GCP Console
- [ ] Run deployment script: `bash deploy-gcp.sh` (or follow manual steps)

### 7. Backend Deployment
- [ ] Navigate to backend directory
- [ ] Run: `gcloud run deploy attendance-backend --source . --region asia-south1`
- [ ] Note the backend URL provided

### 8. Frontend Deployment
- [ ] Update `frontend/.env.production` with backend URL
- [ ] Navigate to frontend directory
- [ ] Run: `gcloud run deploy attendance-frontend --source . --region asia-south1`
- [ ] Note the frontend URL provided

### 9. Load Balancer & SSL Setup
- [ ] Reserve static IP address
- [ ] Create Network Endpoint Groups (NEGs)
- [ ] Create backend services
- [ ] Create URL map with path routing
- [ ] Create SSL certificate
- [ ] Create HTTPS proxy and forwarding rules
- [ ] Create HTTP to HTTPS redirect

### 10. DNS Configuration
- [ ] Get static IP from: `gcloud compute addresses describe attendance-ip --global`
- [ ] Add DNS A records:
  - tecinfo.st.infodra.ai → [STATIC_IP]
  - api.st.infodra.ai → [STATIC_IP]
  - www.tecinfo.st.infodra.ai → [STATIC_IP] (optional CNAME)

### 11. SSL Certificate Provisioning
- [ ] Wait 15-60 minutes for SSL certificate to activate
- [ ] Check status: `gcloud compute ssl-certificates describe attendance-ssl-cert --global`
- [ ] Wait until status shows "ACTIVE"

---

## Post-Deployment

### 12. Initialize Application
- [ ] Access https://tecinfo.st.infodra.ai in browser
- [ ] Create admin account via registration
- [ ] Or use API to create company:
  ```bash
  curl -X POST https://api.st.infodra.ai/api/auth/register-company \
    -H "Content-Type: application/json" \
    -d @company-data.json
  ```

### 13. Testing
- [ ] Login with admin credentials
- [ ] Test employee creation
- [ ] Test login/logout functionality
- [ ] Test from mobile device
- [ ] Verify GPS tracking works
- [ ] Check attendance reports

### 14. Monitoring & Optimization
- [ ] Set up Cloud Monitoring alerts
- [ ] Configure auto-scaling limits
- [ ] Set resource limits (CPU/Memory)
- [ ] Enable logging and error tracking
- [ ] Set up backup schedule for MongoDB Atlas

---

## Security Checklist

### 15. Security Configuration
- [ ] Verify JWT_SECRET is strong and unique
- [ ] Enable MongoDB Atlas IP whitelist (optional)
- [ ] Review IAM permissions in GCP
- [ ] Enable audit logging
- [ ] Configure Cloud Armor (DDoS protection)
- [ ] Set up regular security patches
- [ ] Enable 2FA for admin accounts

---

## Troubleshooting

### Common Issues

**SSL Certificate Not Active**
- Wait up to 60 minutes after DNS configuration
- Verify DNS records are correctly pointing to static IP
- Check: `nslookup tecinfo.st.infodra.ai`

**CORS Errors**
- Verify backend CORS configuration includes your domain
- Check frontend is using correct API URL
- Redeploy backend with updated settings

**Company Not Found**
- Check tenant middleware configuration
- Verify X-Company-ID header in requests
- Ensure company exists in database with correct domain

**Cold Start Delays**
- Set minimum instances to 1 for critical services
- Implement health check warming
- Consider Cloud Scheduler to keep services warm

---

## Estimated Timeline

- MongoDB Atlas Setup: 10-15 minutes
- GCP Project Setup: 10 minutes
- Backend Deployment: 5-10 minutes
- Frontend Deployment: 5-10 minutes
- Load Balancer Setup: 10-15 minutes
- DNS Configuration: 5 minutes
- SSL Certificate Provisioning: 15-60 minutes
- Testing & Verification: 15-30 minutes

**Total**: 1.5 - 3 hours

---

## Monthly Cost Estimate

- Cloud Run (Backend): $0-5 (Free tier covers most small apps)
- Cloud Run (Frontend): $0-3
- Load Balancer: $18-25
- Static IP: $0 (free when in use)
- MongoDB Atlas M0: $0 (Free tier)
- MongoDB Atlas M10: $57/month (Recommended for production)
- Network Egress: ~$0.12/GB

**Total**: $20-90/month depending on usage

---

## Support Resources

- **Full Guide**: GCP_DEPLOYMENT_GUIDE.md
- **GCP Documentation**: https://cloud.google.com/run/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **Cloud Run Pricing**: https://cloud.google.com/run/pricing

---

## Deployment Complete! 🎉

Once all items are checked, your application will be live at:
- **Main App**: https://tecinfo.st.infodra.ai
- **API Endpoint**: https://api.st.infodra.ai

**Next Steps**: Add more employees, configure company settings, and start tracking attendance!
