import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export const Alert = ({ type = 'info', message, onClose, className = '' }) => {
  const types = {
    success: {
      bg: 'bg-green-50 border-green-200',
      text: 'text-green-800',
      icon: <CheckCircle className="text-green-600" size={20} />
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-800',
      icon: <AlertCircle className="text-red-600" size={20} />
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-200',
      text: 'text-yellow-800',
      icon: <AlertCircle className="text-yellow-600" size={20} />
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-800',
      icon: <Info className="text-blue-600" size={20} />
    }
  };

  const style = types[type];

  if (!message) return null;

  return (
    <div className={`${style.bg} ${style.text} border rounded-lg p-4 flex items-start gap-3 ${className}`}>
      {style.icon}
      <p className="flex-1 text-sm">{message}</p>
      {onClose && (
        <button onClick={onClose} className="text-current hover:opacity-70">
          <X size={16} />
        </button>
      )}
    </div>
  );
};
