import React from 'react';

export const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="animate-gradient-slow absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-blue-950 dark:via-gray-900 dark:to-blue-900"></div>
      <div className="absolute inset-0">
        <div className="animate-float-slow absolute -right-16 -top-16 size-32 rounded-full bg-blue-200/20 dark:bg-blue-400/10"></div>
        <div className="animate-float-medium absolute -left-24 top-1/3 size-48 rounded-full bg-blue-100/20 dark:bg-blue-400/10"></div>
        <div className="animate-float-fast absolute bottom-1/4 right-1/4 size-24 rounded-full bg-blue-300/20 dark:bg-blue-400/10"></div>
        <div className="animate-float-slow absolute -bottom-16 -left-16 size-36 rounded-full bg-blue-300/20 dark:bg-blue-400/10"></div>
      </div>
      <div className="absolute inset-0 backdrop-blur-[100px]"></div>
    </div>
  );
};
