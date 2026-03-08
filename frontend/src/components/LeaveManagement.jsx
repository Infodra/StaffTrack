import { useState, useEffect } from 'react';
import { Calendar, Plus, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';
import { Modal } from './Modal';
import { leaveService } from '../services/apiService';
import { formatDate } from '../utils/helpers';

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    leave_type: 'casual',
    start_date: '',
    end_date: '',
    reason: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      const [leavesRes, balanceRes] = await Promise.all([
        leaveService.getLeaveRequests(),
        leaveService.getLeaveBalance()
      ]);

      if (leavesRes.success) {
        setLeaves(leavesRes.data.leaves || []);
      }

      if (balanceRes.success) {
        setBalance(balanceRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch leave data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setSubmitting(true);

    try {
      const response = await leaveService.applyLeave(formData);
      if (response.success) {
        setMessage({ type: 'success', text: 'Leave request submitted successfully!' });
        setShowModal(false);
        setFormData({
          leave_type: 'casual',
          start_date: '',
          end_date: '',
          reason: ''
        });
        fetchLeaveData();
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to submit leave request' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (leaveId) => {
    if (!confirm('Are you sure you want to delete this leave request?')) return;

    try {
      const response = await leaveService.deleteLeaveRequest(leaveId);
      if (response.success) {
        fetchLeaveData();
      }
    } catch (error) {
      alert('Failed to delete leave request');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger'
    };
    return <Badge status={statusMap[status]}>{status.toUpperCase()}</Badge>;
  };

  const getLeaveTypeLabel = (type) => {
    const labels = {
      sick: 'Sick Leave',
      casual: 'Casual Leave',
      annual: 'Annual Leave',
      permission: 'Permission',
      other: 'Other'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Leave Balance Cards */}
      {balance && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {Object.entries(balance.balance).map(([type, days]) => (
            <Card key={type} className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
              <div className="text-center">
                <p className="text-xs font-medium text-gray-600 uppercase mb-1">
                  {getLeaveTypeLabel(type)}
                </p>
                <p className="text-2xl font-bold text-blue-900">{days}</p>
                <p className="text-xs text-gray-500">days left</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Leave Requests */}
      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Calendar size={20} />
              My Leave Requests
            </CardTitle>
            <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
              <Plus size={16} />
              Apply Leave
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {message.text && (
            <div className={`p-4 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {message.text}
            </div>
          )}
          
          {leaves.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No leave requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Type</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Start Date</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">End Date</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Days</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Reason</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leaves.map((leave) => (
                    <tr key={leave._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">{getLeaveTypeLabel(leave.leave_type)}</td>
                      <td className="py-3 px-4 text-sm">{formatDate(leave.start_date)}</td>
                      <td className="py-3 px-4 text-sm">{formatDate(leave.end_date)}</td>
                      <td className="py-3 px-4 text-sm text-center font-semibold">{leave.days_count}</td>
                      <td className="py-3 px-4 text-sm max-w-xs truncate">{leave.reason}</td>
                      <td className="py-3 px-4 text-center">{getStatusBadge(leave.status)}</td>
                      <td className="py-3 px-4 text-center">
                        {leave.status === 'pending' && (
                          <button
                            onClick={() => handleDelete(leave._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Apply Leave Modal */}
      {showModal && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Apply for Leave">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leave Type
              </label>
              <select
                name="leave_type"
                value={formData.leave_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="casual">Casual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="annual">Annual Leave</option>
                <option value="permission">Permission</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                min={formData.start_date}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Explain the reason for your leave..."
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? 'Submitting...' : 'Submit Request'}
              </Button>
              <Button 
                type="button" 
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};

export default LeaveManagement;
