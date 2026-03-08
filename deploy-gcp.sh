# Quick Deployment Script for GCP
# Run this after setting up MongoDB Atlas and configuring environment variables

# Configuration
PROJECT_ID="infodra-ai-platform"
REGION="asia-south1"
BACKEND_SERVICE="attendance-backend"
FRONTEND_SERVICE="attendance-frontend"

echo "🚀 Starting GCP Deployment..."

# 1. Set project
echo "📦 Setting GCP project..."
gcloud config set project $PROJECT_ID

# 2. Enable required APIs
echo "🔌 Enabling required APIs..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com \
  compute.googleapis.com \
  dns.googleapis.com

# 3. Deploy Backend
echo "🖥️  Deploying backend to Cloud Run..."
cd backend
gcloud run deploy $BACKEND_SERVICE \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --env-vars-file .env.production \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --min-instances 0

BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE --region $REGION --format='value(status.url)')
echo "✅ Backend deployed at: $BACKEND_URL"

# 4. Deploy Frontend
echo "🎨 Deploying frontend to Cloud Run..."
cd ../frontend

# Update API URL in environment
echo "VITE_API_BASE_URL=$BACKEND_URL/api" > .env.production

gcloud run deploy $FRONTEND_SERVICE \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 256Mi \
  --cpu 1 \
  --max-instances 10 \
  --min-instances 0

FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE --region $REGION --format='value(status.url)')
echo "✅ Frontend deployed at: $FRONTEND_URL"

# 5. Reserve Static IP
echo "🌐 Reserving static IP address..."
gcloud compute addresses create attendance-ip --global 2>/dev/null || echo "IP already exists"

STATIC_IP=$(gcloud compute addresses describe attendance-ip --global --format='value(address)')
echo "✅ Static IP: $STATIC_IP"

# 6. Create NEGs
echo "🔗 Creating Network Endpoint Groups..."
gcloud compute network-endpoint-groups create attendance-backend-neg \
  --region=$REGION \
  --network-endpoint-type=SERVERLESS \
  --cloud-run-service=$BACKEND_SERVICE 2>/dev/null || echo "Backend NEG exists"

gcloud compute network-endpoint-groups create attendance-frontend-neg \
  --region=$REGION \
  --network-endpoint-type=SERVERLESS \
  --cloud-run-service=$FRONTEND_SERVICE 2>/dev/null || echo "Frontend NEG exists"

# 7. Create Backend Services
echo "⚙️  Creating backend services..."
gcloud compute backend-services create attendance-backend-service --global 2>/dev/null || echo "Backend service exists"
gcloud compute backend-services add-backend attendance-backend-service \
  --global \
  --network-endpoint-group=attendance-backend-neg \
  --network-endpoint-group-region=$REGION 2>/dev/null || echo "Backend already added"

gcloud compute backend-services create attendance-frontend-service --global 2>/dev/null || echo "Frontend service exists"
gcloud compute backend-services add-backend attendance-frontend-service \
  --global \
  --network-endpoint-group=attendance-frontend-neg \
  --network-endpoint-group-region=$REGION 2>/dev/null || echo "Frontend already added"

# 8. Create URL Map
echo "🗺️  Creating URL map..."
gcloud compute url-maps create attendance-url-map \
  --default-service=attendance-frontend-service 2>/dev/null || echo "URL map exists"

gcloud compute url-maps add-path-matcher attendance-url-map \
  --path-matcher-name=api-matcher \
  --default-service=attendance-frontend-service \
  --path-rules="/api/*=attendance-backend-service" 2>/dev/null || echo "Path matcher exists"

# 9. Create SSL Certificate
echo "🔒 Creating SSL certificate..."
gcloud compute ssl-certificates create attendance-ssl-cert \
  --domains=tecinfo.st.infodra.ai,www.tecinfo.st.infodra.ai,api.st.infodra.ai \
  --global 2>/dev/null || echo "SSL certificate exists"

# 10. Create HTTPS Proxy
echo "🌐 Creating HTTPS proxy..."
gcloud compute target-https-proxies create attendance-https-proxy \
  --ssl-certificates=attendance-ssl-cert \
  --url-map=attendance-url-map \
  --global 2>/dev/null || echo "HTTPS proxy exists"

# 11. Create Forwarding Rules
echo "📍 Creating forwarding rules..."
gcloud compute forwarding-rules create attendance-https-rule \
  --address=attendance-ip \
  --target-https-proxy=attendance-https-proxy \
  --global \
  --ports=443 2>/dev/null || echo "HTTPS rule exists"

# HTTP to HTTPS redirect
gcloud compute url-maps create attendance-http-redirect \
  --default-url-redirect-response-code=301 \
  --default-url-redirect-https-redirect 2>/dev/null || echo "HTTP redirect map exists"

gcloud compute target-http-proxies create attendance-http-proxy \
  --url-map=attendance-http-redirect \
  --global 2>/dev/null || echo "HTTP proxy exists"

gcloud compute forwarding-rules create attendance-http-rule \
  --address=attendance-ip \
  --target-http-proxy=attendance-http-proxy \
  --global \
  --ports=80 2>/dev/null || echo "HTTP rule exists"

echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "📋 Summary:"
echo "  • Backend URL: $BACKEND_URL"
echo "  • Frontend URL: $FRONTEND_URL"
echo "  • Static IP: $STATIC_IP"
echo ""
echo "⚠️  Next Steps:"
echo "  1. Configure DNS A records:"
echo "     tecinfo.st.infodra.ai  →  $STATIC_IP"
echo "     api.st.infodra.ai      →  $STATIC_IP"
echo ""
echo "  2. Wait for SSL certificate to provision (15-60 minutes)"
echo "     Check status: gcloud compute ssl-certificates describe attendance-ssl-cert --global"
echo ""
echo "  3. Test your application at: https://tecinfo.st.infodra.ai"
echo ""
echo "📖 Full documentation: GCP_DEPLOYMENT_GUIDE.md"
