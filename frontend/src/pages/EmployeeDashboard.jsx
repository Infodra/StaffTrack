import { useState, useEffect } from 'react';
import { User, Briefcase, Shield } from 'lucide-react';
import { Card } from '../components/Card';
import { Alert } from '../components/Alert';
import { Badge } from '../components/Badge';
import GreetingHeader from '../components/GreetingHeader';
import AttendanceStatus from '../components/AttendanceStatus';
import LoginCard from '../components/LoginCard';
import LogoutCard from '../components/LogoutCard';
import WorkingHoursCard from '../components/WorkingHoursCard';
import RecentAttendanceTable from '../components/RecentAttendanceTable';
import { useAuth } from '../contexts/AuthContext';
import { useAttendance } from '../hooks/useAttendance';
import { attendanceService } from '../services/apiService';

const EmployeeDashboard = () => {
  const { user, company } = useAuth();
  const { login, logout, loading } = useAttendance();
  const [todayStatus, setTodayStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchTodayStatus = async () => {
    try {
      const response = await attendanceService.getTodayStatus();
      if (response.success) {
        setTodayStatus(response.data);
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayStatus();
  }, []);

  const handleLogin = async (position) => {
    setMessage({ type: '', text: '' });
    const coords = position ? {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy
    } : null;
    const result = await login(coords);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Logged in successfully! 🎉' });
      await fetchTodayStatus();
      return result;
    } else {
      setMessage({ type: 'error', text: result.message });
      return result;
    }
  };

  const handleLogout = async (position) => {
    setMessage({ type: '', text: '' });
    const coords = position ? {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy
    } : null;
    const result = await logout(coords);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Logged out successfully! Have a great day! 🎉' });
      await fetchTodayStatus();
      return result;
    } else {
      setMessage({ type: 'error', text: result.message });
      return result;
    }
  };

  // Determine attendance status
  const getAttendanceStatus = () => {
    if (!todayStatus) return 'not-checked-in';
    if (todayStatus.status === 'checked-in') return 'checked-in';
    if (todayStatus.status === 'checked-out') return 'checked-out';
    return 'not-checked-in';
  };

  const attendanceStatus = getAttendanceStatus();
  const isCheckedOut = todayStatus?.status === 'checked-out';

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6">
      {/* Greeting Header with Date and Clock */}
      <GreetingHeader user={user} company={company} />

      {/* Alert Messages */}
      {message.text && (
        <Alert 
          type={message.type} 
          message={message.text} 
          onClose={() => setMessage({ type: '', text: '' })} 
        />
      )}

      {/* Attendance Status Badge */}
      <div className="flex justify-center py-4">
        <AttendanceStatus status={attendanceStatus} />
      </div>

      {/* Working Hours Summary Cards */}
      <WorkingHoursCard todayStatus={todayStatus} loading={statusLoading} />

      {/* Login and Logout Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LoginCard 
          onLogin={handleLogin} 
          loading={loading} 
          todayStatus={todayStatus}
        />
        <LogoutCard 
          onLogout={handleLogout} 
          loading={loading} 
          todayStatus={todayStatus}
        />
      </div>

      {/* Completion Message */}
      {isCheckedOut && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 shadow-lg">
          <div className="text-center py-6">
            <div className="text-5xl mb-3">✅</div>
            <h3 className="text-2xl font-bold text-green-800 mb-2">
              Attendance Completed for Today!
            </h3>
            <p className="text-green-700">
              Great work! Your attendance has been successfully recorded.
            </p>
          </div>
        </Card>
      )}

      {/* Employee Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-indigo-600 rounded-lg p-2">
              <Briefcase size={20} className="text-white" />
            </div>
            <h4 className="text-sm text-gray-600 font-semibold uppercase">Department</h4>
          </div>
          <p className="text-xl font-bold text-gray-900">{user?.department || 'General'}</p>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-600 rounded-lg p-2">
              <User size={20} className="text-white" />
            </div>
            <h4 className="text-sm text-gray-600 font-semibold uppercase">Employee ID</h4>
          </div>
          <p className="text-xl font-bold text-gray-900">#{user?.id?.slice(-6).toUpperCase()}</p>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-600 rounded-lg p-2">
              <Shield size={20} className="text-white" />
            </div>
            <h4 className="text-sm text-gray-600 font-semibold uppercase">Account Status</h4>
          </div>
          <Badge status="active" className="text-base">Active</Badge>
        </Card>
      </div>

      {/* Recent Attendance Table */}
      <RecentAttendanceTable />
    </div>
  );
};

export default EmployeeDashboard;
