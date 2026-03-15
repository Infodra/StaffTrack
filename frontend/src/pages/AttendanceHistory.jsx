import { useState, useEffect } from 'react';
import { Calendar, Filter, Download, Edit3, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Input, Select } from '../components/Form';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
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

  // Admin edit state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [editForm, setEditForm] = useState({ check_in: '', check_out: '', status: 'present' });
  const [createForm, setCreateForm] = useState({ employee_id: '', date: '', check_in: '', check_out: '', status: 'present' });
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

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

  // Admin: Edit attendance
  const handleEditClick = (record) => {
    setEditRecord(record);
    const checkIn = record.check_in ? new Date(record.check_in).toISOString().slice(0, 16) : '';
    const checkOut = record.check_out ? new Date(record.check_out).toISOString().slice(0, 16) : '';
    setEditForm({ check_in: checkIn, check_out: checkOut, status: record.status || 'present' });
    setMessage({ type: '', text: '' });
    setShowEditModal(true);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const data = {};
      if (editForm.check_in) data.check_in = editForm.check_in;
      if (editForm.check_out) data.check_out = editForm.check_out;
      if (editForm.status) data.status = editForm.status;

      const response = await attendanceService.adminUpdate(editRecord._id, data);
      if (response.success) {
        setMessage({ type: 'success', text: 'Attendance updated successfully!' });
        setShowEditModal(false);
        fetchAttendance();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update attendance' });
    } finally {
      setSaving(false);
    }
  };

  // Admin: Create attendance
  const handleCreateSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await attendanceService.adminCreate(createForm);
      if (response.success) {
        setMessage({ type: 'success', text: 'Attendance record created successfully!' });
        setShowCreateModal(false);
        setCreateForm({ employee_id: '', date: '', check_in: '', check_out: '', status: 'present' });
        fetchAttendance();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create attendance' });
    } finally {
      setSaving(false);
    }
  };

  // Admin: Export Excel
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.employee_id) params.employee_id = filters.employee_id;

      const response = await attendanceService.exportExcel(params);
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendance_report.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export Excel. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Attendance History</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">View and filter attendance records</p>
        </div>
        {isAdmin() && (
          <div className="flex gap-3">
            <Button
              onClick={() => { setMessage({ type: '', text: '' }); setShowCreateModal(true); }}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Plus size={16} />
              Add Record
            </Button>
            <Button
              onClick={handleExportExcel}
              disabled={exporting}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Download size={16} />
              {exporting ? 'Exporting...' : 'Export Excel'}
            </Button>
          </div>
        )}
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

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
                    {isAdmin() && (
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {attendance.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin() ? "7" : "5"} className="text-center py-8 text-gray-500">
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
                            <p className="font-medium text-gray-900">{record.employee_id.name || '-'}</p>
                            <p className="text-sm text-gray-500">{record.employee_id.department || ''}</p>
                          </td>
                        )}
                        <td className="py-3 px-4 text-gray-700">
                          {record.check_in ? formatTime(record.check_in) : '-'}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {record.check_out ? formatTime(record.check_out) : 
                            <span className="text-orange-500 font-medium">Missing</span>
                          }
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {formatHours(record.working_hours)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge status={record.status}>{record.status}</Badge>
                        </td>
                        {isAdmin() && (
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleEditClick(record)}
                              className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg"
                              title="Edit Attendance"
                            >
                              <Edit3 size={16} />
                            </button>
                          </td>
                        )}
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

      {/* Edit Attendance Modal */}
      {showEditModal && editRecord && (
        <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Attendance Record">
          <form onSubmit={handleEditSave} className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm"><strong>Date:</strong> {formatDate(editRecord.date)}</p>
              {editRecord.employee_id && (
                <p className="text-sm"><strong>Employee:</strong> {editRecord.employee_id.name || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Check In Time</label>
              <input
                type="datetime-local"
                value={editForm.check_in}
                onChange={(e) => setEditForm(prev => ({ ...prev, check_in: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Check Out Time</label>
              <input
                type="datetime-local"
                value={editForm.check_out}
                onChange={(e) => setEditForm(prev => ({ ...prev, check_out: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="half-day">Half Day</option>
                <option value="absent">Absent</option>
                <option value="on-leave">On Leave</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" onClick={() => setShowEditModal(false)} className="flex-1 bg-gray-500 hover:bg-gray-600">
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Create Attendance Modal */}
      {showCreateModal && (
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Add Attendance Record">
          <form onSubmit={handleCreateSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
              <select
                value={createForm.employee_id}
                onChange={(e) => setCreateForm(prev => ({ ...prev, employee_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={createForm.date}
                onChange={(e) => setCreateForm(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Check In Time</label>
              <input
                type="datetime-local"
                value={createForm.check_in}
                onChange={(e) => setCreateForm(prev => ({ ...prev, check_in: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Check Out Time (optional)</label>
              <input
                type="datetime-local"
                value={createForm.check_out}
                onChange={(e) => setCreateForm(prev => ({ ...prev, check_out: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={createForm.status}
                onChange={(e) => setCreateForm(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="half-day">Half Day</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={saving} className="flex-1 bg-green-600 hover:bg-green-700">
                {saving ? 'Creating...' : 'Create Record'}
              </Button>
              <Button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 bg-gray-500 hover:bg-gray-600">
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AttendanceHistory;
