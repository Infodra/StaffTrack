import { useState } from 'react';
import { LogOut, CheckCircle, XCircle, MapPin } from 'lucide-react';
import { Button } from './Button';
import { Card, CardHeader, CardTitle, CardContent } from './Card';

const LogoutCard = ({ onLogout, loading, todayStatus }) => {
  const [locationStatus, setLocationStatus] = useState(null);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);

  const handleLogout = async () => {
    setLocationStatus('checking');
    setGpsAccuracy(null);

    // Get location first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const accuracy = Math.round(position.coords.accuracy);
          setGpsAccuracy(accuracy);

          // Call the parent logout function
          const result = await onLogout(position);
          
          // Set location status based on result
          if (result.success) {
            if (result.data?.locationVerified !== false) {
              setLocationStatus('inside');
            } else {
              setLocationStatus('outside');
            }
          } else {
            setLocationStatus('error');
          }
        },
        (error) => {
          setLocationStatus('error');
          onLogout(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }
  };

  const isLoggedIn = todayStatus?.status === 'checked-in';
  const isLoggedOut = todayStatus?.status === 'checked-out';

  // Show as disabled if not logged in
  const isDisabled = !isLoggedIn || isLoggedOut;

  return (
    <Card className={`border-2 shadow-lg transition-all ${
      isDisabled 
        ? 'border-gray-300 bg-gray-50 opacity-60' 
        : 'border-purple-200'
    }`}>
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <LogOut size={24} />
          Logout to End Your Day
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Disabled Message */}
        {isDisabled && !isLoggedIn && (
          <div className="rounded-lg p-4 flex items-center gap-3 bg-gray-100 border border-gray-300">
            <span className="text-gray-600 font-medium">⚠️ Login first to enable logout</span>
          </div>
        )}

        {/* Verifying Location Status */}
        {locationStatus === 'checking' && (
          <div className="rounded-lg p-4 flex items-center gap-3 bg-purple-50 border border-purple-200">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
            <span className="text-purple-800 font-medium">Verifying location...</span>
          </div>
        )}

        {/* Location Status */}
        {locationStatus && locationStatus !== 'checking' && (
          <div className={`rounded-lg p-4 flex items-center gap-3 ${
            locationStatus === 'inside' ? 'bg-green-50 border border-green-200' :
            locationStatus === 'outside' ? 'bg-red-50 border border-red-200' :
            'bg-yellow-50 border border-yellow-200'
          }`}>
            {locationStatus === 'inside' && (
              <>
                <CheckCircle className="text-green-600" size={24} />
                <span className="text-green-800 font-medium">✔ Inside Allowed Work Location</span>
              </>
            )}
            {locationStatus === 'outside' && (
              <>
                <XCircle className="text-red-600" size={24} />
                <span className="text-red-800 font-medium">✖ Outside Allowed Area</span>
              </>
            )}
            {locationStatus === 'error' && (
              <>
                <XCircle className="text-yellow-600" size={24} />
                <span className="text-yellow-800 font-medium">Unable to verify location</span>
              </>
            )}
          </div>
        )}

        {/* GPS Accuracy */}
        {gpsAccuracy && (
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
            <p className="text-sm text-purple-800">
              <span className="font-semibold">Location Accuracy:</span> {gpsAccuracy} meters
            </p>
          </div>
        )}

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          loading={loading}
          disabled={isDisabled}
          className="w-full py-4 text-lg font-semibold flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all"
          variant="secondary"
          size="large"
        >
          <LogOut size={24} />
          {isDisabled && !isLoggedIn ? 'Logout (Disabled)' : 'Logout Now'}
        </Button>

        {/* Info */}
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-xs text-gray-600 flex items-start gap-2">
            <MapPin size={14} className="mt-0.5 text-purple-600 flex-shrink-0" />
            <span>
              Your GPS location will be verified when logging out. Your working hours will be calculated automatically.
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LogoutCard;
