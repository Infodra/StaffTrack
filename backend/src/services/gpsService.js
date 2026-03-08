/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param {Number} lat1 - Latitude of point 1
 * @param {Number} lon1 - Longitude of point 1
 * @param {Number} lat2 - Latitude of point 2
 * @param {Number} lon2 - Longitude of point 2
 * @returns {Number} Distance in meters
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in meters
  return distance;
};

/**
 * Check if a location is within the geofence
 * @param {Number} userLat - User's latitude
 * @param {Number} userLon - User's longitude
 * @param {Number} officeLat - Office latitude
 * @param {Number} officeLon - Office longitude
 * @param {Number} radius - Geofence radius in meters
 * @returns {Object} { isWithinGeofence: Boolean, distance: Number }
 */
const checkGeofence = (userLat, userLon, officeLat, officeLon, radius) => {
  const distance = calculateDistance(userLat, userLon, officeLat, officeLon);
  
  return {
    isWithinGeofence: distance <= radius,
    distance: Math.round(distance) // Round to nearest meter
  };
};

/**
 * Validate GPS coordinates
 * @param {Number} latitude - Latitude value
 * @param {Number} longitude - Longitude value
 * @returns {Boolean} True if valid
 */
const validateCoordinates = (latitude, longitude) => {
  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    isNaN(latitude) ||
    isNaN(longitude)
  ) {
    return false;
  }

  if (latitude < -90 || latitude > 90) {
    return false;
  }

  if (longitude < -180 || longitude > 180) {
    return false;
  }

  return true;
};

module.exports = {
  calculateDistance,
  checkGeofence,
  validateCoordinates
};
