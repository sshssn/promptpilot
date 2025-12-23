'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { usePrompts } from '@/hooks/use-storage';
import { useAnalyses } from '@/hooks/use-storage';
import { usePreferences } from '@/hooks/use-storage';
import { useFavorites } from '@/hooks/use-storage';
import { useStorageManager } from '@/hooks/use-storage';

interface StorageContextType {
  prompts: ReturnType<typeof usePrompts>;
  analyses: ReturnType<typeof useAnalyses>;
  preferences: ReturnType<typeof usePreferences>;
  favorites: ReturnType<typeof useFavorites>;
  storageManager: ReturnType<typeof useStorageManager>;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

interface StorageProviderProps {
  children: ReactNode;
}

export function StorageProvider({ children }: StorageProviderProps) {
  const prompts = usePrompts();
  const analyses = useAnalyses();
  const preferences = usePreferences();
  const favorites = useFavorites();
  const storageManager = useStorageManager();

  const value: StorageContextType = {
    prompts,
    analyses,
    preferences,
    favorites,
    storageManager,
  };

  return (
    <StorageContext.Provider value={value}>
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage() {
  const context = useContext(StorageContext);
  if (context === undefined) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
}
