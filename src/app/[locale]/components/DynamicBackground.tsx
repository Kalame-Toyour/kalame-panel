'use client';

import React, { useEffect, useState } from 'react';

type DynamicBackgroundProps = {
  children: React.ReactNode;
};

const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return <div>{children}</div>;
  }

  return (
    <div

      className="chat-container min-h-screen transition-colors duration-300 dark:bg-gray-900"
    >
      {children}
    </div>
  );
};

export default DynamicBackground;
