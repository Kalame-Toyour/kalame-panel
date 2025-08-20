import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { LanguageModel } from '../components/ModelDropdown';

interface ModelContextType {
  selectedModel: LanguageModel | null;
  setSelectedModel: (model: LanguageModel) => void;
  models: LanguageModel[];
  setModels: (models: LanguageModel[]) => void;
  modelsLoading: boolean;
  setModelsLoading: (loading: boolean) => void;
  modelsLoaded: boolean;
  setModelsLoaded: (loaded: boolean) => void;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function useModel(): ModelContextType {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error('useModel must be used within a ModelProvider');
  }
  return context;
}

interface ModelProviderProps {
  children: ReactNode;
}

export function ModelProvider({ children }: ModelProviderProps) {
  const [selectedModel, setSelectedModel] = useState<LanguageModel | null>(null);
  const [models, setModels] = useState<LanguageModel[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const value: ModelContextType = {
    selectedModel,
    setSelectedModel,
    models,
    setModels,
    modelsLoading,
    setModelsLoading,
    modelsLoaded,
    setModelsLoaded,
  };

  return (
    <ModelContext.Provider value={value}>
      {children}
    </ModelContext.Provider>
  );
}