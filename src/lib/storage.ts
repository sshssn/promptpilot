/**
 * Persistent storage utilities for PromptPilot
 * Handles different data types with appropriate storage mechanisms
 */

// Types for different storage needs
export interface PromptData {
  id: string;
  originalPrompt?: string;
  improvedPrompt?: string;
  context?: string;
  files?: FileData[];
  timestamp: number;
  type: 'generated' | 'improved' | 'analyzed' | 'rewritten' | 'evaluated';
}

export interface FileData {
  name: string;
  mimeType: string;
  data: string; // base64
  size: number;
}

export interface AnalysisResult {
  id: string;
  promptId: string;
  summary: string;
  improvements: Array<{
    category: string;
    description: string;
    impact: string;
  }>;
  metrics: {
    clarityScore: number;
    specificityScore: number;
    structureScore: number;
    overallScore: number;
  };
  beforeAfterAnalysis: {
    beforeStrengths: string[];
    beforeWeaknesses: string[];
    afterStrengths: string[];
    keyChanges: string[];
  };
  recommendations: string[];
  timestamp: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  autoAnalyze: boolean;
  maxFileSize: number;
  maxHistoryItems: number;
}

// Storage keys
const STORAGE_KEYS = {
  PROMPTS: 'promptpilot_prompts',
  ANALYSES: 'promptpilot_analyses',
  PREFERENCES: 'promptpilot_preferences',
  RECENT_PROMPTS: 'promptpilot_recent',
  FAVORITES: 'promptpilot_favorites',
} as const;

// Utility functions
export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// LocalStorage utilities
export const localStorage = {
  // Generic methods
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue || null;
    }
  },

  set<T>(key: string, value: T): boolean {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
      return false;
    }
  },

  remove(key: string): boolean {
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
      return false;
    }
  },

  clear(): boolean {
    try {
      window.localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  },

  // Size management
  getSize(): number {
    let total = 0;
    for (const key in window.localStorage) {
      if (window.localStorage.hasOwnProperty(key)) {
        total += window.localStorage[key].length + key.length;
      }
    }
    return total;
  },

  // Check if we're approaching storage limits
  isNearLimit(): boolean {
    const size = this.getSize();
    const limit = 5 * 1024 * 1024; // 5MB
    return size > limit * 0.8; // 80% of limit
  }
};

// Prompt storage
export const promptStorage = {
  // Save a new prompt
  save(prompt: Omit<PromptData, 'id' | 'timestamp'>): string {
    const id = generateId();
    const promptData: PromptData = {
      ...prompt,
      id,
      timestamp: Date.now(),
    };

    // Save to main storage
    const prompts = this.getAll();
    prompts.push(promptData);
    localStorage.set(STORAGE_KEYS.PROMPTS, prompts);

    // Update recent prompts (keep last 10)
    this.updateRecent(promptData);

    return id;
  },

  // Get all prompts
  getAll(): PromptData[] {
    return localStorage.get(STORAGE_KEYS.PROMPTS, []);
  },

  // Get recent prompts
  getRecent(limit: number = 10): PromptData[] {
    return localStorage.get(STORAGE_KEYS.RECENT_PROMPTS, []).slice(0, limit);
  },

  // Update recent prompts list
  updateRecent(prompt: PromptData): void {
    const recent = this.getRecent(20); // Keep more in recent
    const filtered = recent.filter(p => p.id !== prompt.id);
    const updated = [prompt, ...filtered].slice(0, 10);
    localStorage.set(STORAGE_KEYS.RECENT_PROMPTS, updated);
  },

  // Get prompt by ID
  getById(id: string): PromptData | null {
    const prompts = this.getAll();
    return prompts.find(p => p.id === id) || null;
  },

  // Delete prompt
  delete(id: string): boolean {
    const prompts = this.getAll();
    const filtered = prompts.filter(p => p.id !== id);
    localStorage.set(STORAGE_KEYS.PROMPTS, filtered);
    
    // Also remove from recent
    const recent = this.getRecent(20);
    const recentFiltered = recent.filter(p => p.id !== id);
    localStorage.set(STORAGE_KEYS.RECENT_PROMPTS, recentFiltered);
    
    return true;
  },

  // Search prompts
  search(query: string): PromptData[] {
    const prompts = this.getAll();
    const lowercaseQuery = query.toLowerCase();
    return prompts.filter(p => 
      p.originalPrompt?.toLowerCase().includes(lowercaseQuery) ||
      p.improvedPrompt?.toLowerCase().includes(lowercaseQuery) ||
      p.context?.toLowerCase().includes(lowercaseQuery)
    );
  }
};

