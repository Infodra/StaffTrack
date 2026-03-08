import { useState, useEffect } from 'react';
import { Calendar, Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Input, Select } from '../components/Form';
import { Badge } from '../components/Badge';
import { Loading } from '../components/Loading';
import { attendanceService, employeeService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import { formatDate, formatTime, formatHours } from '../utils/helpers';

const AttendanceHistory = () => {
  const { isAdmin } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    employee_id: ''
  });

  useEffect(() => {
    if (isAdmin()) {
      fetchEmployees();
    }
    fetchAttendance();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await employeeService.getEmployees();
      if (response.success) {
        setEmployees(response.data.employees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.employee_id && isAdmin()) params.employee_id = filters.employee_id;

      const response = await attendanceService.getHistory(params);
      
      if (response.success) {
        setAttendance(response.data.records);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    fetchAttendance();
  };

  const handleClearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      employee_id: ''
    });
    setTimeout(() => fetchAttendance(), 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Attendance History</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">View and filter attendance records</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter size={20} />
            <CardTitle>Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
            
            <Input
              label="End Date"
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />

            {isAdmin() && (
              <Select
                label="Employee"
                value={filters.employee_id}
                onChange={(e) => handleFilterChange('employee_id', e.target.value)}
                options={[
                  { value: '', label: 'All Employees' },
                  ...employees.map(emp => ({
                    value: emp._id,
                    label: emp.name
                  }))
                ]}
              />
            )}
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleApplyFilters}
              className="btn btn-primary"
            >
              Apply Filters
            </button>
            <button
              onClick={handleClearFilters}
              className="btn btn-secondary"
            >
              Clear
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar size={20} />
            <CardTitle>Records ({attendance.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loading />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                    {isAdmin() && (
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Employee</th>
                    )}
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Check In</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Check Out</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Working Hours</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin() ? "6" : "5"} className="text-center py-8 text-gray-500">
                        No attendance records found
                      </td>
                    </tr>
                  ) : (
                    attendance.map((record) => (
                      <tr key={record._id} className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {formatDate(record.date)}
                        </td>
                        {isAdmin() && record.employee_id && (
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-900">{record.employee_id.name}</p>
                            <p className="text-sm text-gray-500">{record.employee_id.department}</p>
                          </td>
                        )}
                        <td className="py-3 px-4 text-gray-700">
                          {record.check_in?.time ? formatTime(record.check_in.time) : '-'}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {record.check_out?.time ? formatTime(record.check_out.time) : '-'}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {formatHours(record.working_hours)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge status={record.status}>{record.status}</Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {attendance.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <h4 className="text-sm text-gray-600 mb-1">Total Days</h4>
            <p className="text-3xl font-bold text-gray-900">{attendance.length}</p>
          </Card>
          
          <Card>
            <h4 className="text-sm text-gray-600 mb-1">Total Working Hours</h4>
            <p className="text-3xl font-bold text-gray-900">
              {formatHours(
                attendance.reduce((sum, record) => sum + (record.working_hours || 0), 0)
              )}
            </p>
          </Card>
          
          <Card>
            <h4 className="text-sm text-gray-600 mb-1">Average Hours/Day</h4>
            <p className="text-3xl font-bold text-gray-900">
              {formatHours(
                attendance.reduce((sum, record) => sum + (record.working_hours || 0), 0) / attendance.length
              )}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AttendanceHistory;
