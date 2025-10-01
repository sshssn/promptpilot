import fs from 'fs';
import path from 'path';

export interface LeakedPrompt {
  id: string;
  name: string;
  provider: string;
  model: string;
  date: string;
  content: string;
  category: string;
  tags: string[];
}

export class LeakedPromptsService {
  private static instance: LeakedPromptsService;
  private prompts: LeakedPrompt[] = [];
  private initialized = false;

  private constructor() {}

  public static getInstance(): LeakedPromptsService {
    if (!LeakedPromptsService.instance) {
      LeakedPromptsService.instance = new LeakedPromptsService();
    }
    return LeakedPromptsService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const leakedPromptsDir = path.join(process.cwd(), 'docs', 'leaked-system-prompts');
      const files = fs.readdirSync(leakedPromptsDir).filter(file => file.endsWith('.md'));

      for (const file of files) {
        try {
          const content = fs.readFileSync(path.join(leakedPromptsDir, file), 'utf-8');
          const prompt = this.parseLeakedPrompt(file, content);
          if (prompt) {
            this.prompts.push(prompt);
          }
        } catch (error) {
          console.warn(`Failed to parse ${file}:`, error);
        }
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize leaked prompts:', error);
    }
  }

  private parseLeakedPrompt(filename: string, content: string): LeakedPrompt | null {
    try {
      // Extract metadata from filename (e.g., "openai-chatgpt4o_20240520.md")
      const [provider, model, date] = filename.replace('.md', '').split('_');
      
      // Extract content after the first heading
      const lines = content.split('\n');
      let startIndex = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('##') || lines[i].startsWith('###')) {
          startIndex = i + 1;
          break;
        }
      }
      
      const promptContent = lines.slice(startIndex).join('\n').trim();
      
      if (!promptContent) return null;

      return {
        id: filename.replace('.md', ''),
        name: `${provider} ${model}`,
        provider: provider || 'unknown',
        model: model || 'unknown',
        date: date || 'unknown',
        content: promptContent,
        category: this.categorizePrompt(provider, model),
        tags: this.extractTags(content)
      };
    } catch (error) {
      console.warn(`Failed to parse ${filename}:`, error);
      return null;
    }
  }

  private categorizePrompt(provider: string, model: string): string {
    const providerLower = provider?.toLowerCase() || '';
    const modelLower = model?.toLowerCase() || '';

    if (providerLower.includes('openai') || modelLower.includes('gpt')) {
      return 'OpenAI';
    } else if (providerLower.includes('anthropic') || modelLower.includes('claude')) {
      return 'Anthropic';
    } else if (providerLower.includes('google') || modelLower.includes('gemini')) {
      return 'Google';
    } else if (providerLower.includes('xai') || modelLower.includes('grok')) {
      return 'xAI';
    } else if (providerLower.includes('meta') || modelLower.includes('llama')) {
      return 'Meta';
    } else {
      return 'Other';
    }
  }

  private extractTags(content: string): string[] {
    const tags: string[] = [];
    const contentLower = content.toLowerCase();

    // Extract common patterns
    if (contentLower.includes('assistant') || contentLower.includes('helpful')) {
      tags.push('assistant');
    }
    if (contentLower.includes('creative') || contentLower.includes('writing')) {
      tags.push('creative');
    }
    if (contentLower.includes('code') || contentLower.includes('programming')) {
      tags.push('coding');
    }
    if (contentLower.includes('analysis') || contentLower.includes('reasoning')) {
      tags.push('analysis');
    }
    if (contentLower.includes('safety') || contentLower.includes('harmful')) {
      tags.push('safety');
    }

    return tags;
  }

  public getPrompts(): LeakedPrompt[] {
    return this.prompts;
  }

  public getPromptsByCategory(category: string): LeakedPrompt[] {
    return this.prompts.filter(prompt => prompt.category === category);
  }

  public getPromptsByProvider(provider: string): LeakedPrompt[] {
    return this.prompts.filter(prompt => prompt.provider.toLowerCase() === provider.toLowerCase());
  }

  public searchPrompts(query: string): LeakedPrompt[] {
    const queryLower = query.toLowerCase();
    return this.prompts.filter(prompt => 
      prompt.name.toLowerCase().includes(queryLower) ||
      prompt.content.toLowerCase().includes(queryLower) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(queryLower))
    );
  }

  public getRandomPrompts(count: number = 5): LeakedPrompt[] {
    const shuffled = [...this.prompts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  public getPromptById(id: string): LeakedPrompt | undefined {
    return this.prompts.find(prompt => prompt.id === id);
  }

  public getSimilarPrompts(prompt: LeakedPrompt, count: number = 3): LeakedPrompt[] {
    // Simple similarity based on tags and category
    return this.prompts
      .filter(p => p.id !== prompt.id)
      .filter(p => p.category === prompt.category || p.tags.some(tag => prompt.tags.includes(tag)))
      .slice(0, count);
  }
}

// Export singleton instance
export const leakedPromptsService = LeakedPromptsService.getInstance();


