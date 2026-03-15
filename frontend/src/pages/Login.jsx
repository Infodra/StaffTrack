import { useState, useEffect } from 'react';
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { MapPin, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/Form';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { getTenantFromHostname, getCompanyBranding } from '../utils/helpers';
import { authService } from '../services/apiService';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');
  
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSuperMode = searchParams.get('mode') === 'super';

  // Get branding based on tenant subdomain
  const tenant = getTenantFromHostname();
  const [branding, setBranding] = useState(
    isSuperMode
      ? { name: 'StaffTrack', subtitle: 'by Infodra Technologies', logo: '/logos/infodra.png', tagline: 'Super Admin Login' }
      : getCompanyBranding(tenant)
  );

  // Fetch company branding from API if tenant exists
  useEffect(() => {
    if (tenant) {
      axios.get(`${API_BASE_URL}/company/branding/${tenant}`)
        .then(res => {
          if (res.data?.success && res.data.data) {
            const data = res.data.data;
            setBranding(prev => ({
              ...prev,
              name: data.name || prev.name,
              logo: data.logo || prev.logo,
            }));
          }
        })
        .catch(() => {
          // Keep fallback branding from helpers
        });
    }
  }, [tenant]);

  // Redirect if already logged in
  if (user) {
    if (user.role === 'super_admin') return <Navigate to="/super-admin/dashboard" replace />;
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
      let redirectPath = '/dashboard';
      if (result.user.role === 'super_admin') redirectPath = '/super-admin/dashboard';
      else if (result.user.role === 'admin') redirectPath = '/admin/dashboard';
      navigate(redirectPath);
    } else {
      setError(result.message || 'Login failed. Please try again.');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotMessage('');

    if (!forgotEmail) {
      setForgotError('Please enter your email address');
      return;
    }

    setForgotLoading(true);
    try {
      const response = await authService.forgotPassword(forgotEmail);
      setForgotMessage(response.message || 'A new password has been sent to your email.');
      setForgotEmail('');
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
    setForgotLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center mb-4">
            {branding.logo ? (
              <img 
                src={branding.logo} 
                alt={`${branding.name} Logo`}
                className="h-20 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`bg-primary-600 p-3 rounded-xl ${branding.logo ? 'hidden' : 'flex'}`}>
              <MapPin className="text-white" size={28} />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">{branding.name}</h1>
          <p className="text-sm sm:text-base text-indigo-500 font-semibold">{branding.subtitle}</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">{branding.tagline}</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          {!showForgotPassword ? (
            <>
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

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => { setShowForgotPassword(true); setForgotError(''); setForgotMessage(''); }}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Forgot Password?
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => { setShowForgotPassword(false); setForgotError(''); setForgotMessage(''); }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Forgot Password</h2>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Enter your registered email address. A new password will be sent to your email.
              </p>

              {forgotError && <Alert type="error" message={forgotError} onClose={() => setForgotError('')} className="mb-4" />}
              {forgotMessage && <Alert type="success" message={forgotMessage} onClose={() => setForgotMessage('')} className="mb-4" />}

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@company.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  loading={forgotLoading}
                >
                  Send New Password
                </Button>
              </form>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => { setShowForgotPassword(false); setForgotError(''); setForgotMessage(''); }}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Back to Sign In
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          © 2026 StaffTrack. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
