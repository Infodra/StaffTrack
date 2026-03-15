import { useState, useEffect } from 'react';
import { Building2, Users, Activity, Plus, Edit, Trash2, Eye, X, Globe, Image } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Loading } from '../components/Loading';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Input, Select } from '../components/Form';
import { Alert } from '../components/Alert';
import { Modal } from '../components/Modal';
import { superAdminService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import { getGreeting, formatDate } from '../utils/helpers';

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyDetail, setCompanyDetail] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [createForm, setCreateForm] = useState({
    company_name: '',
    company_id: '',
    admin_name: '',
    admin_email: '',
    admin_password: '',
    office_latitude: '',
    office_longitude: '',
    geofence_radius: '100',
    employee_limit: '50',
    license_type: 'lifetime',
    domain: '',
    logo: ''
  });

  const [editForm, setEditForm] = useState({
    company_name: '',
    employee_limit: '',
    license_type: '',
    status: '',
    geofence_radius: '',
    domain: '',
    logo: ''
  });

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, companiesRes] = await Promise.all([
        superAdminService.getStats(),
        superAdminService.getCompanies()
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (companiesRes.success) setCompanies(companiesRes.data.companies || []);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    setError('');
    setFormLoading(true);

    try {
      const response = await superAdminService.createCompany({
        ...createForm,
        office_latitude: parseFloat(createForm.office_latitude),
        office_longitude: parseFloat(createForm.office_longitude),
        geofence_radius: parseInt(createForm.geofence_radius),
        employee_limit: parseInt(createForm.employee_limit)
      });

      if (response.success) {
        setSuccess(`Company "${response.data.company.name}" created successfully with admin ${response.data.admin.email}`);
        setShowCreateModal(false);
        setCreateForm({
          company_name: '', company_id: '', admin_name: '', admin_email: '',
          admin_password: '', office_latitude: '', office_longitude: '',
          geofence_radius: '100', employee_limit: '50', license_type: 'lifetime', domain: '', logo: ''
        });
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create company');
    } finally {
      setFormLoading(false);
    }
  };

  const handleViewCompany = async (companyId) => {
    try {
      const response = await superAdminService.getCompanyDetails(companyId);
      if (response.success) {
        setCompanyDetail(response.data);
        setShowDetailModal(true);
      }
    } catch (err) {
      setError('Failed to load company details');
    }
  };

  const handleEditCompany = (company) => {
    setSelectedCompany(company);
    setEditForm({
      company_name: company.name,
      employee_limit: String(company.employee_limit),
      license_type: company.license_type,
      status: company.status,
      geofence_radius: String(company.geofence_radius),
      domain: company.domain || '',
      logo: company.logo || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateCompany = async (e) => {
    e.preventDefault();
    setError('');
    setFormLoading(true);

    try {
      const response = await superAdminService.updateCompany(selectedCompany.company_id, {
        ...editForm,
        employee_limit: parseInt(editForm.employee_limit),
        geofence_radius: parseInt(editForm.geofence_radius)
      });

      if (response.success) {
        setSuccess('Company updated successfully');
        setShowEditModal(false);
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update company');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCompany = async (company) => {
    if (!window.confirm(`Are you sure you want to delete "${company.name}" and ALL its data? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await superAdminService.deleteCompany(company.company_id);
      if (response.success) {
        setSuccess(`Company "${company.name}" deleted successfully`);
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete company');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">
            {getGreeting()}, {user?.name}!
          </h1>
          <p className="text-indigo-500 font-medium mt-1">Platform Administration - Manage all companies</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-sm text-gray-600">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
          </div>
          <Badge status="active" className="text-sm px-3 py-1">Super Admin</Badge>
        </div>
      </div>

      {/* Alerts */}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 uppercase">Total Companies</p>
              <p className="text-4xl font-bold text-blue-900 mt-2">{stats?.companies?.total || 0}</p>
              <p className="text-xs text-blue-600 mt-1">{stats?.companies?.active || 0} active</p>
            </div>
            <div className="bg-blue-600 rounded-2xl p-4">
              <Building2 size={32} className="text-white" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 uppercase">Total Employees</p>
              <p className="text-4xl font-bold text-green-900 mt-2">{stats?.employees?.total || 0}</p>
              <p className="text-xs text-green-600 mt-1">{stats?.employees?.active || 0} active</p>
            </div>
            <div className="bg-green-600 rounded-2xl p-4">
              <Users size={32} className="text-white" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-2 border-purple-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 uppercase">Today's Attendance</p>
              <p className="text-4xl font-bold text-purple-900 mt-2">{stats?.today_attendance || 0}</p>
              <p className="text-xs text-purple-600 mt-1">Across all companies</p>
            </div>
            <div className="bg-purple-600 rounded-2xl p-4">
              <Activity size={32} className="text-white" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border-2 border-orange-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700 uppercase">Suspended</p>
              <p className="text-4xl font-bold text-orange-900 mt-2">{stats?.companies?.suspended || 0}</p>
              <p className="text-xs text-orange-600 mt-1">Companies</p>
            </div>
            <div className="bg-orange-600 rounded-2xl p-4">
              <Building2 size={32} className="text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Companies Table */}
      <Card className="shadow-lg border border-gray-200">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="text-gray-700" size={24} />
              Companies ({companies.length})
            </CardTitle>
            <Button variant="primary" onClick={() => setShowCreateModal(true)} className="text-sm whitespace-nowrap py-2 px-4">
              <Plus size={16} className="mr-1 inline" /> Add Company
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white border-b-2 border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Company</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Logo</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Admin Email</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Domain</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Employees</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">License</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Created</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{company.name}</div>
                      <div className="text-xs text-gray-500">{company.company_id}</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {company.logo ? (
                        <img src={company.logo} alt={company.name} className="h-8 w-8 object-contain mx-auto rounded" onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                        <span className="text-gray-300"><Image size={20} className="mx-auto" /></span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-700">{company.admin_email}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 text-sm text-blue-600">
                        <Globe size={14} />
                        {company.domain || '-'}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-sm font-medium">{company.employee_count}</span>
                      <span className="text-xs text-gray-500"> / {company.employee_limit}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-xs font-medium capitalize bg-gray-100 px-2 py-1 rounded">
                        {company.license_type}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Badge status={company.status === 'active' ? 'active' : 'inactive'} className="text-xs">
                        {company.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-gray-600">
                      {formatDate(company.created_at)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewCompany(company.company_id)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEditCompany(company)}
                          className="text-yellow-600 hover:text-yellow-800 p-1"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteCompany(company)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {companies.length === 0 && (
            <div className="text-center py-12">
              <Building2 size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-lg">No companies yet</p>
              <p className="text-gray-400 text-sm mt-1">Click "Add Company" to create your first company</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Company Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Company" size="xl">
          <form onSubmit={handleCreateCompany} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Company Name *"
                value={createForm.company_name}
                onChange={(e) => setCreateForm({ ...createForm, company_name: e.target.value })}
                placeholder="e.g., Tecinfo Solutions"
                required
              />
              <Input
                label="Company ID (auto-generated if empty)"
                value={createForm.company_id}
                onChange={(e) => setCreateForm({ ...createForm, company_id: e.target.value.toUpperCase() })}
                placeholder="e.g., TEC001"
              />
              <Input
                label="Admin Name *"
                value={createForm.admin_name}
                onChange={(e) => setCreateForm({ ...createForm, admin_name: e.target.value })}
                placeholder="e.g., John Doe"
                required
              />
              <Input
                label="Admin Email *"
                type="email"
                value={createForm.admin_email}
                onChange={(e) => setCreateForm({ ...createForm, admin_email: e.target.value })}
                placeholder="admin@tecinfo.com"
                required
              />
              <Input
                label="Admin Password *"
                type="password"
                value={createForm.admin_password}
                onChange={(e) => setCreateForm({ ...createForm, admin_password: e.target.value })}
                placeholder="Min 6 characters"
                required
              />
              <Input
                label="Domain (auto-generated if empty)"
                value={createForm.domain}
                onChange={(e) => setCreateForm({ ...createForm, domain: e.target.value })}
                placeholder="tecinfo.stafftrack.infodra.ai"
              />
              <Input
                label="Company Logo URL"
                value={createForm.logo}
                onChange={(e) => setCreateForm({ ...createForm, logo: e.target.value })}
                placeholder="/logos/company-logo.png or https://..."
              />
              <Input
                label="Office Latitude *"
                type="number"
                step="any"
                value={createForm.office_latitude}
                onChange={(e) => setCreateForm({ ...createForm, office_latitude: e.target.value })}
                placeholder="e.g., 12.9716"
                required
              />
              <Input
                label="Office Longitude *"
                type="number"
                step="any"
                value={createForm.office_longitude}
                onChange={(e) => setCreateForm({ ...createForm, office_longitude: e.target.value })}
                placeholder="e.g., 77.5946"
                required
              />
              <Input
                label="Geofence Radius (meters)"
                type="number"
                value={createForm.geofence_radius}
                onChange={(e) => setCreateForm({ ...createForm, geofence_radius: e.target.value })}
              />
              <Input
                label="Employee Limit"
                type="number"
                value={createForm.employee_limit}
                onChange={(e) => setCreateForm({ ...createForm, employee_limit: e.target.value })}
              />
              <Select
                label="License Type"
                value={createForm.license_type}
                onChange={(e) => setCreateForm({ ...createForm, license_type: e.target.value })}
                options={[
                  { value: 'lifetime', label: 'Lifetime' },
                  { value: 'annual', label: 'Annual' },
                  { value: 'monthly', label: 'Monthly' }
                ]}
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={formLoading}>
                Create Company
              </Button>
            </div>
          </form>
        </Modal>

      {/* Edit Company Modal */}
      <Modal isOpen={showEditModal && !!selectedCompany} onClose={() => setShowEditModal(false)} title={`Edit: ${selectedCompany?.name || ''}`}>
          <form onSubmit={handleUpdateCompany} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Company Name"
                value={editForm.company_name}
                onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })}
              />
              <Input
                label="Domain"
                value={editForm.domain}
                onChange={(e) => setEditForm({ ...editForm, domain: e.target.value })}
              />
              <Input
                label="Company Logo URL"
                value={editForm.logo}
                onChange={(e) => setEditForm({ ...editForm, logo: e.target.value })}
                placeholder="/logos/company-logo.png or https://..."
              />
              <Input
                label="Employee Limit"
                type="number"
                value={editForm.employee_limit}
                onChange={(e) => setEditForm({ ...editForm, employee_limit: e.target.value })}
              />
              <Input
                label="Geofence Radius (meters)"
                type="number"
                value={editForm.geofence_radius}
                onChange={(e) => setEditForm({ ...editForm, geofence_radius: e.target.value })}
              />
              <Select
                label="License Type"
                value={editForm.license_type}
                onChange={(e) => setEditForm({ ...editForm, license_type: e.target.value })}
                options={[
                  { value: 'lifetime', label: 'Lifetime' },
                  { value: 'annual', label: 'Annual' },
                  { value: 'monthly', label: 'Monthly' }
                ]}
              />
              <Select
                label="Status"
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'suspended', label: 'Suspended' },
                  { value: 'cancelled', label: 'Cancelled' }
                ]}
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={formLoading}>
                Update Company
              </Button>
            </div>
          </form>
        </Modal>

      {/* Company Detail Modal */}
      <Modal isOpen={showDetailModal && !!companyDetail} onClose={() => setShowDetailModal(false)} title={`Company: ${companyDetail?.company?.name || ''}`} size="xl">
          {companyDetail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-xs text-gray-500">Company ID</p>
                <p className="font-medium">{companyDetail.company.company_id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Domain</p>
                <p className="font-medium text-blue-600">{companyDetail.company.domain}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Admin Email</p>
                <p className="font-medium">{companyDetail.company.admin_email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <Badge status={companyDetail.company.status === 'active' ? 'active' : 'inactive'}>
                  {companyDetail.company.status}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Employees</p>
                <p className="font-medium">{companyDetail.stats.total_employees}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Active Employees</p>
                <p className="font-medium">{companyDetail.stats.active_employees}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Today's Attendance</p>
                <p className="font-medium">{companyDetail.stats.today_attendance}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Employee Limit</p>
                <p className="font-medium">{companyDetail.company.employee_limit}</p>
              </div>
            </div>

            {/* Employees List */}
            {companyDetail.employees && companyDetail.employees.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Employees ({companyDetail.employees.length})</h4>
                <div className="max-h-64 overflow-y-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left py-2 px-3">Name</th>
                        <th className="text-left py-2 px-3">Email</th>
                        <th className="text-center py-2 px-3">Role</th>
                        <th className="text-center py-2 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {companyDetail.employees.map((emp) => (
                        <tr key={emp._id}>
                          <td className="py-2 px-3">{emp.name}</td>
                          <td className="py-2 px-3 text-gray-600">{emp.email}</td>
                          <td className="py-2 px-3 text-center capitalize">{emp.role}</td>
                          <td className="py-2 px-3 text-center">
                            <Badge status={emp.status === 'active' ? 'active' : 'inactive'} className="text-xs">
                              {emp.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          )}
        </Modal>
    </div>
  );
};

export default SuperAdminDashboard;
