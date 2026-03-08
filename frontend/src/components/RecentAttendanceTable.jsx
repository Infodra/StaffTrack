import { useState, useEffect } from 'react';
import { Calendar, Clock, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { attendanceService } from '../services/apiService';
import { formatDate, formatTime, formatHours } from '../utils/helpers';

const RecentAttendanceTable = () => {
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentAttendance = async () => {
      try {
        const response = await attendanceService.getHistory({ limit: 5 });
        if (response.success) {
          setRecentRecords(response.data.records || []);
        }
      } catch (error) {
        console.error('Error fetching recent attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentAttendance();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={20} />
            Recent Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recentRecords.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={20} />
            Recent Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Calendar size={48} className="mx-auto mb-3 text-gray-300" />
            <p>No attendance records found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50">
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <TrendingUp size={20} />
          Recent Attendance (Last 5 Days)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Check-In
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Check-Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentRecords.map((record, index) => (
                <tr 
                  key={record._id || index} 
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatDate(record.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-green-600" />
                      {record.check_in_time ? formatTime(record.check_in_time) : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-red-600" />
                      {record.check_out_time ? formatTime(record.check_out_time) : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                    {record.working_hours ? formatHours(record.working_hours) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {record.check_out_time ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Present
                      </span>
                    ) : record.check_in_time ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        In Progress
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        -
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-200">
          {recentRecords.map((record, index) => (
            <div key={record._id || index} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar size={16} className="text-blue-600" />
                {formatDate(record.date)}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 text-xs block mb-1">Check-In</span>
                  <div className="flex items-center gap-1 text-gray-900 font-medium">
                    <Clock size={12} className="text-green-600" />
                    {record.check_in_time ? formatTime(record.check_in_time) : '-'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block mb-1">Check-Out</span>
                  <div className="flex items-center gap-1 text-gray-900 font-medium">
                    <Clock size={12} className="text-red-600" />
                    {record.check_out_time ? formatTime(record.check_out_time) : '-'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block mb-1">Working Hours</span>
                  <div className="text-blue-600 font-bold">
                    {record.working_hours ? formatHours(record.working_hours) : '-'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block mb-1">Status</span>
                  {record.check_out_time ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Present
                    </span>
                  ) : record.check_in_time ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      In Progress
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentAttendanceTable;
