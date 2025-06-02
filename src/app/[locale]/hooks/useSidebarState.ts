'use client';

import { useState, useEffect } from 'react';

// Define the custom event type
type SidebarStateChangeEvent = CustomEvent<{ isCollapsed: boolean }>;

// Custom hook to get sidebar state
export const useSidebarState = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Function to handle sidebar state changes
    const handleSidebarStateChange = (event: SidebarStateChangeEvent) => {
      setIsSidebarCollapsed(event.detail.isCollapsed);
    };

    // Add event listener for sidebar state changes
    window.addEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);

    // Clean up
    return () => {
      window.removeEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    };
  }, []);

  return { isSidebarCollapsed };
};
