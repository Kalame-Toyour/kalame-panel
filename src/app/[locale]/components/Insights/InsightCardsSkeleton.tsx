// components/InsightCardsSkeleton.tsx

import React from 'react';

const InsightCardsSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="mb-4 h-8 w-48 animate-pulse justify-end rounded bg-gray-200 text-right dark:bg-gray-700"></div>
      <div className="grid grid-cols-2 justify-items-center gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array.from({ length: 4 })].map((_, index) => (
          <div key={index} className="h-56 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700">
            <div className="flex h-full flex-col justify-between p-4">
              <div className="space-y-2">
                <div className="h-4 w-3/4 rounded bg-gray-300 dark:bg-gray-600"></div>
                <div className="h-4 w-1/2 rounded bg-gray-300 dark:bg-gray-600"></div>
              </div>
              <div className="mx-auto size-8 rounded-full bg-gray-300 dark:bg-gray-600"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsightCardsSkeleton;
