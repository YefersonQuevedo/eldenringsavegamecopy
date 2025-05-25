import React from 'react';

export const Spinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center my-4" role="status" aria-label="Loading save data...">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
      <p className="ml-3 text-teal-400">Loading save data...</p>
    </div>
  );
};