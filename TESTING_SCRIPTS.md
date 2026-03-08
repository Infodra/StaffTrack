# Multi-Tenant Testing Scripts

## Test Company Registration

### Register Tecinfo Solutions
```powershell
$body = @{
    company_name = "Tecinfo Solutions"
    company_id = "TECINFO"
    admin_email = "admin@tecinfo.com"
    admin_password = "Tecinfo@123"
    admin_name = "Tecinfo Admin"
    office_latitude = 17.385044
    office_longitude = 78.486671
    geofence_radius = 100
    subscription_plan = "enterprise"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register-company" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### Register ABC Corporation
```powershell
$body = @{
    company_name = "ABC Corporation"
    company_id = "ABC"
    admin_email = "admin@abc.com"
    admin_password = "ABC@123456"
    admin_name = "ABC Admin"
    office_latitude = 12.971599
    office_longitude = 77.594566
    geofence_radius = 150
    subscription_plan = "premium"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register-company" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

---

## Test Login with Tenant Headers

### Login to Tecinfo (Development Mode)
```powershell
$body = @{
    email = "admin@tecinfo.com"
    password = "Tecinfo@123"
} | ConvertTo-Json

$headers = @{
    "X-Company-ID" = "TECINFO"
}

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Headers $headers `
    -Body $body

# Save token for subsequent requests
$token = $response.data.token
Write-Host "Login successful! Token: $token"
Write-Host "Company: $($response.data.company.name)"
```

### Login to ABC Corporation
```powershell
$body = @{
    email = "admin@abc.com"
    password = "ABC@123456"
} | ConvertTo-Json

$headers = @{
    "X-Company-ID" = "ABC"
}

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Headers $headers `
    -Body $body

# Save token
$tokenABC = $response.data.token
Write-Host "Login successful! Token: $tokenABC"
Write-Host "Company: $($response.data.company.name)"
```

---

## Test Data Isolation

### Get Tecinfo Employees
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
    "X-Company-ID" = "TECINFO"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/employees" `
    -Method GET `
    -Headers $headers
```

### Get ABC Employees (should be different)
```powershell
$headers = @{
    "Authorization" = "Bearer $tokenABC"
    "X-Company-ID" = "ABC"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/employees" `
    -Method GET `
    -Headers $headers
```

### Test Cross-Tenant Access (should fail)
```powershell
# Try to access ABC data with TECINFO token (should fail or return empty)
$headers = @{
    "Authorization" = "Bearer $token"
    "X-Company-ID" = "ABC"
}

try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/employees" `
        -Method GET `
        -Headers $headers
    Write-Host "WARNING: Cross-tenant access succeeded (should not happen!)"
} catch {
    Write-Host "GOOD: Cross-tenant access blocked as expected"
}
```

---

## Test API Health

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/health" -Method GET
```

---

## View All Companies in Database

```powershell
# Requires MongoDB shell or tools
# Run this in MongoDB shell
```
```javascript
db.companies.find({}, { 
    company_id: 1, 
    company_name: 1, 
    domain: 1, 
    office_location: 1,
    status: 1 
}).pretty()
```

---

## Verify Tenant Middleware

### Test Without Company Header (should use default or fail)
```powershell
$body = @{
    email = "admin@tecinfo.com"
    password = "Tecinfo@123"
} | ConvertTo-Json

# No X-Company-ID header
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

---

## Frontend Testing

### Open Browser with Company Context

1. **Login with Tecinfo:**
   - Go to: http://localhost:3000
   - Email: admin@tecinfo.com
   - Password: Tecinfo@123
   - Verify navbar shows "Tecinfo Solutions"

2. **Logout and Login with ABC:**
   - Logout
   - Email: admin@abc.com
   - Password: ABC@123456
   - Verify navbar shows "ABC Corporation"

3. **Check LocalStorage:**
   ```javascript
   // Open browser console (F12)
   console.log(JSON.parse(localStorage.getItem('user')))
   console.log(JSON.parse(localStorage.getItem('company')))
   ```

---

## Production Testing (After Deployment)

### Test Subdomain Access
```powershell
# Test Tecinfo subdomain
Invoke-RestMethod -Uri "https://api.infodra.ai/health" -Method GET

# Login via subdomain
$body = @{
    email = "admin@tecinfo.com"
    password = "Tecinfo@123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://api.infodra.ai/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body `
    -Headers @{ "Host" = "api.infodra.ai" }
```

### Test Frontend Subdomains
```powershell
# Open in browser:
# https://tecinfo.st.infodra.ai
# https://abc.st.infodra.ai

# Verify different company branding on each
```

---

## Clean Up Test Data

### Delete Test Companies
```javascript
// Run in MongoDB shell
db.companies.deleteOne({ company_id: "TECINFO" })
db.companies.deleteOne({ company_id: "ABC" })

// Clean up associated data
db.employees.deleteMany({ company_id: "TECINFO" })
db.employees.deleteMany({ company_id: "ABC" })
db.attendances.deleteMany({ company_id: "TECINFO" })
db.attendances.deleteMany({ company_id: "ABC" })
```

---

## Expected Results

✅ **Company Registration:** Returns token and company details
✅ **Login with Tenant:** Returns user and company data
✅ **Data Isolation:** Each company only sees their own data
✅ **Cross-Tenant Block:** Cannot access other company's data
✅ **Frontend Branding:** Shows correct company name
✅ **API Health:** Returns 200 OK

---

## Quick Test (All-in-One)

```powershell
# Register and test both companies
Write-Host "=== Registering Tecinfo ==="
$tecinfo = @{
    company_name = "Tecinfo Solutions"
    company_id = "TECINFO"
    admin_email = "admin@tecinfo.com"
    admin_password = "Tecinfo@123"
    admin_name = "Tecinfo Admin"
    office_latitude = 17.385044
    office_longitude = 78.486671
    geofence_radius = 100
} | ConvertTo-Json

$tecinfoResult = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register-company" -Method POST -ContentType "application/json" -Body $tecinfo
Write-Host "Tecinfo Token: $($tecinfoResult.data.token.Substring(0,20))..."

Write-Host "`n=== Registering ABC ==="
$abc = @{
    company_name = "ABC Corporation"
    company_id = "ABC"
    admin_email = "admin@abc.com"
    admin_password = "ABC@123456"
    admin_name = "ABC Admin"
    office_latitude = 12.971599
    office_longitude = 77.594566
    geofence_radius = 150
} | ConvertTo-Json

$abcResult = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register-company" -Method POST -ContentType "application/json" -Body $abc
Write-Host "ABC Token: $($abcResult.data.token.Substring(0,20))..."

Write-Host "`n=== Testing Complete ==="
Write-Host "Companies registered successfully!"
Write-Host "1. Tecinfo: admin@tecinfo.com / Tecinfo@123"
Write-Host "2. ABC: admin@abc.com / ABC@123456"
Write-Host "`nNext: Open http://localhost:3000 and login with either account"
```
