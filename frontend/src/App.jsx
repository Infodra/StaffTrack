import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeManagement from './pages/EmployeeManagement';
import AttendanceHistory from './pages/AttendanceHistory';
import CompanySettings from './pages/CompanySettings';
import LeavePage from './pages/LeavePage';
import AdminLeaveManagement from './pages/AdminLeaveManagement';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import LandingPage from './pages/LandingPage';
import { getTenantFromHostname } from './utils/helpers';

function App() {
  const tenant = getTenantFromHostname();

  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public Routes - tenant subdomains go straight to login */}
          <Route path="/" element={tenant ? <Navigate to="/login" replace /> : <LandingPage />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Employee Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<EmployeeDashboard />} />
            <Route path="attendance" element={<AttendanceHistory />} />
            <Route path="leave" element={<LeavePage />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="employees" element={<EmployeeManagement />} />
            <Route path="attendance" element={<AttendanceHistory />} />
            <Route path="leave" element={<AdminLeaveManagement />} />
            <Route path="settings" element={<CompanySettings />} />
          </Route>

          {/* Protected Super Admin Routes */}
          <Route
            path="/super-admin"
            element={
              <ProtectedRoute superAdminOnly>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<SuperAdminDashboard />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
