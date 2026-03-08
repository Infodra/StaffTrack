import { useState, useEffect } from 'react';
import { Clock, MapPin, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { Card } from './Card';
import { Badge } from './Badge';
import { attendanceService } from '../services/apiService';
import { formatTime } from '../utils/helpers';

const TodayTrackTable = ({ todayStatus, user }) => {
  const [locationInfo, setLocationInfo] = useState(null);

  useEffect(() => {
    if (todayStatus?.check_in_location) {
      setLocationInfo({
        checkIn: todayStatus.check_in_location,
        checkOut: todayStatus.check_out_location
      });
    }
  }, [todayStatus]);

  const getStatusBadge = (status) => {
    if (!status || status === 'not-checked-in') {
      return <Badge status="inactive">Not Logged In</Badge>;
    }
    if (status === 'checked-in') {
      return <Badge status="active">Logged In</Badge>;
    }
    if (status === 'checked-out') {
      return <Badge status="completed">Logged Out</Badge>;
    }
    return <Badge status="inactive">Unknown</Badge>;
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Card className="shadow-md">
      <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="text-blue-600" size={24} />
            Today's Attendance Track
          </h3>
          <span className="text-sm text-gray-600">{getCurrentDate()}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Login Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Logout Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr className="hover:bg-gray-50 transition-colors">
              {/* Employee Name with Avatar */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{user?.name || 'Unknown'}</div>
                    <div className="text-xs text-gray-500">{user?.email || ''}</div>
                  </div>
                </div>
              </td>

              {/* Department */}
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-900">{user?.department || 'General'}</span>
              </td>

              {/* Login Time */}
              <td className="px-6 py-4 whitespace-nowrap">
                {todayStatus?.check_in_time ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-sm font-medium text-gray-900">
                      {formatTime(todayStatus.check_in_time)}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">Not logged in</span>
                )}
              </td>

              {/* Logout Time */}
              <td className="px-6 py-4 whitespace-nowrap">
                {todayStatus?.check_out_time ? (
                  <div className="flex items-center gap-2">
                    <XCircle size={16} className="text-red-600" />
                    <span className="text-sm font-medium text-gray-900">
                      {formatTime(todayStatus.check_out_time)}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">Not logged out</span>
                )}
              </td>

              {/* Status */}
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(todayStatus?.status)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden p-4">
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-semibold">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{user?.name || 'Unknown'}</div>
              <div className="text-xs text-gray-500">{user?.department || 'General'}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Login:</span>
              {todayStatus?.check_in_time ? (
                <span className="text-sm font-medium text-gray-900">
                  {formatTime(todayStatus.check_in_time)}
                </span>
              ) : (
                <span className="text-sm text-gray-400">Not logged in</span>
              )}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Logout:</span>
              {todayStatus?.check_out_time ? (
                <span className="text-sm font-medium text-gray-900">
                  {formatTime(todayStatus.check_out_time)}
                </span>
              ) : (
                <span className="text-sm text-gray-400">Not logged out</span>
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-sm text-gray-600">Status:</span>
              {getStatusBadge(todayStatus?.status)}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TodayTrackTable;
