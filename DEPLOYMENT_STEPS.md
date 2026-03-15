# StaffTrack — Step-by-Step Deployment Guide

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    MongoDB Atlas                         │
│           Single DB: gps_attendance                      │
│   All companies share one DB, isolated by company_id     │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              Render (Single Web Service)                  │
│            stafftrack-api.onrender.com                    │
│    Backend handles ALL companies via X-Company-ID         │
└──────────────────────┬──────────────────────────────────┘
                       │ API calls
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
┌────────────┐  ┌────────────┐  ┌────────────┐
│  Vercel    │  │  Vercel    │  │  Vercel    │
│ (Single    │  │ Wildcard   │  │ Auto-      │
│ Deployment)│  │ subdomain  │  │ detected)  │
│ stafftrack │  │ tecinfo.   │  │ newco.     │
│ .infodra.ai│  │ stafftrack │  │ stafftrack │
│ (SuperAdm) │  │ .infodra.ai│  │ .infodra.ai│
└────────────┘  └────────────┘  └────────────┘
        ↑ All served by ONE Vercel deployment
```

---

## Prerequisites

| Item | Details |
|------|---------|
| **GitHub Repo** | `https://github.com/Infodra/Stafftracker.git` |
| **MongoDB Atlas** | Cluster: `infodra.mhgyzyc.mongodb.net` / DB: `gps_attendance` |
| **Render Account** | https://dashboard.render.com (free tier works) |
| **Vercel Account** | https://vercel.com (free tier works) |
| **Domain** | `infodra.ai` with DNS access |
| **Super Admin** | `admin@infodra.ai` / `Admin@123` |

---

## STEP 1: Push Latest Code to GitHub

```powershell
cd "c:\Users\VijayalakshmiChandra\OneDrive - Infodra Technologies Private Limited\Documents\Clients\Tecinfo\Attendance"

git add .
git commit -m "feat: multi-tenant super admin + dynamic branding + deployment config"
git push origin main
```

---

## STEP 2: Deploy Backend on Render

### 2.1 — Create Web Service
1. Go to **https://dashboard.render.com**
2. Click **New +** → **Web Service**
3. Connect GitHub repo: **Infodra/Stafftracker**

### 2.2 — Configure Service Settings

| Setting | Value |
|---------|-------|
| **Name** | `stafftrack-api` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Region** | `Singapore` |
| **Build Command** | `npm ci` |
| **Start Command** | `node src/server.js` |
| **Plan** | Free (or Starter for no cold starts) |

### 2.3 — Add Environment Variables

In Render dashboard → **Environment** tab, add:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `8080` |
| `MONGODB_URI` | `mongodb+srv://Dev:Testing123@infodra.mhgyzyc.mongodb.net/gps_attendance?retryWrites=true&w=majority&appName=Infodra` |
| `JWT_SECRET` | `EqdszbCcjSv5ZUgGrDYy1VwFeoipf2aTMlI0X7kxB4869htPHKuLnJ3RWQAmNO` |
| `JWT_EXPIRE` | `7d` |

### 2.4 — Deploy & Verify
1. Click **Deploy** and wait for build to complete
2. Your backend URL will be: **`https://stafftrack-api.onrender.com`**
3. Verify: Visit `https://stafftrack-api.onrender.com/health`
   - Should return: `{"success": true, "message": "Server is running"}`

> **Note:** On Render free tier, the service sleeps after 15 minutes of inactivity. First request after sleep takes ~30 seconds to cold start.

---

## STEP 3: Deploy Frontend on Vercel (Single Deployment)

### 3.1 — Import Project
1. Go to **https://vercel.com** → **Add New Project**
2. Import GitHub repo: **Infodra/Stafftracker**

### 3.2 — Configure Build Settings

| Setting | Value |
|---------|-------|
| **Root Directory** | `frontend` |
| **Framework Preset** | `Vite` (auto-detected) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### 3.3 — Add Environment Variable

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://stafftrack-api.onrender.com/api` |

> **Important:** `VITE_` prefix is required — Vite only exposes env vars with this prefix to the frontend.

### 3.4 — Deploy
1. Click **Deploy**
2. Vercel will give you a preview URL like: `stafftracker-xxxxx.vercel.app`
3. Verify the app loads at that URL

---

## STEP 4: Set Up Custom Domains in Vercel

### 4.1 — Add Domains
In your Vercel project → **Settings** → **Domains**, add two domains:

| Domain | Purpose |
|--------|---------|
| `stafftrack.infodra.ai` | Infodra super admin login |
| `*.stafftrack.infodra.ai` | All company subdomains (wildcard) |

### 4.2 — Vercel will show required DNS records
After adding each domain, Vercel displays the DNS records you need to create. Note them down for Step 5.

---

## STEP 5: Configure DNS Records

Go to your DNS provider for `infodra.ai` (GoDaddy, Cloudflare, Namecheap, etc.) and add:

| Type | Name/Host | Value/Target | TTL |
|------|-----------|-------------- |-----|
| `CNAME` | `stafftrack` | `cname.vercel-dns.com` | Auto |
| `CNAME` | `*.stafftrack` | `cname.vercel-dns.com` | Auto |

> **Wait 5–10 minutes** for DNS propagation. You can check status at https://dnschecker.org

---

## STEP 6: Verify Live Deployment

### Test each URL:

