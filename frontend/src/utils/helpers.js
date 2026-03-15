/**
 * Format date to readable string
 */
export const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format date with full details (weekday, month, day, year)
 */
export const formatFullDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format time to readable string
 */
export const formatTime = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Format time with seconds
 */
export const formatTimeWithSeconds = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

/**
 * Extract tenant/company identifier from hostname
 * Examples:
 * - tecinfo.st.infodra.ai → tecinfo
 * - company1.st.infodra.ai → company1
 * - localhost → null (development mode)
 */
export const getTenantFromHostname = () => {
  const hostname = window.location.hostname;
  
  // Support subdomain.localhost for local dev (e.g., tecinfo.localhost)
  if (hostname.endsWith('.localhost')) {
    return hostname.split('.')[0];
  }
  
  // Plain localhost or 127.0.0.1 = no tenant (super admin / default)
  if (hostname === 'localhost' || hostname.includes('127.0.0.1')) {
    return null;
  }

  // Vercel preview URLs: stafftrack-xxx.vercel.app (no tenant)
  if (hostname.endsWith('.vercel.app')) {
    return null;
  }

  // Render URLs: xxx.onrender.com (no tenant)
  if (hostname.endsWith('.onrender.com')) {
    return null;
  }

  // stafftrack.infodra.ai or www.stafftrack.infodra.ai = super admin domain (no tenant)
  if (hostname === 'stafftrack.infodra.ai' || hostname === 'www.stafftrack.infodra.ai') {
    return null;
  }
  
  // Extract subdomain from hostname
  // tecinfo.stafftrack.infodra.ai → tenant = 'tecinfo'
  const parts = hostname.split('.');
  
  // subdomain.stafftrack.infodra.ai = 4 parts, first is tenant
  // But skip 'www' — www.stafftrack.infodra.ai is not a tenant
  if (parts.length >= 4 && parts[0] !== 'www') {
    return parts[0];
  }

  return null;
};

/**
 * Get company display name from tenant
 */
export const getCompanyDisplayName = (tenant) => {
  if (!tenant) return 'StaffTracker';
  
  // Capitalize first letter of each word
  return tenant
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Check if running in multi-tenant mode
 */
export const isMultiTenantMode = () => {
  const hostname = window.location.hostname;
  return !hostname.includes('localhost') && !hostname.includes('127.0.0.1');
};

/**
 * Format date and time
 */
export const formatDateTime = (date) => {
  if (!date) return '-';
  return `${formatDate(date)} ${formatTime(date)}`;
};

/**
 * Format working hours
 */
export const formatHours = (hours) => {
  if (!hours) return '00h 00m';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
};

/**
 * Get greeting based on time
 */
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

/**
 * Calculate time difference in hours
 */
export const calculateHours = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  const diff = new Date(endTime) - new Date(startTime);
  return Math.round((diff / (1000 * 60 * 60)) * 100) / 100;
};

/**
 * Format GPS accuracy
 */
export const formatAccuracy = (accuracy) => {
  if (!accuracy) return 'Unknown';
  const meters = Math.round(accuracy);
  if (meters < 1000) {
    return `${meters} meters`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

/**
 * Get status badge color
 */
export const getStatusColor = (status) => {
  const colors = {
    present: 'bg-green-100 text-green-800',
    absent: 'bg-red-100 text-red-800',
    'half-day': 'bg-yellow-100 text-yellow-800',
    'on-leave': 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    suspended: 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Get company logo path based on company name or tenant
 */
export const getCompanyLogo = (companyNameOrTenant) => {
  if (!companyNameOrTenant) return '/logos/infodra.png';
  
  const normalized = companyNameOrTenant.toLowerCase().trim();
  const logoMap = {
    'tecinfo': '/logos/Tecinfo-logo.png',
    'tec001': '/logos/Tecinfo-logo.png',
    'infodra': '/logos/infodra.png',
    'infodra technologies': '/logos/infodra.png',
  };
  
  return logoMap[normalized] || null;
};

/**
 * Get branding info for login/dashboard based on tenant subdomain
 * No tenant (localhost) = Infodra super admin branding
 * With tenant = company-specific branding
 */
export const getCompanyBranding = (tenant, companyData) => {
  const hostname = window.location.hostname;

  // stafftrack.infodra.ai = Infodra super admin platform
  if (hostname === 'stafftrack.infodra.ai') {
    return {
      name: 'StaffTrack',
      subtitle: 'by Infodra Technologies',
      logo: '/logos/infodra.png',
      tagline: 'Platform Administration',
    };
  }

  // If no tenant (localhost) → Tecinfo branding (local dev default)
  if (!tenant) {
    return {
      name: 'Tecinfo',
      subtitle: 'Employee Attendance System',
      logo: '/logos/Tecinfo-logo.png',
      tagline: 'Sign in to access your dashboard',
    };
  }

  // Tenant-specific branding
  const name = companyData?.name || getCompanyDisplayName(tenant);
  const logo = getCompanyLogo(tenant) || getCompanyLogo(name);
  
  return {
    name,
    subtitle: 'Employee Attendance System',
    logo,
    tagline: 'Sign in to access your dashboard',
  };
};
