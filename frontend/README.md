# GPS Attendance System - Frontend

A modern, responsive React frontend for the GPS-based attendance tracking system built with Vite, Tailwind CSS, and React Router.

## Features

### Employee Portal
- ✅ Login with email/password
- ✅ Dashboard with today's attendance status
- ✅ GPS-based check-in/check-out
- ✅ Real-time location verification
- ✅ Working hours tracking
- ✅ Attendance history view

### Admin Portal
- ✅ Comprehensive dashboard with metrics
- ✅ Employee management (CRUD operations)
- ✅ Attendance reports and analytics
- ✅ Company settings management
- ✅ Geofence configuration
- ✅ Real-time statistics

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Modern icon library

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Alert.jsx
│   │   ├── Badge.jsx
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Form.jsx
│   │   ├── Loading.jsx
│   │   ├── Modal.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── StatCard.jsx
│   ├── contexts/         # React contexts
│   │   └── AuthContext.jsx
│   ├── hooks/            # Custom hooks
│   │   ├── useAttendance.js
│   │   └── useGeolocation.js
│   ├── layouts/          # Layout components
│   │   ├── DashboardLayout.jsx
│   │   └── Navbar.jsx
│   ├── pages/            # Page components
│   │   ├── AdminDashboard.jsx
│   │   ├── AttendanceHistory.jsx
│   │   ├── CompanySettings.jsx
│   │   ├── EmployeeDashboard.jsx
│   │   ├── EmployeeManagement.jsx
│   │   └── Login.jsx
│   ├── services/         # API services
│   │   ├── api.js
│   │   └── apiService.js
│   ├── utils/            # Utility functions
│   │   └── helpers.js
│   ├── App.jsx           # Main app component
│   ├── index.css         # Global styles
│   └── main.jsx          # Entry point
├── .env                  # Environment variables
├── .env.example          # Environment template
├── index.html            # HTML template
├── package.json          # Dependencies
├── postcss.config.js     # PostCSS config
├── tailwind.config.js    # Tailwind CSS config
└── vite.config.js        # Vite config
```

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   
   Copy `.env.example` to `.env`:
   ```bash
   # Windows PowerShell
   Copy-Item .env.example .env
   
   # Linux/Mac
   cp .env.example .env
   ```

4. **Update API endpoint in `.env`:**
   ```env
   VITE_API_BASE_URL=https://api.stafftrack.in/api
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

   The app will open at `http://localhost:3000`

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

## Preview Production Build

```bash
npm run preview
```

## Features Breakdown

### Authentication
- JWT-based authentication
- Automatic token management
- Protected routes for authenticated users
- Role-based access control (Admin/Employee)

### GPS Functionality
- Browser Geolocation API integration
- Real-time location capture
- Location permission handling
- Error handling for location failures

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interface
- Hamburger menu for mobile navigation

### UI/UX Features
- Modern SaaS dashboard design
- Loading states and spinners
- Success/error notifications
- Confirmation dialogs
- Form validation
- Search and filter capabilities
- Modal dialogs
- Responsive tables

## API Integration

The frontend communicates with the backend API at:
```
https://api.stafftrack.in/api
```

### Endpoints Used

- `POST /auth/login` - User authentication
- `GET /attendance/today` - Today's attendance status
- `POST /attendance/checkin` - Check in with GPS
- `POST /attendance/checkout` - Check out with GPS
- `GET /attendance/history` - Attendance records
- `GET /employees` - Employee list
- `POST /employees` - Create employee
- `PUT /employees/:id` - Update employee
- `DELETE /employees/:id` - Delete employee
- `GET /company` - Company details
- `PUT /company/settings` - Update settings
- `GET /company/stats` - Company statistics

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

**Note:** Geolocation API requires HTTPS in production.

## Security Features

- Secure token storage in localStorage
- Automatic token injection in API requests
- Automatic logout on 401 responses
- Protected routes with authentication checks
- Role-based access control

## Development Tips

1. **Hot Module Replacement (HMR):** 
   Vite provides instant HMR - changes reflect immediately without full page reload.

2. **Component Development:**
   Use React Developer Tools browser extension for debugging.

3. **API Testing:**
   Test API endpoints independently before integrating with UI.

4. **Responsive Testing:**
   Use browser DevTools to test different screen sizes.

## Troubleshooting

### Location Permission Denied
- Ensure HTTPS is enabled (required for geolocation)
- Check browser location permissions
- Clear browser cache and reload

### API Connection Issues
- Verify API endpoint in `.env`
- Check network connectivity
- Verify backend server is running
- Check CORS configuration on backend

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

## License

ISC