| URL | Expected Result |
|-----|-----------------|
| `https://stafftrack-api.onrender.com/health` | `{"success": true}` — backend running |
| `https://stafftrack.infodra.ai` | Infodra/StaffTrack super admin login page |
| `https://tecinfo.stafftrack.infodra.ai` | Tecinfo branded login page (logo + name from DB) |

### Test login:

| URL | Email | Password | Role |
|-----|-------|----------|------|
| `stafftrack.infodra.ai` | `admin@infodra.ai` | `Admin@123` | Super Admin |
| `tecinfo.stafftrack.infodra.ai` | `info@tecinfoes.com` | (the admin password) | Admin |

---

## STEP 7: Adding a New Company (Ongoing)

This is what you do every time a new client signs up:

1. Login at **`stafftrack.infodra.ai`** with super admin credentials
2. Click **Add Company** in the dashboard
3. Fill in:
   - Company Name (e.g., `Acme Corp`)
   - Company ID (auto-generated, e.g., `ACMECORP`)
   - Admin Name, Email, Password
   - Office Latitude & Longitude
   - Geofence Radius
   - Company Logo URL (optional)
   - Domain auto-generates as `acmecorp.stafftrack.infodra.ai`
4. Click **Create Company**
5. **Done!** — The wildcard DNS already covers it. No additional DNS, Vercel, or Render config needed.
6. The new company admin can immediately login at `acmecorp.stafftrack.infodra.ai`

---

## How the Database Works

**Single database, multi-tenant isolation** — you do NOT need separate databases per company.

```
MongoDB Atlas
└── gps_attendance (database)
    ├── companies      → { company_id: 'TEC001', company_name: 'Tecinfo', ... }
    ├── employees      → { company_id: 'TEC001', name: 'John', ... }
    ├── attendances    → { company_id: 'TEC001', date: '2026-03-15', ... }
    ├── leaves         → { company_id: 'TEC001', type: 'casual', ... }
    └── locationlogs   → { company_id: 'TEC001', latitude: 13.08, ... }
```

- Every document has a `company_id` field
- The tenant middleware extracts company from subdomain/header
- All queries automatically filter by `company_id`
- Data is fully isolated — Tecinfo can never see Acme Corp's data

---

## How Tenant Routing Works

```
User visits: tecinfo.stafftrack.infodra.ai
     │
     ▼
Frontend extracts subdomain: "tecinfo"
     │
     ▼
Fetches branding: GET /api/company/branding/tecinfo (public, no auth)
     │ → Returns: { name: "Tecinfo", logo: "/logos/Tecinfo-logo.png" }
     ▼
Shows Tecinfo-branded login page
     │
     ▼
User logs in → API call with header: X-Company-ID: TECINFO
     │
     ▼
Backend tenant middleware finds Company with company_id: "TECINFO"
     │
     ▼
All subsequent API calls scoped to TECINFO data only
```

---

## Key URLs Summary

| Service | URL |
|---------|-----|
| **Backend API** | `https://stafftrack-api.onrender.com` |
| **Backend Health** | `https://stafftrack-api.onrender.com/health` |
| **Super Admin Login** | `https://stafftrack.infodra.ai` |
| **Tecinfo Login** | `https://tecinfo.stafftrack.infodra.ai` |
| **Any Company Login** | `https://{company_id}.stafftrack.infodra.ai` |
| **GitHub Repo** | `https://github.com/Infodra/Stafftracker` |
| **MongoDB Atlas** | `https://cloud.mongodb.com` (cluster: infodra) |
| **Render Dashboard** | `https://dashboard.render.com` |
| **Vercel Dashboard** | `https://vercel.com/dashboard` |

---

## Troubleshooting

### Backend not responding
- Check Render logs at dashboard.render.com → your service → Logs
- Verify MONGODB_URI is correct (use `mongodb+srv://` format for production)
- Free tier sleeps after 15 min — first request takes ~30s

### Login fails with "Network Error"
- Check browser console for CORS errors
- Verify `VITE_API_BASE_URL` env var in Vercel matches Render URL exactly
- Ensure backend CORS allows `.vercel.app` and `.infodra.ai` origins

### Subdomain shows wrong branding
- Check company `logo` field in MongoDB (set via super admin dashboard)
- The login page fetches `GET /api/company/branding/{tenant}` — test this endpoint directly
- Clear browser cache / hard refresh (Ctrl+Shift+R)

### DNS not resolving
- Verify CNAME records at your DNS provider
- Wait 10+ minutes for propagation
- Test with: `nslookup tecinfo.stafftrack.infodra.ai`

### New company login page shows generic branding
- Ensure the company was created with a logo URL in the super admin dashboard
- Edit the company and add a logo URL if missing

---

## Updating the App

After making code changes:

```powershell
git add .
git commit -m "description of changes"
git push origin main
```

- **Render** auto-deploys on push (if auto-deploy is enabled)
- **Vercel** auto-deploys on push (enabled by default)
- Both rebuild and redeploy within 1–3 minutes

---

## Credentials Reference

| Service | Credentials |
|---------|-------------|
| **MongoDB Atlas** | User: `Dev` / Pass: `Testing123` |
| **Super Admin** | `admin@infodra.ai` / `Admin@123` |
| **Tecinfo Admin** | `info@tecinfoes.com` / (set during creation) |

> **Security Note:** Change these credentials before going live in production. Update `JWT_SECRET` to a new random string and update MongoDB password in Atlas dashboard + Render env vars.
