import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle, Eye, Archive } from 'lucide-react';

export type StatusType = 'Active' | 'Inactive' | 'Pending' | 'Applied' | 'Under Review' | 'Shortlisted' | 'Interview' | 'Selected' | 'Rejected' | string;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusStyles = (statusStr: string) => {
    switch (statusStr) {
      case 'Active':
      case 'Selected':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Inactive':
      case 'Rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Pending':
      case 'Applied':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Under Review':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Shortlisted':
      case 'Interview':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (statusStr: string) => {
    switch (statusStr) {
      case 'Active':
      case 'Selected':
        return <CheckCircle2 className="w-3.5 h-3.5 mr-1" />;
      case 'Inactive':
      case 'Rejected':
        return <XCircle className="w-3.5 h-3.5 mr-1" />;
      case 'Pending':
      case 'Applied':
        return <Clock className="w-3.5 h-3.5 mr-1" />;
      case 'Under Review':
        return <Eye className="w-3.5 h-3.5 mr-1" />;
      case 'Shortlisted':
      case 'Interview':
        return <AlertCircle className="w-3.5 h-3.5 mr-1" />;
      default:
        return <Archive className="w-3.5 h-3.5 mr-1" />;
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusStyles(status)} ${className}`}>
      {getStatusIcon(status)}
      {status}
    </span>
  );
};
