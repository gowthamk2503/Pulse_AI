import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 'md', message = 'Processing...' }) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
      <Loader2 className={`${sizeMap[size] || 'w-6 h-6'} text-[#2457D6] animate-spin`} />
      {message && <p className="text-sm text-[#66758A] font-medium">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
