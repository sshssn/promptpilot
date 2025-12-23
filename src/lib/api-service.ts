import { ModelConfig } from './models';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  topP?: number;
  topK?: number;
  stopSequences?: string[];
}

export interface ChatResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class ModelAPIService {
  private static instance: ModelAPIService;
  private apiKeys: Record<string, string> = {};

  private constructor() {
    // Initialize API keys from environment
    this.apiKeys = {
      openai: process.env.OPENAI_API_KEY || '',
      deepseek: process.env.DEEPSEEK_API_KEY || '',
      googleai: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || ''
    };
  }

  public static getInstance(): ModelAPIService {
    if (!ModelAPIService.instance) {
      ModelAPIService.instance = new ModelAPIService();
    }
    return ModelAPIService.instance;
  }

  public async chat(
    messages: ChatMessage[],
    config: ChatConfig,
    onChunk?: (chunk: string) => void
  ): Promise<ChatResponse> {
    const model = this.getModelConfig(config.model);
    if (!model) {
      throw new Error(`Model ${config.model} not found`);
    }

    switch (model.provider) {
      case 'openai':
        return this.callOpenAI(messages, config, onChunk);
      case 'deepseek':
        return this.callDeepSeek(messages, config, onChunk);
      case 'googleai':
        return this.callGoogleAI(messages, config, onChunk);
      default:
        throw new Error(`Unsupported provider: ${model.provider}`);
    }
  }

  private getModelConfig(modelId: string): ModelConfig | null {
    // Import here to avoid circular dependency
    const { getModelById } = require('./models');
    return getModelById(modelId);
  }

  private async callOpenAI(
    messages: ChatMessage[],
    config: ChatConfig,
    onChunk?: (chunk: string) => void
  ): Promise<ChatResponse> {
    const apiKey = this.apiKeys.openai;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        messages: this.formatMessagesForOpenAI(messages),
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        top_p: config.topP,
        stop: config.stopSequences?.length ? config.stopSequences : undefined,
        stream: !!onChunk
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    if (onChunk) {
      return this.handleStreamingResponse(response, onChunk);
    } else {
      const data = await response.json();
      return {
        content: data.choices[0].message.content,
        model: data.model,
        usage: data.usage
      };
    }
  }

  private async callDeepSeek(
    messages: ChatMessage[],
    config: ChatConfig,
    onChunk?: (chunk: string) => void
  ): Promise<ChatResponse> {
    const apiKey = this.apiKeys.deepseek;
    if (!apiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        messages: this.formatMessagesForOpenAI(messages), // DeepSeek uses OpenAI format
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        top_p: config.topP,
        stop: config.stopSequences?.length ? config.stopSequences : undefined,
        stream: !!onChunk
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
    }

    if (onChunk) {
      return this.handleStreamingResponse(response, onChunk);
    } else {
      const data = await response.json();
      return {
        content: data.choices[0].message.content,
        model: data.model,
        usage: data.usage
      };
    }
  }

  private async callGoogleAI(
    messages: ChatMessage[],
    config: ChatConfig,
    onChunk?: (chunk: string) => void
  ): Promise<ChatResponse> {
    const apiKey = this.apiKeys.googleai;
    if (!apiKey) {
      throw new Error('Google AI API key not configured');
    }

    // For now, we'll use the existing Genkit integration
    // This can be replaced with direct API calls later
    throw new Error('Google AI direct API not implemented yet. Please use existing Genkit integration.');
  }

  private formatMessagesForOpenAI(messages: ChatMessage[]): any[] {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  private async handleStreamingResponse(
    response: Response,
    onChunk: (chunk: string) => void
  ): Promise<ChatResponse> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body for streaming');
    }

    const decoder = new TextDecoder();
    let fullContent = '';
    let model = '';
    let usage: any = undefined;

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              return { content: fullContent, model, usage };
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullContent += content;
                onChunk(content);
              }
              
              if (parsed.model) model = parsed.model;
              if (parsed.usage) usage = parsed.usage;
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return { content: fullContent, model, usage };
  }

  public setApiKey(provider: string, key: string): void {
    this.apiKeys[provider] = key;
  }

  public getApiKey(provider: string): string | undefined {
    return this.apiKeys[provider];
  }
}

export const modelAPIService = ModelAPIService.getInstance();
