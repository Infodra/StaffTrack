import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, UserX, Clock, Calendar, CheckCircle, XCircle, MapPin, LogIn, LogOut, Bell, AlertTriangle } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Loading } from '../components/Loading';
import { Badge } from '../components/Badge';
import { companyService, attendanceService, employeeService, leaveService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import { getGreeting, formatTime, formatDate, getCompanyLogo } from '../utils/helpers';

const AdminDashboard = () => {
  const { user, company } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const today = new Date().toISOString().split('T')[0];
      const [statsResponse, employeesResponse, historyResponse, leavesResponse] = await Promise.all([
        companyService.getStats(),
        employeeService.getEmployees(),
        attendanceService.getHistory({
          startDate: today,
          endDate: today,
          limit: 100
        }),
        leaveService.getLeaveRequests({ status: 'pending' })
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (employeesResponse.success) {
        setEmployees(employeesResponse.data.employees || []);
      }

      if (historyResponse.success) {
        setTodayAttendance(historyResponse.data.records || []);
      }

      if (leavesResponse.success) {
        setPendingLeaves(leavesResponse.data.leaves || leavesResponse.data || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  const presentToday = stats?.attendance_today?.checked_in || 0;
  const totalEmployees = stats?.employees?.active || 0;
  const absentToday = totalEmployees - presentToday;
  const currentlyInOffice = stats?.attendance_today?.currently_in_office || 0;
  const attendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6">
      {/* Header with Time and Logo */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">
            {getGreeting()}, {user?.name}! 👋
          </h1>
          <p className="text-indigo-500 font-medium mt-1 text-sm sm:text-base">Here's what's happening with your team today</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Time Display */}
          <div className="flex flex-col items-end gap-1">
            <div className="text-2xl sm:text-3xl font-bold text-primary-600">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-sm text-gray-600">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
          </div>
          
          {/* Company Logo */}
          <img 
            src={company?.name ? (getCompanyLogo(company.name) || '/logos/infodra.png') : '/logos/infodra.png'}
            alt={company?.name || 'Company Logo'}
            className="h-12 sm:h-16 w-auto object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      </div>

      {/* Enhanced Stats Grid with Gradients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 uppercase tracking-wide">Total Employees</p>
              <p className="text-4xl font-bold text-blue-900 mt-2">{totalEmployees}</p>
              <p className="text-xs text-blue-600 mt-1">Active workforce</p>
            </div>
            <div className="bg-blue-600 rounded-2xl p-4">
              <Users size={32} className="text-white" />
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 uppercase tracking-wide">Present Today</p>
              <p className="text-4xl font-bold text-green-900 mt-2">{presentToday}</p>
              <p className="text-xs text-green-600 mt-1">{attendanceRate}% attendance rate</p>
            </div>
            <div className="bg-green-600 rounded-2xl p-4">
              <UserCheck size={32} className="text-white" />
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-rose-100 border-2 border-red-200 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700 uppercase tracking-wide">Absent Today</p>
              <p className="text-4xl font-bold text-red-900 mt-2">{absentToday}</p>
              <p className="text-xs text-red-600 mt-1">Not checked in</p>
            </div>
            <div className="bg-red-600 rounded-2xl p-4">
              <UserX size={32} className="text-white" />
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 uppercase tracking-wide">In Office Now</p>
              <p className="text-4xl font-bold text-purple-900 mt-2">{currentlyInOffice}</p>
              <p className="text-xs text-purple-600 mt-1">Currently working</p>
            </div>
            <div className="bg-purple-600 rounded-2xl p-4">
              <Clock size={32} className="text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Pending Leave Requests Notification */}
      {pendingLeaves.length > 0 && (
        <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg animate-pulse-slow">
          <div className="flex items-start gap-4 p-1">
            <div className="bg-amber-500 rounded-2xl p-3 flex-shrink-0">
              <Bell size={28} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={18} className="text-amber-600" />
                <h3 className="text-lg font-bold text-amber-800">
                  {pendingLeaves.length} Leave Request{pendingLeaves.length > 1 ? 's' : ''} Pending
                </h3>
              </div>
              <div className="space-y-2 mb-3">
                {pendingLeaves.slice(0, 5).map((leave) => {
                  const typeLabels = { sick: 'Sick Leave', casual: 'Casual Leave', annual: 'Privilege Leave', permission: 'Permission', other: 'Other' };
                  return (
                    <div key={leave._id} className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-bold text-sm">
                          {(leave.employee_id?.name || leave.employee_name || '?').charAt(0)}
                        </div>
                        <div>
                          <span className="font-medium text-gray-800">{leave.employee_id?.name || leave.employee_name || 'Employee'}</span>
                          <span className="text-gray-500 ml-2 text-sm">— {typeLabels[leave.leave_type] || leave.leave_type}</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(leave.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {leave.start_date !== leave.end_date && (
                          <span> – {new Date(leave.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {pendingLeaves.length > 5 && (
                  <p className="text-sm text-amber-700 pl-2">+ {pendingLeaves.length - 5} more request{pendingLeaves.length - 5 > 1 ? 's' : ''}</p>
                )}
              </div>
              <button
                onClick={() => navigate('/admin/leave')}
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Review Leave Requests
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Employee Attendance Details Table */}
      <Card className="shadow-lg border border-gray-200">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="text-gray-700" size={24} />
              Employee Attendance ({employees.length})
            </CardTitle>
            <Badge status="active" className="text-sm">
              {formatDate(new Date())}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white border-b-2 border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Office Location</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Login Time</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Logout Time</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Working Hours</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employees.map((employee) => {
                  const attendance = todayAttendance.find(att => {
                    const attEmpId = att.employee_id?.employee_id || att.employee_id;
                    return attEmpId === employee.employee_id;
                  });
                  
                  const checkIn = attendance?.check_in ? new Date(attendance.check_in) : null;
                  const checkOut = attendance?.check_out ? new Date(attendance.check_out) : null;
                  const isCheckedIn = !!checkIn;
                  const isCheckedOut = !!checkOut;
                  
                  return (
                    <tr key={employee._id} className={`hover:bg-gray-50 transition-colors ${!isCheckedIn ? 'bg-red-50/30' : ''}`}>
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{employee.name}</div>
                        <div className="text-xs text-gray-500">{employee.department || 'General'}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                          {employee.location_name || 'Not Set'}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="text-sm text-gray-700">
                          {attendance?.date || new Date().toISOString().split('T')[0]}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {checkIn ? (
                          <div className="flex items-center justify-center gap-1">
                            <LogIn size={14} className="text-green-500" />
                            <span className="text-sm font-medium text-green-700">
                              {checkIn.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {checkOut ? (
                          <div className="flex items-center justify-center gap-1">
                            <LogOut size={14} className="text-blue-500" />
                            <span className="text-sm font-medium text-blue-700">
                              {checkOut.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ) : isCheckedIn ? (
                          <span className="text-xs text-orange-500 font-medium">Working...</span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {attendance?.working_hours ? (
                          <span className="text-sm font-medium text-gray-700">
                            {attendance.working_hours.toFixed(1)} hrs
                          </span>
                        ) : isCheckedIn ? (
                          <span className="text-xs text-orange-500">In progress</span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {isCheckedOut ? (
                          <Badge status="info" className="text-xs">Completed</Badge>
                        ) : isCheckedIn ? (
                          <Badge status="active" className="text-xs">In Office</Badge>
                        ) : (
                          <Badge status="inactive" className="text-xs">Absent</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {employees.length === 0 && (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-lg">No employees found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Attendance Summary */}
      <Card className="shadow-lg border border-gray-200">
        <CardHeader className="bg-gradient-to-r from-primary-50 to-blue-50 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="text-primary-600" size={24} />
              Today's Attendance Summary
            </CardTitle>
            <Badge status="active" className="text-sm">
              {formatDate(new Date())}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-xl border-2 border-green-200">
              <div className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-2">Checked In</div>
              <div className="text-4xl font-bold text-green-600 mb-1">
                {stats?.attendance_today?.checked_in || 0}
              </div>
              <div className="text-xs text-green-600">Employees present</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
              <div className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-2">Checked Out</div>
              <div className="text-4xl font-bold text-blue-600 mb-1">
                {stats?.attendance_today?.checked_out || 0}
              </div>
              <div className="text-xs text-blue-600">Completed for day</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
              <div className="text-sm font-semibold text-purple-700 uppercase tracking-wide mb-2">In Office</div>
              <div className="text-4xl font-bold text-purple-600 mb-1">
                {stats?.attendance_today?.currently_in_office || 0}
              </div>
              <div className="text-xs text-purple-600">Working now</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
              <div className="text-sm font-semibold text-orange-700 uppercase tracking-wide mb-2">Rate</div>
              <div className="text-4xl font-bold text-orange-600 mb-1">
                {attendanceRate}%
              </div>
              <div className="text-xs text-orange-600">Overall attendance</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
