import { leakedPromptsService, LeakedPrompt } from './leaked-prompts';
import { modelPromptMatcher } from './model-prompt-matcher';

export interface PromptGuidanceContext {
  leakedPrompts: LeakedPrompt[];
  relevantExamples: LeakedPrompt[];
  guidanceText: string;
  structureRecommendations: string[];
  qualityIndicators: string[];
  modelSpecificGuidance?: string;
  exactModelMatch?: LeakedPrompt | null;
  modelConfidence?: number;
}

export class LeakedPromptsContext {
  private static instance: LeakedPromptsContext;
  private service = leakedPromptsService;

  private constructor() {}

  public static getInstance(): LeakedPromptsContext {
    if (!LeakedPromptsContext.instance) {
      LeakedPromptsContext.instance = new LeakedPromptsContext();
    }
    return LeakedPromptsContext.instance;
  }

  public async getGuidanceContext(
    userPrompt: string,
    promptType: 'generate' | 'improve' | 'rewrite' | 'evaluate' = 'improve',
    modelId?: string
  ): Promise<PromptGuidanceContext> {
    await this.service.initialize();

    // Get relevant leaked prompts based on user input
    const relevantPrompts = this.findRelevantPrompts(userPrompt, promptType);
    
    // Get random examples for inspiration
    const randomExamples = this.service.getRandomPrompts(3);
    
    // Generate guidance text
    const guidanceText = this.generateGuidanceText(userPrompt, promptType, relevantPrompts);
    
    // Extract structure recommendations
    const structureRecommendations = this.extractStructureRecommendations(relevantPrompts);
    
    // Extract quality indicators
    const qualityIndicators = this.extractQualityIndicators(relevantPrompts);

    // Get model-specific guidance if modelId is provided
    let modelSpecificGuidance: string | undefined;
    let exactModelMatch: LeakedPrompt | null = null;
    let modelConfidence: number | undefined;
    
    if (modelId) {
      try {
        const modelMatch = await modelPromptMatcher.getModelPromptMatch(modelId);
        modelSpecificGuidance = await modelPromptMatcher.getModelSpecificGuidance(modelId, userPrompt);
        exactModelMatch = modelMatch.exactMatch;
        modelConfidence = modelMatch.confidence;
      } catch (error) {
        console.warn('Failed to get model-specific guidance:', error);
      }
    }

    return {
      leakedPrompts: relevantPrompts,
      relevantExamples: randomExamples,
      guidanceText,
      structureRecommendations,
      qualityIndicators,
      modelSpecificGuidance,
      exactModelMatch,
      modelConfidence
    };
  }

