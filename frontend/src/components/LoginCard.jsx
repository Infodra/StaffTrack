import { useState } from 'react';
import { MapPin, CheckCircle, XCircle } from 'lucide-react';
import { Button } from './Button';
import { Card, CardHeader, CardTitle, CardContent } from './Card';

const LoginCard = ({ onLogin, loading, todayStatus }) => {
  const [locationStatus, setLocationStatus] = useState(null);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);

  const handleLogin = async () => {
    setLocationStatus('checking');
    setGpsAccuracy(null);

    // Get location first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const accuracy = Math.round(position.coords.accuracy);
          setGpsAccuracy(accuracy);

          // Call the parent login function
          const result = await onLogin(position);
          
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
          onLogin(null);
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

  if (isLoggedIn || isLoggedOut) {
    return null;
  }

  return (
    <Card className="border-2 border-blue-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <MapPin size={24} />
          Login to Start Your Day
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Verifying Location Status */}
        {locationStatus === 'checking' && (
          <div className="rounded-lg p-4 flex items-center gap-3 bg-blue-50 border border-blue-200">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-blue-800 font-medium">Verifying location...</span>
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
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Location Accuracy:</span> {gpsAccuracy} meters
            </p>
          </div>
        )}

        {/* Login Button */}
        <Button
          onClick={handleLogin}
          loading={loading}
          className="w-full py-4 text-lg font-semibold flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all"
          size="large"
        >
          <MapPin size={24} />
          Login Now
        </Button>

        {/* Info */}
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-xs text-gray-600 flex items-start gap-2">
            <MapPin size={14} className="mt-0.5 text-blue-600 flex-shrink-0" />
            <span>
              Your GPS location will be verified when logging in. Please ensure location access is enabled.
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginCard;
