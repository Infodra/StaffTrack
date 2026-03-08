import LeaveManagement from '../components/LeaveManagement';

const LeavePage = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
        <p className="text-gray-600 mt-2">Apply for leave and track your leave requests</p>
      </div>
      
      <LeaveManagement />
    </div>
  );
};

export default LeavePage;
