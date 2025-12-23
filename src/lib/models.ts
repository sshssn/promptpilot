export interface ModelConfig {
  id: string;
  name: string;
  provider: 'openai' | 'deepseek' | 'googleai';
  apiEndpoint: string;
  icon: string;
  description: string;
  maxTokens: number;
  capabilities: string[];
  costPerToken?: number;
  isLatest?: boolean;
  temperatureRestrictions?: {
    min?: number;
    max?: number;
    default?: number;
    supportedValues?: number[];
  };
}

export const OPENAI_MODELS: ModelConfig[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    icon: '/openai-color.svg',
    description: 'GPT-4 Omni model with multimodal capabilities',
    maxTokens: 128000,
    capabilities: ['text', 'vision', 'function-calling', 'multimodal'],
    temperatureRestrictions: {
      min: 0,
      max: 1,
      default: 0.7
    }
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    icon: '/openai-color.svg',
    description: 'Efficient GPT-4o mini for faster responses and lower costs',
    maxTokens: 128000,
    capabilities: ['text', 'vision', 'function-calling'],
    temperatureRestrictions: {
      min: 0,
      max: 1,
      default: 0.7
    }
  },
  {
    id: 'gpt-4.1',
    name: 'GPT-4.1',
    provider: 'openai',
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    icon: '/openai-color.svg',
    description: 'Latest GPT-4.1 model with enhanced performance and coding capabilities',
    maxTokens: 1000000,
    capabilities: ['text', 'vision', 'function-calling', 'coding', 'long-context'],
    isLatest: true,
    temperatureRestrictions: {
      min: 0,
      max: 1,
      default: 0.7
    }
  },
  {
    id: 'gpt-4.1-mini',
    name: 'GPT-4.1 Mini',
    provider: 'openai',
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    icon: '/openai-color.svg',
    description: 'Efficient GPT-4.1 mini for faster responses and lower costs',
    maxTokens: 1000000,
    capabilities: ['text', 'vision', 'function-calling', 'coding'],
    isLatest: true,
    temperatureRestrictions: {
      min: 0,
      max: 1,
      default: 0.7
    }
  },
  {
    id: 'gpt-4.1-nano',
    name: 'GPT-4.1 Nano',
    provider: 'openai',
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    icon: '/openai-color.svg',
    description: 'Ultra-light GPT-4.1 nano for high-speed, low-cost tasks',
    maxTokens: 1000000,
    capabilities: ['text', 'coding', 'fast'],
    isLatest: true,
    temperatureRestrictions: {
      min: 0,
      max: 1,
      default: 0.7
    }
  },
  {
    id: 'gpt-5',
    name: 'GPT-5',
    provider: 'openai',
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    icon: '/openai-color.svg',
    description: 'Most advanced GPT-5 model with superior reasoning and multimodal capabilities',
    maxTokens: 1000000,
    capabilities: ['text', 'vision', 'audio', 'video', 'function-calling', 'advanced', 'multimodal'],
    isLatest: true,
    temperatureRestrictions: {
      default: 1.0,
      supportedValues: [1.0]
    }
  },
  {
    id: 'gpt-5-mini',
    name: 'GPT-5 Mini',
    provider: 'openai',
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    icon: '/openai-color.svg',
    description: 'Efficient GPT-5 mini balancing performance and resource efficiency',
    maxTokens: 1000000,
    capabilities: ['text', 'vision', 'function-calling', 'multimodal'],
    isLatest: true,
    temperatureRestrictions: {
      default: 1.0,
      supportedValues: [1.0]
    }
  },
  {
    id: 'gpt-5-nano',
    name: 'GPT-5 Nano',
    provider: 'openai',
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    icon: '/openai-color.svg',
    description: 'High-speed GPT-5 nano for minimal resource requirements',
    maxTokens: 1000000,
    capabilities: ['text', 'fast', 'efficient'],
    isLatest: true,
    temperatureRestrictions: {
      default: 1.0,
      supportedValues: [1.0]
    }
  },
];

