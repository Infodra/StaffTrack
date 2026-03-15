import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  LogOut, 
  Menu, 
  X,
  MapPin,
  CalendarDays,
  Building2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getTenantFromHostname, getCompanyDisplayName } from '../utils/helpers';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, company, logout, isAdmin, isSuperAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    const role = user?.role;
    logout();
    if (role === 'super_admin') {
      window.location.href = '/login?mode=super';
    } else {
      navigate('/login');
    }
  };

  // Get company name from stored data or tenant subdomain
  const getCompanyName = () => {
    if (company?.name) {
      return company.name;
    }
    
    const tenant = getTenantFromHostname();
    if (tenant) {
      return getCompanyDisplayName(tenant);
    }
    
    return 'StaffTrack';
  };

  const navItems = isSuperAdmin()
    ? [
        { name: 'Platform', path: '/super-admin/dashboard', icon: Building2 },
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Employees', path: '/admin/employees', icon: Users },
        { name: 'Attendance', path: '/admin/attendance', icon: Calendar },
        { name: 'Leave', path: '/admin/leave', icon: CalendarDays },
      ]
    : isAdmin() 
    ? [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Employees', path: '/admin/employees', icon: Users },
        { name: 'Attendance', path: '/admin/attendance', icon: Calendar },
        { name: 'Leave', path: '/admin/leave', icon: CalendarDays },
      ]
    : [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Attendance', path: '/dashboard/attendance', icon: Calendar },
        { name: 'Leave', path: '/dashboard/leave', icon: CalendarDays },
      ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-1.5 rounded-lg shadow-sm">
                <MapPin className="text-white" size={22} />
              </div>
              <span className="ml-2 text-xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">{getCompanyName()}</span>
            </div>
            
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={18} className="mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 hover:text-red-800 hover:bg-red-50 rounded-md"
            >
              <LogOut size={18} className="mr-2" />
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-gray-200">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 text-base font-medium ${
                    isActive
                      ? 'text-primary-600 bg-primary-50 border-l-4 border-primary-600'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} className="mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="px-4 mb-3">
              <p className="text-base font-medium text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <p className="text-xs text-gray-400 capitalize mt-1">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-base font-medium text-red-700 hover:text-red-800 hover:bg-red-50"
            >
              <LogOut size={20} className="mr-3" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
