'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface TutorialState {
  hasSeenReasoningTutorial: boolean;
  hasSeenWebSearchTutorial: boolean;
  setHasSeenReasoningTutorial: (seen: boolean) => void;
  setHasSeenWebSearchTutorial: (seen: boolean) => void;
}

const TutorialContext = createContext<TutorialState | undefined>(undefined);

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [hasSeenReasoningTutorial, setHasSeenReasoningTutorial] = useState(false);
  const [hasSeenWebSearchTutorial, setHasSeenWebSearchTutorial] = useState(false);

  // Load tutorial state from localStorage on mount
  useEffect(() => {
    const savedReasoning = localStorage.getItem('hasSeenReasoningTutorial');
    const savedWebSearch = localStorage.getItem('hasSeenWebSearchTutorial');
    
    if (savedReasoning === 'true') {
      setHasSeenReasoningTutorial(true);
    }
    if (savedWebSearch === 'true') {
      setHasSeenWebSearchTutorial(true);
    }
  }, []);

  // Save to localStorage when state changes
  const handleSetReasoningTutorial = (seen: boolean) => {
    setHasSeenReasoningTutorial(seen);
    localStorage.setItem('hasSeenReasoningTutorial', seen.toString());
  };

  const handleSetWebSearchTutorial = (seen: boolean) => {
    setHasSeenWebSearchTutorial(seen);
    localStorage.setItem('hasSeenWebSearchTutorial', seen.toString());
  };

  return (
    <TutorialContext.Provider
      value={{
        hasSeenReasoningTutorial,
        hasSeenWebSearchTutorial,
        setHasSeenReasoningTutorial: handleSetReasoningTutorial,
        setHasSeenWebSearchTutorial: handleSetWebSearchTutorial,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
} 