  private findRelevantPrompts(userPrompt: string, promptType: string): LeakedPrompt[] {
    const allPrompts = this.service.getPrompts();
    const userPromptLower = userPrompt.toLowerCase();

    // Score prompts based on relevance
    const scoredPrompts = allPrompts.map(prompt => ({
      prompt,
      score: this.calculateRelevanceScore(prompt, userPromptLower, promptType)
    }));

    // Return top 5 most relevant prompts
    return scoredPrompts
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => item.prompt);
  }

  private calculateRelevanceScore(prompt: LeakedPrompt, userPrompt: string, promptType: string): number {
    let score = 0;

    // Content similarity
    const contentLower = prompt.content.toLowerCase();
    const userWords = userPrompt.split(' ');
    
    for (const word of userWords) {
      if (word.length > 3 && contentLower.includes(word)) {
        score += 1;
      }
    }

    // Tag relevance
    if (prompt.tags.includes('assistant') && userPrompt.includes('assistant')) score += 2;
    if (prompt.tags.includes('creative') && userPrompt.includes('creative')) score += 2;
    if (prompt.tags.includes('coding') && userPrompt.includes('code')) score += 2;
    if (prompt.tags.includes('analysis') && userPrompt.includes('analyze')) score += 2;

    // Provider relevance (prefer major providers)
    if (prompt.provider.toLowerCase() === 'openai') score += 1;
    if (prompt.provider.toLowerCase() === 'anthropic') score += 1;
    if (prompt.provider.toLowerCase() === 'google') score += 1;

    return score;
  }

  private generateGuidanceText(userPrompt: string, promptType: string, relevantPrompts: LeakedPrompt[]): string {
    const providerCounts = relevantPrompts.reduce((acc, prompt) => {
      acc[prompt.provider] = (acc[prompt.provider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topProvider = Object.entries(providerCounts).sort(([,a], [,b]) => b - a)[0]?.[0];

    let guidance = `Based on analysis of ${relevantPrompts.length} relevant leaked system prompts from major AI providers, here's guidance for your prompt ${promptType}:\n\n`;

    if (topProvider) {
      guidance += `**Primary Reference Provider:** ${topProvider} (appears in ${providerCounts[topProvider]} relevant examples)\n\n`;
    }

    guidance += `**Key Patterns Found:**\n`;
    
    // Extract common patterns
    const commonPatterns = this.extractCommonPatterns(relevantPrompts);
    commonPatterns.forEach(pattern => {
      guidance += `- ${pattern}\n`;
    });

    guidance += `\n**Structure Recommendations:**\n`;
    guidance += `- Follow the proven patterns from ${topProvider || 'major providers'}\n`;
    guidance += `- Maintain consistency with industry standards\n`;
    guidance += `- Include clear role definitions and constraints\n\n`;

    return guidance;
  }

  private extractCommonPatterns(prompts: LeakedPrompt[]): string[] {
    const patterns: string[] = [];
    
    // Check for common structural elements
    const hasRoleDefinition = prompts.some(p => p.content.includes('You are') || p.content.includes('You will'));
    if (hasRoleDefinition) patterns.push('Clear role definition with "You are" statements');

    const hasConstraints = prompts.some(p => p.content.includes('DO NOT') || p.content.includes('Never'));
    if (hasConstraints) patterns.push('Explicit constraints and limitations');

    const hasFormatting = prompts.some(p => p.content.includes('```') || p.content.includes('##'));
    if (hasFormatting) patterns.push('Structured formatting with markdown');

    const hasExamples = prompts.some(p => p.content.includes('Example') || p.content.includes('For example'));
    if (hasExamples) patterns.push('Concrete examples and demonstrations');

    return patterns;
  }

  private extractStructureRecommendations(prompts: LeakedPrompt[]): string[] {
    const recommendations: string[] = [];

    // Analyze structure patterns
    const structures = prompts.map(p => this.analyzePromptStructure(p.content));
    
    // Find most common structure elements
    const commonElements = this.findCommonStructureElements(structures);
    
    recommendations.push(...commonElements);

    return recommendations;
  }

  private analyzePromptStructure(content: string): string[] {
    const elements: string[] = [];
    
    if (content.includes('You are')) elements.push('role_definition');
    if (content.includes('DO NOT')) elements.push('constraints');
    if (content.includes('##')) elements.push('sections');
    if (content.includes('Example')) elements.push('examples');
    if (content.includes('```')) elements.push('code_blocks');
    if (content.includes('Step')) elements.push('step_by_step');
    
    return elements;
  }

  private findCommonStructureElements(structures: string[][]): string[] {
    const elementCounts: Record<string, number> = {};
    
    structures.forEach(structure => {
      structure.forEach(element => {
        elementCounts[element] = (elementCounts[element] || 0) + 1;
      });
    });

    return Object.entries(elementCounts)
      .filter(([, count]) => count >= 2)
      .sort(([,a], [,b]) => b - a)
      .map(([element]) => element);
  }

  private extractQualityIndicators(prompts: LeakedPrompt[]): string[] {
    const indicators: string[] = [];

    // Analyze quality patterns
    const hasSpecificity = prompts.some(p => p.content.length > 1000);
    if (hasSpecificity) indicators.push('Detailed and specific instructions');

    const hasClarity = prompts.some(p => p.content.includes('clearly') || p.content.includes('specifically'));
    if (hasClarity) indicators.push('Clear and unambiguous language');

    const hasConsistency = prompts.some(p => p.content.includes('consistent') || p.content.includes('always'));
    if (hasConsistency) indicators.push('Consistent behavior patterns');

    return indicators;
  }

  public async getPromptImprovementGuidance(
    originalPrompt: string,
    improvementGoal: string
  ): Promise<string> {
    await this.service.initialize();

    const relevantPrompts = this.findRelevantPrompts(originalPrompt, 'improve');
    const guidance = await this.getGuidanceContext(originalPrompt, 'improve');

    let improvementGuidance = `**Prompt Improvement Guidance**\n\n`;
    improvementGuidance += `**Goal:** ${improvementGoal}\n\n`;
    improvementGuidance += `**Based on ${relevantPrompts.length} relevant leaked prompts:**\n\n`;

    // Analyze the original prompt against leaked prompts
    const analysis = this.analyzePromptAgainstStandards(originalPrompt, relevantPrompts);
    
    improvementGuidance += `**Current Prompt Analysis:**\n`;
    analysis.issues.forEach(issue => {
      improvementGuidance += `- ❌ ${issue}\n`;
    });
    
    improvementGuidance += `\n**Recommended Improvements:**\n`;
    analysis.recommendations.forEach(rec => {
      improvementGuidance += `- ✅ ${rec}\n`;
    });

    improvementGuidance += `\n**Reference Examples:**\n`;
    relevantPrompts.slice(0, 3).forEach((prompt, index) => {
      improvementGuidance += `${index + 1}. **${prompt.name}** (${prompt.provider})\n`;
      improvementGuidance += `   Key pattern: ${this.extractKeyPattern(prompt.content)}\n\n`;
    });

    return improvementGuidance;
  }

  private analyzePromptAgainstStandards(originalPrompt: string, standards: LeakedPrompt[]): {
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check for common issues
    if (!originalPrompt.includes('You are') && !originalPrompt.includes('You will')) {
      issues.push('Missing clear role definition');
      recommendations.push('Add a clear "You are" statement to define the AI\'s role');
    }

    if (!originalPrompt.includes('DO NOT') && !originalPrompt.includes('Never')) {
      issues.push('Missing explicit constraints');
      recommendations.push('Add clear constraints and limitations');
    }

    if (originalPrompt.length < 200) {
      issues.push('Prompt may be too brief');
      recommendations.push('Add more specific instructions and examples');
    }

    if (!originalPrompt.includes('Example') && !originalPrompt.includes('For example')) {
      issues.push('Missing concrete examples');
      recommendations.push('Include specific examples to guide behavior');
    }

    return { issues, recommendations };
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
export const leakedPromptsContext = LeakedPromptsContext.getInstance();
