/**
 * Calculate the distance between two GPS coordinates using the Haversine formula
 * 
 * The Haversine formula determines the great-circle distance between two points 
 * on a sphere given their longitudes and latitudes. This is useful for calculating
 * distances between GPS coordinates on Earth.
 * 
 * Formula:
 * a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
 * c = 2 ⋅ atan2(√a, √(1−a))
 * d = R ⋅ c
 * 
 * Where:
 * - φ is latitude
 * - λ is longitude
 * - R is earth's radius (mean radius = 6,371km = 6,371,000m)
 * - Δ represents the difference between coordinates
 * 
 * @param {number} latitude1 - Latitude of first point in decimal degrees (-90 to 90)
 * @param {number} longitude1 - Longitude of first point in decimal degrees (-180 to 180)
 * @param {number} latitude2 - Latitude of second point in decimal degrees (-90 to 90)
 * @param {number} longitude2 - Longitude of second point in decimal degrees (-180 to 180)
 * @returns {number} Distance between the two points in meters
 * 
 * @example
 * // Calculate distance between New York and Los Angeles
 * const distance = calculateDistanceHaversine(40.7128, -74.0060, 34.0522, -118.2437);
 * console.log(distance); // approximately 3,944,420 meters (3,944 km)
 * 
 * @example
 * // Check if employee is within office geofence (100 meters)
 * const officeLatitude = 37.7749;
 * const officeLongitude = -122.4194;
 * const employeeLatitude = 37.7750;
 * const employeeLongitude = -122.4195;
 * const geofenceRadius = 100; // meters
 * 
 * const distance = calculateDistanceHaversine(
 *   officeLatitude, 
 *   officeLongitude, 
 *   employeeLatitude, 
 *   employeeLongitude
 * );
 * 
 * const isWithinGeofence = distance <= geofenceRadius;
 * console.log(`Employee is ${isWithinGeofence ? 'inside' : 'outside'} the geofence`);
 * console.log(`Distance: ${Math.round(distance)} meters`);
 */
function calculateDistanceHaversine(latitude1, longitude1, latitude2, longitude2) {
  // Validate input parameters
  if (
    typeof latitude1 !== 'number' || 
    typeof longitude1 !== 'number' ||
    typeof latitude2 !== 'number' || 
    typeof longitude2 !== 'number'
  ) {
    throw new TypeError('All parameters must be numbers');
  }

  if (latitude1 < -90 || latitude1 > 90 || latitude2 < -90 || latitude2 > 90) {
    throw new RangeError('Latitude must be between -90 and 90 degrees');
  }

  if (longitude1 < -180 || longitude1 > 180 || longitude2 < -180 || longitude2 > 180) {
    throw new RangeError('Longitude must be between -180 and 180 degrees');
  }

  // Earth's radius in meters (mean radius)
  const EARTH_RADIUS_METERS = 6371000;

  // Convert degrees to radians
  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  // Convert latitudes and longitudes to radians
  const φ1 = toRadians(latitude1);
  const φ2 = toRadians(latitude2);
  const Δφ = toRadians(latitude2 - latitude1);
  const Δλ = toRadians(longitude2 - longitude1);

  // Haversine formula
  const a = 
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * 
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Calculate distance in meters
  const distance = EARTH_RADIUS_METERS * c;

  return distance;
}

/**
 * Check if a point is within a geofence radius
 * 
 * @param {number} centerLat - Latitude of geofence center (e.g., office location)
 * @param {number} centerLon - Longitude of geofence center
 * @param {number} pointLat - Latitude of point to check (e.g., employee location)
 * @param {number} pointLon - Longitude of point to check
 * @param {number} radiusMeters - Geofence radius in meters
 * @returns {Object} Object with isInside boolean and distance in meters
 * 
 * @example
 * const result = isWithinGeofence(37.7749, -122.4194, 37.7750, -122.4195, 100);
 * console.log(result.isInside); // true or false
 * console.log(result.distance); // distance in meters
 */
function isWithinGeofence(centerLat, centerLon, pointLat, pointLon, radiusMeters) {
  const distance = calculateDistanceHaversine(centerLat, centerLon, pointLat, pointLon);
  
  return {
    isInside: distance <= radiusMeters,
    distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
    radiusMeters: radiusMeters
  };
}

// Export for use in Node.js (CommonJS)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateDistanceHaversine,
    isWithinGeofence
  };
}

// Export for use in ES6 modules
if (typeof exports !== 'undefined') {
  exports.calculateDistanceHaversine = calculateDistanceHaversine;
  exports.isWithinGeofence = isWithinGeofence;
}

// Example usage and tests
if (typeof window !== 'undefined' || require.main === module) {
  console.log('=== Haversine Distance Calculator ===\n');

  // Test 1: New York to Los Angeles
  console.log('Test 1: New York to Los Angeles');
  const nyToLa = calculateDistanceHaversine(40.7128, -74.0060, 34.0522, -118.2437);
  console.log(`Distance: ${Math.round(nyToLa)} meters (${Math.round(nyToLa / 1000)} km)\n`);

  // Test 2: Same location
  console.log('Test 2: Same location (should be 0)');
  const sameLocation = calculateDistanceHaversine(37.7749, -122.4194, 37.7749, -122.4194);
  console.log(`Distance: ${sameLocation} meters\n`);

  // Test 3: Geofence check - Employee within 100m
  console.log('Test 3: Geofence check - Employee 50m away from office');
  const office = { lat: 37.7749, lon: -122.4194 };
  const employee1 = { lat: 37.7753, lon: -122.4194 }; // ~45m north
  const geofence1 = isWithinGeofence(office.lat, office.lon, employee1.lat, employee1.lon, 100);
  console.log(`Distance: ${geofence1.distance} meters`);
  console.log(`Within geofence: ${geofence1.isInside}\n`);

  // Test 4: Geofence check - Employee outside 100m
  console.log('Test 4: Geofence check - Employee 200m away from office');
  const employee2 = { lat: 37.7767, lon: -122.4194 }; // ~200m north
  const geofence2 = isWithinGeofence(office.lat, office.lon, employee2.lat, employee2.lon, 100);
  console.log(`Distance: ${geofence2.distance} meters`);
  console.log(`Within geofence: ${geofence2.isInside}\n`);

  // Test 5: Very close points (1 meter apart approximately)
  console.log('Test 5: Very close points (~1 meter apart)');
  const closeDistance = calculateDistanceHaversine(37.7749, -122.4194, 37.77491, -122.4194);
  console.log(`Distance: ${Math.round(closeDistance * 100) / 100} meters\n`);
}