export const DEEPSEEK_MODELS: ModelConfig[] = [
  {
    id: 'deepseek-v3.1',
    name: 'DeepSeek-V3.1 (Non-thinking Model)',
    provider: 'deepseek',
    apiEndpoint: 'https://api.deepseek.com/v1/chat/completions',
    icon: '/deepseek-color.svg',
    description: 'Latest DeepSeek V3.1 model for general tasks without thinking mode',
    maxTokens: 8192,
    capabilities: ['text', 'code', 'general'],
    isLatest: true,
    temperatureRestrictions: {
      min: 0,
      max: 1,
      default: 0.7
    }
  },
  {
    id: 'deepseek-v3.1-thinking',
    name: 'DeepSeek-V3.1 (Thinking Mode)',
    provider: 'deepseek',
    apiEndpoint: 'https://api.deepseek.com/v1/chat/completions',
    icon: '/deepseek-color.svg',
    description: 'DeepSeek V3.1 with thinking mode for complex reasoning tasks',
    maxTokens: 8192,
    capabilities: ['text', 'code', 'thinking', 'reasoning'],
    isLatest: true,
    temperatureRestrictions: {
      min: 0,
      max: 1,
      default: 0.7
    }
  }
];

export const GOOGLEAI_MODELS: ModelConfig[] = [
  {
    id: 'googleai/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'googleai',
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    icon: '/gemini-color.svg',
    description: 'Latest stable Gemini model',
    maxTokens: 8192,
    capabilities: ['text', 'vision', 'multimodal'],
    isLatest: true,
    temperatureRestrictions: {
      min: 0,
      max: 1,
      default: 0.7
    }
  },
  {
    id: 'googleai/gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash (Experimental)',
    provider: 'googleai',
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
    icon: '/gemini-color.svg',
    description: 'Latest experimental Gemini model',
    maxTokens: 8192,
    capabilities: ['text', 'vision', 'multimodal'],
    temperatureRestrictions: {
      min: 0,
      max: 1,
      default: 0.7
    }
  }
];

export const ALL_MODELS: ModelConfig[] = [
  ...OPENAI_MODELS,
  ...DEEPSEEK_MODELS,
  ...GOOGLEAI_MODELS
];

export const getModelById = (id: string): ModelConfig | undefined => {
  return ALL_MODELS.find(model => model.id === id);
};

export const getModelsByProvider = (provider: 'openai' | 'deepseek' | 'googleai'): ModelConfig[] => {
  return ALL_MODELS.filter(model => model.provider === provider);
};

export const getLatestModels = (): ModelConfig[] => {
  return ALL_MODELS.filter(model => model.isLatest);
};

export const getDefaultModel = (): ModelConfig => {
  return OPENAI_MODELS[0]; // gpt-4.1 as default
};

export const getModelIcon = (modelId: string, theme: string = 'light'): string => {
  if (modelId.startsWith('gpt') || modelId.startsWith('o3')) {
    // Always use the white logo since we're making the button dark in light mode
    return '/openai-color.svg';
  }
  if (modelId.startsWith('deepseek')) return '/deepseek-color.svg';
  if (modelId.startsWith('googleai')) return '/gemini-color.svg';
  return '/openai-color.svg';
};

// Map custom model names to real API model names
export const mapModelToApiModel = (modelId: string): string => {
  const modelMapping: Record<string, string> = {
    // OpenAI models
    'gpt-4.1': 'gpt-4o',
    'gpt-4.1-mini': 'gpt-4o-mini',
    'gpt-4.1-nano': 'gpt-4o-mini',
    'gpt-5': 'gpt-4o',
    'gpt-5-mini': 'gpt-4o-mini',
    'gpt-5-nano': 'gpt-4o-mini',
    
    // DeepSeek models
    'deepseek-v3.1': 'deepseek-chat',
    'deepseek-v3.1-thinking': 'deepseek-chat',
    
    // Google AI models (keep as is)
    'googleai/gemini-2.5-flash': 'googleai/gemini-2.5-flash',
    'googleai/gemini-2.0-flash-exp': 'googleai/gemini-2.0-flash-exp'
  };
  
  return modelMapping[modelId] || modelId;
};
