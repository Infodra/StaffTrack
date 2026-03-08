import { useState, useEffect } from 'react';
import { Calendar, Check, X, Clock, Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { leaveService } from '../services/apiService';
import { formatDate } from '../utils/helpers';

const AdminLeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionType, setActionType] = useState('');
  const [adminRemarks, setAdminRemarks] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchLeaveData();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [filterStatus, leaves]);

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      const [leavesRes, statsRes] = await Promise.all([
        leaveService.getLeaveRequests(),
        leaveService.getLeaveStatistics()
      ]);

      if (leavesRes.success) {
        setLeaves(leavesRes.data.leaves || []);
      }

      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch leave data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    if (filterStatus === 'all') {
      setFilteredLeaves(leaves);
    } else {
      setFilteredLeaves(leaves.filter(leave => leave.status === filterStatus));
    }
  };

  const handleAction = (leave, action) => {
    setSelectedLeave(leave);
    setActionType(action);
    setAdminRemarks('');
    setShowModal(true);
  };

  const handleSubmitAction = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const response = await leaveService.updateLeaveStatus(
        selectedLeave._id,
        actionType,
        adminRemarks
      );

      if (response.success) {
        setShowModal(false);
        fetchLeaveData();
        alert(`Leave request ${actionType} successfully!`);
      }
    } catch (error) {
      alert(`Failed to ${actionType} leave request`);
    } finally {
      setProcessing(false);
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

  const getPendingCount = () => leaves.filter(l => l.status === 'pending').length;
  const getApprovedCount = () => leaves.filter(l => l.status === 'approved').length;
  const getRejectedCount = () => leaves.filter(l => l.status === 'rejected').length;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
        <p className="text-gray-600 mt-2">Review and manage employee leave requests</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-700 uppercase">Pending</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">{getPendingCount()}</p>
            </div>
            <Clock size={32} className="text-yellow-600" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 uppercase">Approved</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{getApprovedCount()}</p>
            </div>
            <Check size={32} className="text-green-600" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700 uppercase">Rejected</p>
              <p className="text-3xl font-bold text-red-900 mt-1">{getRejectedCount()}</p>
            </div>
            <X size={32} className="text-red-600" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 uppercase">Total</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{leaves.length}</p>
            </div>
            <Calendar size={32} className="text-blue-600" />
          </div>
        </Card>
      </div>

      {/* Leave Requests Table */}
      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Calendar size={20} />
              Leave Requests ({filteredLeaves.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-600" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredLeaves.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No leave requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Employee</th>
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
                  {filteredLeaves.map((leave) => (
                    <tr key={leave._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{leave.employee_name}</div>
                          <div className="text-xs text-gray-500">{leave.employee_email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{getLeaveTypeLabel(leave.leave_type)}</td>
                      <td className="py-3 px-4 text-sm">{formatDate(leave.start_date)}</td>
                      <td className="py-3 px-4 text-sm">{formatDate(leave.end_date)}</td>
                      <td className="py-3 px-4 text-sm text-center font-semibold">{leave.days_count}</td>
                      <td className="py-3 px-4 text-sm max-w-xs truncate">{leave.reason}</td>
                      <td className="py-3 px-4 text-center">{getStatusBadge(leave.status)}</td>
                      <td className="py-3 px-4">
                        {leave.status === 'pending' && (
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleAction(leave, 'approved')}
                              className="p-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg"
                              title="Approve"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => handleAction(leave, 'rejected')}
                              className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg"
                              title="Reject"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}
                        {leave.status !== 'pending' && (
                          <span className="text-xs text-gray-500">
                            {leave.reviewed_at && formatDate(leave.reviewed_at)}
                          </span>
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

      {/* Action Modal */}
      {showModal && selectedLeave && (
        <Modal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          title={`${actionType === 'approved' ? 'Approve' : 'Reject'} Leave Request`}
        >
          <form onSubmit={handleSubmitAction} className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p><strong>Employee:</strong> {selectedLeave.employee_name}</p>
              <p><strong>Type:</strong> {getLeaveTypeLabel(selectedLeave.leave_type)}</p>
              <p><strong>Duration:</strong> {formatDate(selectedLeave.start_date)} to {formatDate(selectedLeave.end_date)}</p>
              <p><strong>Days:</strong> {selectedLeave.days_count} days</p>
              <p><strong>Reason:</strong> {selectedLeave.reason}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Remarks (Optional)
              </label>
              <textarea
                value={adminRemarks}
                onChange={(e) => setAdminRemarks(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Add any remarks or comments..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={processing}
                className={`flex-1 ${actionType === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {processing ? 'Processing...' : `Confirm ${actionType === 'approved' ? 'Approval' : 'Rejection'}`}
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
    </div>
  );
};

export default AdminLeaveManagement;
