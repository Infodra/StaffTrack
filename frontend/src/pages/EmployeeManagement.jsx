import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Input, Select } from '../components/Form';
import { Modal } from '../components/Modal';
import { Badge } from '../components/Badge';
import { Alert } from '../components/Alert';
import { Loading } from '../components/Loading';
import { employeeService } from '../services/apiService';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [gettingLocation, setGettingLocation] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    role: 'employee',
    location_name: 'Office Location',
    latitude: '',
    longitude: '',
    radius_meters: 150
  });

  useEffect(() => {
    fetchEmployees();
  }, [filterStatus]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getEmployees({ status: filterStatus });
      if (response.success) {
        setEmployees(response.data.employees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (employee = null) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        name: employee.name,
        email: employee.email,
        password: '',
        department: employee.department,
        role: employee.role,
        location_name: employee.location_name || 'Office Location',
        latitude: employee.latitude || '',
        longitude: employee.longitude || '',
        radius_meters: employee.radius_meters || 150
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        department: '',
        role: 'employee',
        location_name: 'Office Location',
        latitude: '',
        longitude: '',
        radius_meters: 150
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      department: '',
      role: 'employee',
      location_name: 'Office Location',
      latitude: '',
      longitude: '',
      radius_meters: 150
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      if (editingEmployee) {
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await employeeService.updateEmployee(editingEmployee._id, updateData);
        setMessage({ type: 'success', text: 'Employee updated successfully!' });
      } else {
        await employeeService.createEmployee(formData);
        setMessage({ type: 'success', text: 'Employee created successfully!' });
      }
      
      handleCloseModal();
      fetchEmployees();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Operation failed' 
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    try {
      await employeeService.deleteEmployee(id);
      setMessage({ type: 'success', text: 'Employee deleted successfully!' });
      fetchEmployees();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Delete failed' 
      });
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage({ type: 'error', text: 'Geolocation is not supported by your browser' });
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        });
        setGettingLocation(false);
        setMessage({ type: 'success', text: 'Location captured successfully!' });
      },
      (error) => {
        setGettingLocation(false);
        setMessage({ type: 'error', text: 'Unable to get location. Please enter manually.' });
        console.error('Geolocation error:', error);
      }
    );
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your team members</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2 justify-center">
          <Plus size={20} />
          <span className="hidden sm:inline">Add Employee</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {message.text && (
        <Alert type={message.type} message={message.text} onClose={() => setMessage({ type: '', text: '' })} />
      )}

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: '', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'suspended', label: 'Suspended' }
            ]}
            className="sm:w-48"
          />
        </div>
      </Card>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle>Employees ({filteredEmployees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Department</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">
                      No employees found
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee) => (
                    <tr key={employee._id} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-gray-900">{employee.name}</td>
                      <td className="py-3 px-4 text-gray-600">{employee.email}</td>
                      <td className="py-3 px-4 text-gray-600">{employee.department}</td>
                      <td className="py-3 px-4">
                        <Badge status={employee.role === 'admin' ? 'active' : ''}
                          className={employee.role === 'admin' ? 'bg-purple-100 text-purple-700' : ''}>
                          {employee.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge status={employee.status}>{employee.status}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(employee)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(employee._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingEmployee ? 'Edit Employee' : 'Add New Employee'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          
          <Input
            label={editingEmployee ? "Password (leave blank to keep current)" : "Password"}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!editingEmployee}
          />
          
          <Input
            label="Department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          />
          
          <Select
            label="Role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            options={[
              { value: 'employee', label: 'Employee' },
              { value: 'admin', label: 'Admin' }
            ]}
          />

          {/* Geofence Location Fields */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Geofence Location</h3>
            
            <Input
              label="Location Name"
              value={formData.location_name}
              onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
              placeholder="e.g., Main Office, Branch Office"
              required
            />
            
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                <MapPin size={16} />
                {gettingLocation ? 'Getting location...' : 'Use Current Location'}
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                placeholder="e.g., 13.0827"
                required
              />
              
              <Input
                label="Longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                placeholder="e.g., 80.2707"
                required
              />
            </div>
            
            <Input
              label="Geofence Radius (meters)"
              type="number"
              value={formData.radius_meters}
              onChange={(e) => setFormData({ ...formData, radius_meters: e.target.value })}
              placeholder="150"
              required
            />
            
            <p className="text-xs text-gray-500 mt-2">
              📍 Employees can only check in/out within this radius from the specified location.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" variant="primary" className="flex-1">
              {editingEmployee ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="secondary" onClick={handleCloseModal} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeeManagement;
