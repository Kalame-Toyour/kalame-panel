import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Route = 'chat' | 'auth' | 'pricing' | 'profile' | 'settings' | 'about' | 'help' | 'image' | 'text-to-voice';

interface RouterContextType {
  currentRoute: Route;
  navigate: (route: Route) => void;
  goBack: () => boolean;
  history: Route[];
  canGoBack: () => boolean;
  isAtRoot: () => boolean;
  clearHistory: (route?: Route) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

interface RouterProviderProps {
  children: ReactNode;
  initialRoute?: Route;
}

export function RouterProvider({ children, initialRoute = 'chat' }: RouterProviderProps) {
  const [currentRoute, setCurrentRoute] = useState<Route>(initialRoute);
  const [history, setHistory] = useState<Route[]>([initialRoute]);

  const navigate = (route: Route) => {
    if (route === currentRoute) return;
    
    setCurrentRoute(route);
    setHistory(prev => {
      const newHistory = [...prev, route];
      if (newHistory.length > 10) {
        newHistory.splice(0, newHistory.length - 10);
      }
      return newHistory;
    });
  };

  const goBack = (): boolean => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      const previousRoute = newHistory[newHistory.length - 1];
      
      if (previousRoute) {
        setHistory(newHistory);
        setCurrentRoute(previousRoute);
        return true;
      }
    }
    return false;
  };

  const canGoBack = (): boolean => {
    return history.length > 1;
  };

  const isAtRoot = (): boolean => {
    return history.length === 1;
  };

  const clearHistory = (route?: Route) => {
    const targetRoute = route || currentRoute;
    setCurrentRoute(targetRoute);
    setHistory([targetRoute]);
  };

  return (
    <RouterContext.Provider value={{ 
      currentRoute, 
      navigate, 
      goBack, 
      history, 
      canGoBack, 
      isAtRoot,
      clearHistory
    }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (context === undefined) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
} 