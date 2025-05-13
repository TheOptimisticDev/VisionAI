
import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex justify-center">
      <div
        className={`animate-spin rounded-full border-4 border-gray-300 border-t-blue-500 ${sizeClasses[size]}`}
      />
    </div>
  );
};
