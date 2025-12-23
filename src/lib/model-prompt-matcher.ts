import { ModelConfig, getModelById } from './models';
import { leakedPromptsService, LeakedPrompt } from './leaked-prompts';

export interface ModelPromptMatch {
  modelId: string;
  modelName: string;
  provider: string;
  exactMatch: LeakedPrompt | null;
  fallbackMatches: LeakedPrompt[];
  confidence: number;
  reasoning: string;
}

export class ModelPromptMatcher {
  private static instance: ModelPromptMatcher;
  private service = leakedPromptsService;

  private constructor() {}

  public static getInstance(): ModelPromptMatcher {
    if (!ModelPromptMatcher.instance) {
      ModelPromptMatcher.instance = new ModelPromptMatcher();
    }
    return ModelPromptMatcher.instance;
  }

  public async getModelPromptMatch(modelId: string): Promise<ModelPromptMatch> {
    await this.service.initialize();
    
    const model = getModelById(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    // Try to find exact match first
    const exactMatch = this.findExactMatch(model);
    
    // Find fallback matches
    const fallbackMatches = this.findFallbackMatches(model);
    
    // Calculate confidence
    const confidence = this.calculateConfidence(exactMatch, fallbackMatches);
    
    // Generate reasoning
    const reasoning = this.generateReasoning(model, exactMatch, fallbackMatches);

    return {
      modelId: model.id,
      modelName: model.name,
      provider: model.provider,
      exactMatch,
      fallbackMatches: fallbackMatches.slice(0, 3), // Top 3 fallbacks
      confidence,
      reasoning
    };
  }

  private findExactMatch(model: ModelConfig): LeakedPrompt | null {
    const allPrompts = this.service.getPrompts();
    
    // Create mapping patterns for exact matching
    const exactPatterns = this.createExactPatterns(model);
    
    for (const prompt of allPrompts) {
      for (const pattern of exactPatterns) {
        if (this.matchesPattern(prompt, pattern)) {
          return prompt;
        }
      }
    }
    
    return null;
  }

  private createExactPatterns(model: ModelConfig): Array<{
    provider: string;
    modelName: string;
    version?: string;
    variant?: string;
  }> {
    const patterns: Array<{
      provider: string;
      modelName: string;
      version?: string;
      variant?: string;
    }> = [];

    // OpenAI patterns
    if (model.provider === 'openai') {
      if (model.id.includes('gpt-4.1')) {
        patterns.push(
          { provider: 'openai', modelName: 'chatgpt4o', version: '20240520' },
          { provider: 'openai', modelName: 'chatgpt4o', version: '20250324' },
          { provider: 'openai', modelName: 'chatgpt4o', version: '20250506' }
        );
      }
      if (model.id.includes('gpt-5')) {
        patterns.push(
          { provider: 'openai', modelName: 'chatgpt5', version: '20250807' },
          { provider: 'openai', modelName: 'chatgpt5', version: '20250808' }
        );
      }
    }

    // Google AI patterns
    if (model.provider === 'googleai') {
      if (model.id.includes('gemini-2.5')) {
        patterns.push(
          { provider: 'google', modelName: 'gemini-1.5', version: '20240411' }
        );
      }
      if (model.id.includes('gemini-2.0')) {
        patterns.push(
          { provider: 'google', modelName: 'gemini-cli', version: '20250626' }
        );
      }
    }

    // DeepSeek patterns
    if (model.provider === 'deepseek') {
      patterns.push(
        { provider: 'deepseek', modelName: 'R1', version: '20250430' }
      );
    }

    return patterns;
  }

  private matchesPattern(prompt: LeakedPrompt, pattern: {
    provider: string;
    modelName: string;
    version?: string;
    variant?: string;
  }): boolean {
    const promptId = prompt.id.toLowerCase();
    const promptProvider = prompt.provider.toLowerCase();
    const promptModel = prompt.model.toLowerCase();
    
    // Check provider match
    if (!promptProvider.includes(pattern.provider.toLowerCase())) {
      return false;
    }
    
    // Check model name match
    if (!promptId.includes(pattern.modelName.toLowerCase()) && 
        !promptModel.includes(pattern.modelName.toLowerCase())) {
      return false;
    }
    
    // Check version if specified
    if (pattern.version && !promptId.includes(pattern.version)) {
      return false;
    }
    
    return true;
  }

  private findFallbackMatches(model: ModelConfig): LeakedPrompt[] {
    const allPrompts = this.service.getPrompts();
    const scoredPrompts: Array<{ prompt: LeakedPrompt; score: number }> = [];

    for (const prompt of allPrompts) {
      let score = 0;
      
      // Provider match (highest priority)
      if (this.matchesProvider(model.provider, prompt.provider)) {
        score += 10;
      }
      
      // Model family match
      if (this.matchesModelFamily(model.id, prompt)) {
        score += 5;
      }
      
      // Capability match
      if (this.matchesCapabilities(model.capabilities, prompt)) {
        score += 3;
      }
      
      // Date relevance (newer is better)
      if (this.isRecentPrompt(prompt)) {
        score += 2;
      }
      
      if (score > 0) {
        scoredPrompts.push({ prompt, score });
      }
    }

    return scoredPrompts
      .sort((a, b) => b.score - a.score)
      .map(item => item.prompt);
  }

  private matchesProvider(appProvider: string, promptProvider: string): boolean {
    const providerMap: Record<string, string[]> = {
      'openai': ['openai', 'chatgpt', 'gpt'],
      'googleai': ['google', 'gemini'],
      'deepseek': ['deepseek']
    };
    
    const mappedProviders = providerMap[appProvider] || [appProvider];
    return mappedProviders.some(provider => 
      promptProvider.toLowerCase().includes(provider.toLowerCase())
    );
  }

  private matchesModelFamily(modelId: string, prompt: LeakedPrompt): boolean {
    const modelFamilyMap: Record<string, string[]> = {
      'gpt-4.1': ['gpt-4', 'chatgpt4', 'gpt4'],
      'gpt-5': ['gpt-5', 'chatgpt5', 'gpt5'],
      'gemini-2.5': ['gemini-1.5', 'gemini-2', 'gemini'],
      'gemini-2.0': ['gemini-2', 'gemini'],
      'deepseek-v3.1': ['deepseek', 'v3']
    };
    
    for (const [family, patterns] of Object.entries(modelFamilyMap)) {
      if (modelId.includes(family)) {
        return patterns.some(pattern => 
          prompt.id.toLowerCase().includes(pattern.toLowerCase()) ||
          prompt.model.toLowerCase().includes(pattern.toLowerCase())
        );
      }
    }
    
    return false;
  }

  private matchesCapabilities(modelCapabilities: string[], prompt: LeakedPrompt): boolean {
    const capabilityKeywords = [
      'coding', 'vision', 'multimodal', 'function-calling', 
      'reasoning', 'thinking', 'advanced'
    ];
    
    const promptContent = prompt.content.toLowerCase();
    const promptTags = prompt.tags.map(tag => tag.toLowerCase());
    
    return modelCapabilities.some(capability => 
      capabilityKeywords.includes(capability.toLowerCase()) &&
      (promptContent.includes(capability.toLowerCase()) || 
       promptTags.includes(capability.toLowerCase()))
    );
  }

  private isRecentPrompt(prompt: LeakedPrompt): boolean {
    // Check if prompt is from 2024 or later
    const year = parseInt(prompt.date.substring(0, 4));
    return year >= 2024;
  }

  private calculateConfidence(exactMatch: LeakedPrompt | null, fallbackMatches: LeakedPrompt[]): number {
    if (exactMatch) {
      return 0.95; // High confidence for exact match
    }
    
    if (fallbackMatches.length > 0) {
      // Calculate confidence based on number and quality of fallback matches
      const topMatch = fallbackMatches[0];
      let confidence = 0.6; // Base confidence for fallback
      
      // Increase confidence based on number of matches
      if (fallbackMatches.length >= 3) confidence += 0.2;
      if (fallbackMatches.length >= 5) confidence += 0.1;
      
      // Increase confidence for recent prompts
      if (this.isRecentPrompt(topMatch)) confidence += 0.1;
      
      return Math.min(confidence, 0.9);
    }
    
    return 0.3; // Low confidence if no matches
  }

  private generateReasoning(
    model: ModelConfig, 
    exactMatch: LeakedPrompt | null, 
    fallbackMatches: LeakedPrompt[]
  ): string {
    if (exactMatch) {
      return `Found exact match: ${exactMatch.name} (${exactMatch.provider}) - ${exactMatch.date}. This leaked prompt is specifically for the ${model.name} model.`;
    }
    
    if (fallbackMatches.length > 0) {
      const topMatch = fallbackMatches[0];
      return `No exact match found, but found ${fallbackMatches.length} similar prompts. Best match: ${topMatch.name} (${topMatch.provider}) - ${topMatch.date}. Using this as reference for ${model.name} model.`;
    }
    
    return `No matching leaked prompts found for ${model.name}. Will use general best practices from available prompts.`;
  }

  public async getModelSpecificGuidance(modelId: string, userPrompt: string): Promise<string> {
    const match = await this.getModelPromptMatch(modelId);
    
    let guidance = `**Model-Specific Guidance for ${match.modelName}**\n\n`;
    guidance += `**Confidence:** ${Math.round(match.confidence * 100)}%\n\n`;
    guidance += `**Reasoning:** ${match.reasoning}\n\n`;
    
    if (match.exactMatch) {
      guidance += `**Exact Match Found:**\n`;
      guidance += `- **Source:** ${match.exactMatch.name} (${match.exactMatch.provider})\n`;
      guidance += `- **Date:** ${match.exactMatch.date}\n`;
      guidance += `- **Key Pattern:** ${this.extractKeyPattern(match.exactMatch.content)}\n\n`;
      
      guidance += `**Relevant Content:**\n`;
      guidance += `${match.exactMatch.content.substring(0, 1000)}...\n\n`;
    } else if (match.fallbackMatches.length > 0) {
      guidance += `**Fallback Matches:**\n`;
      match.fallbackMatches.forEach((prompt, index) => {
        guidance += `${index + 1}. **${prompt.name}** (${prompt.provider}) - ${prompt.date}\n`;
        guidance += `   Key pattern: ${this.extractKeyPattern(prompt.content)}\n`;
      });
      guidance += `\n`;
    }
    
    guidance += `**Recommendations:**\n`;
    guidance += `- Follow the structure and patterns from the matched prompt(s)\n`;
    guidance += `- Adapt the guidance to your specific use case\n`;
    guidance += `- Combine with Joblogic standards from lang.md\n`;
    guidance += `- Use the matched prompt as a quality benchmark\n`;
    
    return guidance;
  }

  private extractKeyPattern(content: string): string {
    // Extract the most important pattern from the prompt
    if (content.includes('You are')) {
      const match = content.match(/You are[^.!?]*[.!?]/);
      return match ? match[0].substring(0, 100) + '...' : 'Role definition pattern';
    }
    
    if (content.includes('DO NOT')) {
      return 'Explicit constraints pattern';
    }
    
    if (content.includes('Example')) {
      return 'Example-driven pattern';
    }
    
    return 'Standard structure pattern';
  }
}

// Export singleton instance
export const modelPromptMatcher = ModelPromptMatcher.getInstance();
