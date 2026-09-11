import React from 'react';
import { UserCircle } from 'lucide-react';
import { getAvatarUrl } from '../../utils';

interface AvatarProps {
  url?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ url, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`relative rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shrink-0 ${currentSize} ${className}`}>
      {url ? (
        <img 
          src={getAvatarUrl(url)} 
          alt="Avatar" 
          className="w-full h-full object-cover" 
        />
      ) : (
        <UserCircle className="w-full h-full text-gray-400 p-1" />
      )}
    </div>
  );
};
