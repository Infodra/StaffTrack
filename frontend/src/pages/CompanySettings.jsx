import { useState, useEffect } from 'react';
import { Building2, MapPin, Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Input } from '../components/Form';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { Loading } from '../components/Loading';
import { companyService } from '../services/apiService';

const CompanySettings = () => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    company_name: '',
    office_latitude: '',
    office_longitude: '',
    geofence_radius: ''
  });

  useEffect(() => {
    fetchCompanyDetails();
  }, []);

  const fetchCompanyDetails = async () => {
    try {
      setLoading(true);
      const response = await companyService.getCompany();
      
      if (response.success) {
        setCompany(response.data);
        setFormData({
          company_name: response.data.name,
          office_latitude: response.data.office_location.latitude,
          office_longitude: response.data.office_location.longitude,
          geofence_radius: response.data.geofence_radius
        });
      }
    } catch (error) {
      console.error('Error fetching company details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      setSaving(true);
      const response = await companyService.updateSettings(formData);
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Settings updated successfully!' });
        fetchCompanyDetails();
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update settings' 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Company Settings</h1>
        <p className="text-gray-600 mt-1">Manage your company configuration</p>
      </div>

      {message.text && (
        <Alert type={message.type} message={message.text} onClose={() => setMessage({ type: '', text: '' })} />
      )}

      {/* Company Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 size={20} />
            <CardTitle>Company Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Company ID</p>
              <p className="font-medium text-gray-900">#{company?.id?.slice(-8).toUpperCase()}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-1">Admin Email</p>
              <p className="font-medium text-gray-900">{company?.admin_email}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-1">Subscription Plan</p>
              <p className="font-medium text-gray-900 capitalize">{company?.subscription_plan}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-1">Employee Limit</p>
              <p className="font-medium text-gray-900">
                {company?.employee_count || 0} / {company?.employee_limit}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <p className="font-medium text-green-600 capitalize">{company?.status}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-1">Created At</p>
              <p className="font-medium text-gray-900">
                {new Date(company?.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Office Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin size={20} />
            <CardTitle>Office Location & Geofence</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Company Name"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Office Latitude"
                type="number"
                step="any"
                value={formData.office_latitude}
                onChange={(e) => setFormData({ ...formData, office_latitude: e.target.value })}
                required
              />

              <Input
                label="Office Longitude"
                type="number"
                step="any"
                value={formData.office_longitude}
                onChange={(e) => setFormData({ ...formData, office_longitude: e.target.value })}
                required
              />
            </div>

            <Input
              label="Geofence Radius (meters)"
              type="number"
              value={formData.geofence_radius}
              onChange={(e) => setFormData({ ...formData, geofence_radius: e.target.value })}
              required
              min="10"
              max="5000"
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The geofence radius defines the maximum distance (in meters) 
                employees can be from the office location to check in or out. Recommended: 50-200 meters.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                loading={saving}
                className="flex items-center gap-2"
              >
                <Save size={18} />
                Save Changes
              </Button>
              <Button 
                type="button" 
                variant="secondary"
                onClick={fetchCompanyDetails}
              >
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Current Location Info */}
      <Card>
        <CardHeader>
          <CardTitle>Current Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Office Location</span>
              <span className="font-medium text-gray-900">
                {company?.office_location.latitude.toFixed(6)}, {company?.office_location.longitude.toFixed(6)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Geofence Radius</span>
              <span className="font-medium text-gray-900">{company?.geofence_radius} meters</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Coverage Area</span>
              <span className="font-medium text-gray-900">
                ~{Math.round(Math.PI * Math.pow(company?.geofence_radius || 0, 2))} m²
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanySettings;
