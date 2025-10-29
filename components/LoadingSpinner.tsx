import React from 'react';

interface LoadingSpinnerProps {
  message: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl">
      <div className="w-16 h-16 border-4 border-t-4 border-slate-600 border-t-amber-400 rounded-full animate-spin"></div>
      <p className="mt-6 text-lg font-medium text-slate-300 tracking-wide">{message}</p>
    </div>
  );
};

export default LoadingSpinner;