import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { getGreeting } from '../utils/helpers';

const GreetingHeader = ({ user, company }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatFullDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatClock = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const getCompanyLogo = (companyName) => {
    if (!companyName) return null;
    
    const logoMap = {
      'tecinfo': '/logos/tecinfo.png',
      'techinfo': '/logos/tecinfo.png',
      'infodra': '/logos/infodra.png',
      'infodra technologies': '/logos/infodra.png'
    };
    
    const normalizedName = companyName?.toLowerCase().trim();
    return logoMap[normalizedName] || null;
  };

  const companyLogo = getCompanyLogo(company?.name);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-sm border border-blue-100 p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
        {/* Greeting Section */}
        <div className="flex-1">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            {getGreeting()}, {user?.name}! 👋
          </h1>
          <p className="text-lg text-gray-700 font-medium">
            {formatFullDate(currentTime)}
          </p>
        </div>

        {/* Clock and Logo Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Live Clock */}
          <div className="bg-white rounded-xl shadow-md px-6 py-4 border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
              <Clock size={16} />
              <span className="font-medium">Current Time</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 tabular-nums">
              {formatClock(currentTime)}
            </div>
          </div>

          {/* Company Logo */}
          {companyLogo && (
            <div className="bg-white rounded-xl shadow-md px-6 py-4 border border-gray-200">
              <img 
                src={companyLogo} 
                alt={company?.name} 
                className="h-14 sm:h-16 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GreetingHeader;
