import React from 'react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-16 animate-fade-in">
      <div className="flex gap-8">
        <div className="loading-dot" />
        <div className="loading-dot" />
        <div className="loading-dot" />
      </div>
      <p className="text-body text-text-muted">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
