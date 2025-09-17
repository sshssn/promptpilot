/**
 * React hooks for storage management
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  promptStorage, 
  analysisStorage, 
  preferencesStorage, 
  favoritesStorage,
  storageManager,
  type PromptData,
  type AnalysisResult,
  type UserPreferences
} from '@/lib/storage';

// Hook for managing prompts
export function usePrompts() {
  const [prompts, setPrompts] = useState<PromptData[]>([]);
  const [recentPrompts, setRecentPrompts] = useState<PromptData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPrompts = useCallback(() => {
    setLoading(true);
    try {
      const allPrompts = promptStorage.getAll();
      const recent = promptStorage.getRecent();
      setPrompts(allPrompts);
      setRecentPrompts(recent);
    } catch (error) {
      console.error('Error loading prompts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const savePrompt = useCallback((prompt: Omit<PromptData, 'id' | 'timestamp'>) => {
    try {
      const id = promptStorage.save(prompt);
      loadPrompts(); // Refresh the list
      return id;
    } catch (error) {
      console.error('Error saving prompt:', error);
      return null;
    }
  }, [loadPrompts]);

  const deletePrompt = useCallback((id: string) => {
    try {
      promptStorage.delete(id);
      loadPrompts(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error deleting prompt:', error);
      return false;
    }
  }, [loadPrompts]);

  const searchPrompts = useCallback((query: string) => {
    return promptStorage.search(query);
  }, []);

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  return {
    prompts,
    recentPrompts,
    loading,
    savePrompt,
    deletePrompt,
    searchPrompts,
    refresh: loadPrompts,
  };
}

// Hook for managing analyses
export function useAnalyses() {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAnalyses = useCallback(() => {
    setLoading(true);
    try {
      const allAnalyses = analysisStorage.getAll();
      setAnalyses(allAnalyses);
    } catch (error) {
      console.error('Error loading analyses:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveAnalysis = useCallback((analysis: Omit<AnalysisResult, 'id' | 'timestamp'>) => {
    try {
      const id = analysisStorage.save(analysis);
      loadAnalyses(); // Refresh the list
      return id;
    } catch (error) {
      console.error('Error saving analysis:', error);
      return null;
    }
  }, [loadAnalyses]);

  const getAnalysisByPromptId = useCallback((promptId: string) => {
    return analysisStorage.getByPromptId(promptId);
  }, []);

  useEffect(() => {
    loadAnalyses();
  }, [loadAnalyses]);

  return {
    analyses,
    loading,
    saveAnalysis,
    getAnalysisByPromptId,
    refresh: loadAnalyses,
  };
}

// Hook for managing user preferences
export function usePreferences() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPreferences = useCallback(() => {
    setLoading(true);
    try {
      const prefs = preferencesStorage.get();
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    try {
      const success = preferencesStorage.update(updates);
      if (success) {
        loadPreferences(); // Refresh
      }
      return success;
    } catch (error) {
      console.error('Error updating preferences:', error);
      return false;
    }
  }, [loadPreferences]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    preferences,
    loading,
    updatePreferences,
    refresh: loadPreferences,
  };
}

// Hook for managing favorites
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoritePrompts, setFavoritePrompts] = useState<PromptData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(() => {
    setLoading(true);
    try {
      const favIds = favoritesStorage.getAll();
      const favPrompts = favoritesStorage.getFavoritePrompts();
      setFavorites(favIds);
      setFavoritePrompts(favPrompts);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleFavorite = useCallback((promptId: string) => {
    try {
      const isFavorite = favoritesStorage.isFavorite(promptId);
      const success = isFavorite 
        ? favoritesStorage.remove(promptId)
        : favoritesStorage.add(promptId);
      
      if (success) {
        loadFavorites(); // Refresh
      }
      return success;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  }, [loadFavorites]);

  const isFavorite = useCallback((promptId: string) => {
    return favoritesStorage.isFavorite(promptId);
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  return {
    favorites,
    favoritePrompts,
    loading,
    toggleFavorite,
    isFavorite,
    refresh: loadFavorites,
  };
}

// Hook for storage management
export function useStorageManager() {
  const [usageInfo, setUsageInfo] = useState<any>(null);

  const loadUsageInfo = useCallback(() => {
    try {
      const info = storageManager.getUsageInfo();
      setUsageInfo(info);
    } catch (error) {
      console.error('Error loading usage info:', error);
    }
  }, []);

  const cleanup = useCallback((olderThanDays: number = 30) => {
    try {
      const removedCount = storageManager.cleanup(olderThanDays);
      loadUsageInfo(); // Refresh usage info
      return removedCount;
    } catch (error) {
      console.error('Error cleaning up storage:', error);
      return 0;
    }
  }, [loadUsageInfo]);

  const exportData = useCallback(() => {
    try {
      return storageManager.exportData();
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }, []);

  const importData = useCallback((data: any) => {
    try {
      const success = storageManager.importData(data);
      if (success) {
        loadUsageInfo(); // Refresh usage info
      }
      return success;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }, [loadUsageInfo]);

  useEffect(() => {
    loadUsageInfo();
  }, [loadUsageInfo]);

  return {
    usageInfo,
    cleanup,
    exportData,
    importData,
    refresh: loadUsageInfo,
  };
}