// Analysis storage
export const analysisStorage = {
  // Save analysis result
  save(analysis: Omit<AnalysisResult, 'id' | 'timestamp'>): string {
    const id = generateId();
    const analysisData: AnalysisResult = {
      ...analysis,
      id,
      timestamp: Date.now(),
    };

    const analyses = this.getAll();
    analyses.push(analysisData);
    localStorage.set(STORAGE_KEYS.ANALYSES, analyses);

    return id;
  },

  // Get all analyses
  getAll(): AnalysisResult[] {
    return localStorage.get(STORAGE_KEYS.ANALYSES, []);
  },

  // Get analysis by prompt ID
  getByPromptId(promptId: string): AnalysisResult | null {
    const analyses = this.getAll();
    return analyses.find(a => a.promptId === promptId) || null;
  },

  // Get recent analyses
  getRecent(limit: number = 5): AnalysisResult[] {
    const analyses = this.getAll();
    return analyses
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }
};

// User preferences storage
export const preferencesStorage = {
  // Get preferences
  get(): UserPreferences {
    return localStorage.get(STORAGE_KEYS.PREFERENCES, {
      theme: 'system',
      autoAnalyze: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxHistoryItems: 100,
    });
  },

  // Update preferences
  update(updates: Partial<UserPreferences>): boolean {
    const current = this.get();
    const updated = { ...current, ...updates };
    return localStorage.set(STORAGE_KEYS.PREFERENCES, updated);
  },

  // Reset to defaults
  reset(): boolean {
    return localStorage.remove(STORAGE_KEYS.PREFERENCES);
  }
};

// Favorites storage
export const favoritesStorage = {
  // Add to favorites
  add(promptId: string): boolean {
    const favorites = this.getAll();
    if (!favorites.includes(promptId)) {
      favorites.push(promptId);
      return localStorage.set(STORAGE_KEYS.FAVORITES, favorites);
    }
    return true;
  },

  // Remove from favorites
  remove(promptId: string): boolean {
    const favorites = this.getAll();
    const filtered = favorites.filter(id => id !== promptId);
    return localStorage.set(STORAGE_KEYS.FAVORITES, filtered);
  },

  // Get all favorites
  getAll(): string[] {
    return localStorage.get(STORAGE_KEYS.FAVORITES, []);
  },

  // Check if favorited
  isFavorite(promptId: string): boolean {
    const favorites = this.getAll();
    return favorites.includes(promptId);
  },

  // Get favorite prompts
  getFavoritePrompts(): PromptData[] {
    const favorites = this.getAll();
    const prompts = promptStorage.getAll();
    return prompts.filter(p => favorites.includes(p.id));
  }
};

// Storage management utilities
export const storageManager = {
  // Get storage usage info
  getUsageInfo() {
    const prompts = promptStorage.getAll();
    const analyses = analysisStorage.getAll();
    const totalSize = localStorage.getSize();
    
    return {
      totalSize,
      promptsCount: prompts.length,
      analysesCount: analyses.length,
      isNearLimit: localStorage.isNearLimit(),
    };
  },

  // Clean up old data
  cleanup(olderThanDays: number = 30): number {
    const cutoff = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    let removedCount = 0;

    // Clean up old prompts
    const prompts = promptStorage.getAll();
    const recentPrompts = prompts.filter(p => p.timestamp > cutoff);
    if (recentPrompts.length !== prompts.length) {
      localStorage.set(STORAGE_KEYS.PROMPTS, recentPrompts);
      removedCount += prompts.length - recentPrompts.length;
    }

    // Clean up old analyses
    const analyses = analysisStorage.getAll();
    const recentAnalyses = analyses.filter(a => a.timestamp > cutoff);
    if (recentAnalyses.length !== analyses.length) {
      localStorage.set(STORAGE_KEYS.ANALYSES, recentAnalyses);
      removedCount += analyses.length - recentAnalyses.length;
    }

    return removedCount;
  },

  // Export data
  exportData() {
    return {
      prompts: promptStorage.getAll(),
      analyses: analysisStorage.getAll(),
      preferences: preferencesStorage.get(),
      favorites: favoritesStorage.getAll(),
      exportDate: new Date().toISOString(),
    };
  },

  // Import data
  importData(data: any): boolean {
    try {
      if (data.prompts) localStorage.set(STORAGE_KEYS.PROMPTS, data.prompts);
      if (data.analyses) localStorage.set(STORAGE_KEYS.ANALYSES, data.analyses);
      if (data.preferences) localStorage.set(STORAGE_KEYS.PREFERENCES, data.preferences);
      if (data.favorites) localStorage.set(STORAGE_KEYS.FAVORITES, data.favorites);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
};
