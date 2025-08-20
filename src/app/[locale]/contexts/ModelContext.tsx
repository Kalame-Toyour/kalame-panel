'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { LanguageModel } from '../components/ModelDropdown';

interface ModelContextType {
  selectedModel: LanguageModel | null;
  setSelectedModel: (model: LanguageModel | null) => void;
  models: LanguageModel[];
  setModels: (models: LanguageModel[]) => void;
  modelsLoading: boolean;
  setModelsLoading: (loading: boolean) => void;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ children }: { children: React.ReactNode }) {
  const [selectedModel, setSelectedModel] = useState<LanguageModel | null>(null);
  const [models, setModels] = useState<LanguageModel[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);

  // Load selected model from localStorage on mount
  useEffect(() => {
    try {
      const savedModel = localStorage.getItem('selectedModel');
      if (savedModel) {
        const parsedModel = JSON.parse(savedModel);
        setSelectedModel(parsedModel);
      }
    } catch (error) {
      console.error('Error loading selected model from localStorage:', error);
    }
  }, []);

  // Save selected model to localStorage whenever it changes
  const handleSetSelectedModel = (model: LanguageModel | null) => {
    setSelectedModel(model);
    if (model) {
      try {
        localStorage.setItem('selectedModel', JSON.stringify(model));
      } catch (error) {
        console.error('Error saving selected model to localStorage:', error);
      }
    } else {
      localStorage.removeItem('selectedModel');
    }
  };

  return (
    <ModelContext.Provider
      value={{
        selectedModel,
        setSelectedModel: handleSetSelectedModel,
        models,
        setModels,
        modelsLoading,
        setModelsLoading,
      }}
    >
      {children}
    </ModelContext.Provider>
  );
}

export function useModel() {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error('useModel must be used within a ModelProvider');
  }
  return context;
} 