import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/Form';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { getTenantFromHostname, getCompanyDisplayName } from '../utils/helpers';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Get company name from tenant subdomain
  const tenant = getTenantFromHostname();
  const companyName = tenant ? getCompanyDisplayName(tenant) : 'StaffTrack';

  // Redirect if already logged in
  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    
    const result = await login(email, password);
    
    setLoading(false);
    
    if (result.success) {
      const redirectPath = result.user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
      navigate(redirectPath);
    } else {
      setError(result.message || 'Login failed. Please try again.');
    }
  };

  // Get logo based on tenant
  const getCompanyLogo = () => {
    if (tenant === 'tecinfo') {
      return '/logos/Tecinfo-logo.png';
    }
    // Default logo for other companies
    return '/logos/tecinfo.png';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              src={getCompanyLogo()} 
              alt={`${companyName} Logo`}
              className="h-20 w-auto object-contain"
              onError={(e) => {
                // Fallback to icon if logo not found
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="bg-primary-600 p-3 rounded-xl hidden">
              <MapPin className="text-white" size={28} />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{companyName}</h1>
          <p className="text-sm sm:text-base text-gray-600 font-medium">Employee Attendance System</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Sign in to access your dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Sign In</h2>
          
          {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-4" />}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Demo Credentials:</p>
            <p className="mt-1">Admin: admin@company.com</p>
            <p>Employee: employee@company.com</p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          © 2026 StaffTrack. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
