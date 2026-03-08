# Frontend Quick Start Guide

## Installation

1. **Navigate to the frontend directory:**
   ```powershell
   cd frontend
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

3. **Start the development server:**
   ```powershell
   npm run dev
   ```

   The application will start at: `http://localhost:3000`

## Demo Login Credentials

Once the backend is running, you can use these credentials to test the application.

If you've set up the backend with test data, use those credentials. Otherwise, first register a company using the backend API:

```powershell
# Example registration (you can use Postman or curl)
curl -X POST http://localhost:5000/api/auth/register-company -H "Content-Type: application/json" -d "{\"company_name\":\"Test Company\",\"admin_email\":\"admin@test.com\",\"admin_password\":\"password123\",\"admin_name\":\"Admin User\",\"office_latitude\":37.7749,\"office_longitude\":-122.4194}"
```

Then login with:
- **Admin:** admin@test.com / password123

## Project Structure Overview

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── contexts/        # React Context (Auth)
│   ├── hooks/           # Custom hooks (GPS, Attendance)
│   ├── layouts/         # Layout components (Navbar, Dashboard)
│   ├── pages/           # All page components
│   ├── services/        # API service layer
│   ├── utils/           # Helper functions
│   ├── App.jsx          # Main app with routing
│   └── main.jsx         # Entry point
```

## Key Features to Test

### Employee View
1. **Login** as an employee
2. **Dashboard** - View today's attendance status
3. **Check In** - Click "Check In" button (allow location access)
4. **Check Out** - After checking in, click "Check Out"
5. **Attendance History** - View past attendance records

### Admin View
1. **Login** as admin
2. **Dashboard** - View company metrics and statistics
3. **Employee Management** - Add, edit, delete employees
4. **Attendance Reports** - View team attendance with filters
5. **Company Settings** - Update office location and geofence

## GPS Location Testing

The app uses your browser's Geolocation API. When you click "Check In" or "Check Out":

1. Browser will request location permission
2. Click "Allow" to grant permission
3. Your GPS coordinates will be sent to the backend
4. Backend will verify if you're within the office geofence

**Testing Tips:**
- Use Chrome DevTools to simulate different locations:
  1. Open DevTools (F12)
  2. Click the three dots menu
  3. More tools → Sensors
  4. Select a location or enter custom coordinates

## Building for Production

```powershell
npm run build
```

This creates an optimized build in the `dist/` folder ready for deployment.

## Preview Production Build

```powershell
npm run preview
```

## Environment Variables

The app uses environment variables from `.env`:

```env
VITE_API_BASE_URL=https://api.stafftrack.in/api
```

For local development with the backend running on localhost:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Troubleshooting

### Location Permission Issues
- Enable location services in your browser
- Allow location access when prompted
- For Chrome: Settings → Privacy and security → Site Settings → Location

### API Connection Issues
- Ensure backend is running
- Verify API URL in `.env` file
- Check browser console for errors

### Port Already in Use
If port 3000 is already in use, Vite will automatically use the next available port.

## Mobile Testing

The app is fully responsive. To test on mobile:

1. **Local Network Testing:**
   ```powershell
   npm run dev -- --host
   ```
   Then access via `http://YOUR_IP:3000` on your mobile device

2. **Responsive Design Testing:**
   - Use browser DevTools (F12)
   - Toggle device toolbar (Ctrl+Shift+M)
   - Test different device sizes

## Component Library

The app includes reusable components:

- **Card** - Container component
- **Button** - Primary, secondary, danger variants
- **Input/Select** - Form inputs with validation
- **Modal** - Dialog component
- **Alert** - Success/error messages
- **Badge** - Status indicators
- **StatCard** - Metric display cards
- **Loading** - Loading spinners

Use these components throughout the app for consistency.

## Next Steps

1. ✅ Complete backend setup (if not done)
2. ✅ Install frontend dependencies
3. ✅ Configure `.env` file
4. ✅ Start development server
5. ✅ Test login and navigation
6. ✅ Test GPS check-in/check-out
7. ✅ Test admin features
8. 🚀 Deploy to production

## Support

For issues or questions:
- Check README.md for detailed documentation
- Review backend API_DOCUMENTATION.md
- Check browser console for errors
- Verify backend is running and accessible
