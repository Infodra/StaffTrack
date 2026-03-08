import { Clock, LogOut as LogOutIcon, CheckCircle } from 'lucide-react';
import { Card } from './Card';
import { formatTime, formatHours } from '../utils/helpers';

const WorkingHoursCard = ({ todayStatus, loading }) => {
  if (loading) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Check In Time */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 shadow-md hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-blue-600 rounded-lg p-2">
            <Clock size={24} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Check In</span>
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {todayStatus?.check_in_time ? formatTime(todayStatus.check_in_time) : '--:--'}
        </p>
        {todayStatus?.check_in_time && (
          <p className="text-xs text-blue-600 mt-1">✓ Recorded</p>
        )}
      </Card>

      {/* Check Out Time */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 shadow-md hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-purple-600 rounded-lg p-2">
            <LogOutIcon size={24} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Check Out</span>
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {todayStatus?.check_out_time ? formatTime(todayStatus.check_out_time) : '--:--'}
        </p>
        {todayStatus?.check_out_time && (
          <p className="text-xs text-purple-600 mt-1">✓ Recorded</p>
        )}
      </Card>

      {/* Working Hours */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 shadow-md hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-green-600 rounded-lg p-2">
            <CheckCircle size={24} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Working Hours</span>
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {todayStatus?.working_hours ? formatHours(todayStatus.working_hours) : '0h 0m'}
        </p>
        {todayStatus?.working_hours > 0 && (
          <p className="text-xs text-green-600 mt-1">📊 Today's Total</p>
        )}
      </Card>
    </div>
  );
};

export default WorkingHoursCard;
