'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ModelConfig, getDefaultModel, ALL_MODELS } from '@/lib/models';

interface ModelContextType {
  activeModel: ModelConfig;
  setActiveModel: (model: ModelConfig) => void;
  availableModels: ModelConfig[];
  isLoading: boolean;
  error: string | null;
  switchModel: (modelId: string) => Promise<boolean>;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

interface ModelProviderProps {
  children: ReactNode;
}

export function ModelProvider({ children }: ModelProviderProps) {
  const [activeModel, setActiveModelState] = useState<ModelConfig>(getDefaultModel());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved model from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedModelId = localStorage.getItem('active-model-id');
      if (savedModelId) {
        const savedModel = ALL_MODELS.find(model => model.id === savedModelId);
        if (savedModel) {
          setActiveModelState(savedModel);
        }
      }
    }
  }, []);

  const setActiveModel = (model: ModelConfig) => {
    setActiveModelState(model);
    setError(null);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('active-model-id', model.id);
    }
  };

  const switchModel = async (modelId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const model = ALL_MODELS.find(m => m.id === modelId);
      if (!model) {
        throw new Error(`Model ${modelId} not found`);
      }

      // Simulate API key validation (in real app, you'd validate the key)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setActiveModel(model);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch model');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value: ModelContextType = {
    activeModel,
    setActiveModel,
    availableModels: ALL_MODELS,
    isLoading,
    error,
    switchModel
  };

  return (
    <ModelContext.Provider value={value}>
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

// Hook for getting models by provider
export function useModelsByProvider(provider: 'openai' | 'deepseek' | 'googleai') {
  const { availableModels } = useModel();
  return availableModels.filter(model => model.provider === provider);
}

// Hook for getting latest models only
export function useLatestModels() {
  const { availableModels } = useModel();
  return availableModels.filter(model => model.isLatest);
}
