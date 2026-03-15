import { useState, useCallback } from 'react';
import { attendanceService } from '../services/apiService';
import { useGeolocation } from './useGeolocation';

/**
 * Hook to handle attendance login and logout
 */
export const useAttendance = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getLocation } = useGeolocation();

  const login = useCallback(async (coords) => {
    try {
      setLoading(true);
      setError(null);

      // Use provided coordinates or fetch GPS location
      const location = coords || await getLocation();

      // Send login request
      const response = await attendanceService.login(
        location.latitude,
        location.longitude,
        location.accuracy
      );

      setLoading(false);
      return { success: true, data: response.data };
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [getLocation]);

  const logout = useCallback(async (coords) => {
    try {
      setLoading(true);
      setError(null);

      // Use provided coordinates or fetch GPS location
      const location = coords || await getLocation();

      // Send logout request
      const response = await attendanceService.logout(
        location.latitude,
        location.longitude,
        location.accuracy
      );

      setLoading(false);
      return { success: true, data: response.data };
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || err.message || 'Logout failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [getLocation]);

  return { login, logout, loading, error };
};
