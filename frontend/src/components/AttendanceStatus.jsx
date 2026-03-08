import { Badge } from './Badge';

const AttendanceStatus = ({ status, className = '' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'not-checked-in':
        return {
          text: 'Not Logged In',
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-300',
          icon: '⏳'
        };
      case 'checked-in':
        return {
          text: 'Logged In',
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          borderColor: 'border-green-300',
          icon: '✓'
        };
      case 'checked-out':
        return {
          text: 'Logged Out',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-300',
          icon: '✓'
        };
      default:
        return {
          text: 'Unknown',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-300',
          icon: '?'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`inline-flex items-center gap-2 px-5 py-3 rounded-full border-2 ${config.bgColor} ${config.textColor} ${config.borderColor} font-semibold text-lg shadow-sm ${className}`}>
      <span className="text-xl">{config.icon}</span>
      <span>{config.text}</span>
    </div>
  );
};

export default AttendanceStatus;
