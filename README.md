# GPS Attendance System - SaaS Platform

A comprehensive, production-ready multi-tenant SaaS GPS Attendance System with modern architecture, featuring a Node.js backend and React frontend.

## 🌟 Project Overview

This is a complete GPS-based attendance tracking system designed for modern businesses. Employees can login and logout using their mobile location, with automatic geofencing validation to ensure they're at the designated office location.

### Key Features

- **Multi-Tenant Architecture**: Separate data isolation for each company
- **GPS Geofencing**: Automatic location validation using Haversine formula
- **Real-time Tracking**: Live attendance monitoring and location logging
- **Role-Based Access**: Admin and Employee portals with different capabilities
- **Modern UI/UX**: Responsive design with Tailwind CSS
- **RESTful API**: Well-documented API endpoints
- **JWT Authentication**: Secure token-based authentication
- **Auto Logout**: Scheduled tasks for missed logouts

## 📁 Project Structure

```
attendance-saas/
├── backend/                    # Node.js/Express API Server
│   ├── src/
│   │   ├── config/            # Database and environment configuration
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Auth, validation, error handling
│   │   ├── models/            # Mongoose schemas
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic (GPS, attendance)
│   │   ├── utils/             # Helper functions
│   │   └── server.js          # Application entry point
│   ├── .env.example          # Environment variable template
│   ├── .gitignore
│   ├── package.json
│   ├── README.md             # Backend documentation
│   ├── SETUP_GUIDE.md        # Backend setup instructions
│   └── API_DOCUMENTATION.md  # API endpoints reference
│
├── frontend/                   # React/Vite Application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── contexts/          # React context providers
│   │   ├── hooks/             # Custom React hooks
│   │   ├── layouts/           # Layout components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API service layer
│   │   ├── utils/             # Utility functions
│   │   ├── App.jsx           # Main app component
│   │   ├── main.jsx          # Application entry point
│   │   └── index.css         # Global styles
│   ├── .env.example          # Environment variable template
│   ├── .gitignore
│   ├── package.json
│   ├── vite.config.js        # Vite configuration
│   ├── tailwind.config.js    # Tailwind CSS configuration
│   ├── README.md             # Frontend documentation
│   └── SETUP_GUIDE.md        # Frontend setup instructions
│
├── haversine-distance.js       # Standalone GPS distance calculator
├── PROJECT_OVERVIEW.md         # Comprehensive project documentation
├── .gitignore                  # Root gitignore
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have installed:
- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd attendance-saas
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   npm run dev
   ```
   
   Backend will run on `http://localhost:5000`
   
   See [backend/README.md](backend/README.md) for detailed instructions.

3. **Setup Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with your backend API URL
   npm run dev
   ```
   
   Frontend will run on `http://localhost:3000`
   
   See [frontend/README.md](frontend/README.md) for detailed instructions.

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express-validator
- **Password Hashing**: Bcrypt
- **Logging**: Morgan
- **CORS**: cors middleware

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **State Management**: React Context API

### GPS & Geolocation
- **Browser API**: Geolocation API
- **Distance Calculation**: Haversine Formula
- **Validation**: Server-side geofence checking

## 📱 Features in Detail

### For Employees
- ✅ GPS-based login/logout
- ✅ View today's attendance status
- ✅ Track working hours
- ✅ View attendance history
- ✅ Real-time distance from office
- ✅ Mobile-responsive interface

### For Admins
- ✅ Dashboard with company statistics
- ✅ Employee management (CRUD operations)
- ✅ View all employees' attendance
- ✅ Generate attendance reports
- ✅ Configure office location and geofence radius
- ✅ Company settings management
- ✅ Employee limit enforcement

### Security Features
- 🔒 JWT-based authentication
- 🔒 Password hashing with bcrypt
- 🔒 Role-based access control
- 🔒 Input validation and sanitization
- 🔒 CORS configuration
- 🔒 Environment variable protection

## 📊 Database Models

- **Company**: Multi-tenant organization data
- **Employee**: User accounts with roles
- **Attendance**: Login/logout records
- **LocationLog**: GPS coordinate history (TTL: 90 days)

## 🌐 API Endpoints

The backend provides RESTful API endpoints for:
- Authentication (`/api/auth`)
- Employee management (`/api/employees`)
- Attendance tracking (`/api/attendance`)
- Company management (`/api/companies`)

See [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md) for complete API reference.

## 🧪 Testing Credentials

After registering a company, you can use these roles:

**Admin User** (created during company registration):
- Email: Set during registration
- Role: admin
- Capabilities: Full system access

**Employee Users** (created by admin):
- Email: Set during employee creation
- Role: employee
- Capabilities: Personal attendance management

## 📦 Deployment

### Backend Deployment
- Deploy to services like Heroku, AWS, DigitalOcean, or Railway
- Set up MongoDB Atlas for production database
- Configure environment variables
- Enable HTTPS

### Frontend Deployment
- Deploy to Vercel, Netlify, or AWS S3 + CloudFront
- Update API endpoint in production `.env`
- Enable HTTPS (required for geolocation)

See individual README files in backend/ and frontend/ for detailed deployment instructions.

## 🔧 Configuration

### Backend Configuration (backend/.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gps-attendance
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=30d
NODE_ENV=development
DEFAULT_GEOFENCE_RADIUS=100
```

### Frontend Configuration (frontend/.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 📖 Documentation

- **Backend API**: [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)
- **Backend Setup**: [backend/SETUP_GUIDE.md](backend/SETUP_GUIDE.md)
- **Frontend Setup**: [frontend/SETUP_GUIDE.md](frontend/SETUP_GUIDE.md)
- **Project Overview**: [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)
- **GPS Utility**: [haversine-distance.js](haversine-distance.js)

## 🤝 Development Workflow

1. Start MongoDB service
2. Run backend in development mode: `cd backend && npm run dev`
3. Run frontend in development mode: `cd frontend && npm run dev`
4. Access application at `http://localhost:3000`
5. Backend API available at `http://localhost:5000/api`

## 📝 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For issues, questions, or contributions:
- Read the documentation in backend/ and frontend/ folders
- Check API_DOCUMENTATION.md for API usage
- Review SETUP_GUIDE.md files for troubleshooting

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Shift management
- [ ] Leave management
- [ ] Overtime tracking
- [ ] WebSocket for real-time updates
- [ ] Email notifications
- [ ] Face recognition (optional security layer)
- [ ] Analytics dashboard
- [ ] Export reports (PDF, Excel)

---

**Built with ❤️ for modern workforce management**

<!-- Deployment test: 03/08/2026 19:01:06 -->
