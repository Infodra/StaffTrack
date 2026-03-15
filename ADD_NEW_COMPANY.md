# Adding a New Company to StaffTrack

Follow these steps each time you onboard a new company.

---

## Step 1: Create the Company in Super Admin Dashboard

1. Go to **https://stafftrack.infodra.ai/login?mode=super**
2. Login with `connect@infodra.ai` / `Admin@123`
3. Click **"+ Add Company"**
4. Fill in the form:
   - **Company Name** — e.g., `ABC Corp`
   - **Company ID** — e.g., `ABCCORP` (auto-generated if left empty)
   - **Admin Name** — Company admin's full name
   - **Admin Email** — Company admin's email
   - **Admin Password** — Initial password (min 6 chars)
   - **Domain** — e.g., `abccorp.stafftrack.infodra.ai` (auto-generated from Company ID if left empty)
   - **Company Logo URL** — e.g., `/logos/abccorp-logo.png`
   - **Office Latitude / Longitude** — GPS coordinates of the office
   - **Geofence Radius** — In meters (default: 100)
   - **Employee Limit** — Max employees allowed
   - **License Type** — `lifetime`, `annual`, or `monthly`
5. Click **Submit**

> **Note:** The subdomain in the Domain field (e.g., `abccorp`) is what users will use to access the app.

---

## Step 2: Upload Company Logo (Optional)

1. Add the company logo file to `frontend/public/logos/` (e.g., `abccorp-logo.png`)
2. Commit and push to GitHub — Vercel will auto-deploy

---

## Step 3: Add DNS Record in Wix

1. Go to your **Wix DNS** settings for `infodra.ai`
2. Add a new **CNAME** record:

   | Type  | Name                  | Value                  | TTL    |
   |-------|-----------------------|------------------------|--------|
   | CNAME | `abccorp.stafftrack`  | `cname.vercel-dns.com` | 1 Hour |

3. Save and wait a few minutes for DNS propagation

---

## Step 4: Add Domain in Vercel

1. Go to **Vercel** → Project **staff-track** → **Settings** → **Domains**
2. Add domain: `abccorp.stafftrack.infodra.ai`
3. Set it to **"Connect to an environment" → Production**
4. Wait for Vercel to verify and issue SSL certificate (usually instant)

---

## Step 5: Verify

1. Open `https://abccorp.stafftrack.infodra.ai` in your browser
2. It should redirect to the login page with the company name and logo
3. Login with the admin credentials you set in Step 1

---

## Quick Checklist

- [ ] Company created in Super Admin Dashboard
- [ ] Logo uploaded to `frontend/public/logos/` (if applicable)
- [ ] CNAME record added in Wix DNS: `{subdomain}.stafftrack` → `cname.vercel-dns.com`
- [ ] Domain added in Vercel: `{subdomain}.stafftrack.infodra.ai`
- [ ] Verified login page loads at `https://{subdomain}.stafftrack.infodra.ai`

---

## Example: Adding "XYZ Solutions"

| Field           | Value                                |
|-----------------|--------------------------------------|
| Company Name    | XYZ Solutions                        |
| Company ID      | XYZSOL                               |
| Domain          | xyzsol.stafftrack.infodra.ai         |
| DNS CNAME Name  | xyzsol.stafftrack                    |
| DNS CNAME Value | cname.vercel-dns.com                 |
| Vercel Domain   | xyzsol.stafftrack.infodra.ai         |
| Logo Path       | /logos/xyzsol-logo.png               |
| Access URL      | https://xyzsol.stafftrack.infodra.ai |
