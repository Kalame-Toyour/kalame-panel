'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type SidebarContextType = {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (value: boolean) => void;
};

const SidebarContext = createContext<SidebarContextType>({
  isSidebarCollapsed: false,
  setIsSidebarCollapsed: () => {}
});

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ isSidebarCollapsed, setIsSidebarCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = (): SidebarContextType => {
  return useContext(SidebarContext);
};
