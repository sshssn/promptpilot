'use server';

/**
 * @fileOverview A smart router that automatically routes user prompts to the most appropriate enhancement flow.
 * 
 * This flow analyzes user intent and automatically applies the best enhancement strategy
 * based on the prompt type and context.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { enhancePromptWithJoblogicKnowledge } from './enhance-prompt-with-joblogic-knowledge';
import { enhancePromptWithAgentAwareness } from './agent-aware-prompt-enhancement';

const SmartRouterInputSchema = z.object({
  userPrompt: z.string().describe('The user\'s original prompt'),
  context: z.string().optional().describe('Additional context about the use case'),
  enhancementType: z.enum(['knowledge', 'agent', 'both', 'auto']).optional().describe('Type of enhancement to apply')
});

export type SmartRouterInput = z.infer<typeof SmartRouterInputSchema>;

const SmartRouterOutputSchema = z.object({
  enhancedPrompt: z.string().describe('The enhanced prompt'),
  appliedEnhancements: z.array(z.string()).describe('List of enhancements applied'),
  routingDecision: z.string().describe('Why this routing was chosen'),
  suggestions: z.array(z.string()).describe('Additional suggestions for improvement')
});

export type SmartRouterOutput = z.infer<typeof SmartRouterOutputSchema>;

export async function routePromptEnhancement(
  input: SmartRouterInput
): Promise<SmartRouterOutput> {
  return smartPromptRouterFlow(input);
}

const routingAnalysisPrompt = ai.definePrompt({
  name: 'routingAnalysisPrompt',
  input: { schema: SmartRouterInputSchema },
  output: { 
    schema: z.object({
      needsKnowledge: z.boolean().describe('Whether the prompt needs Joblogic knowledge enhancement'),
      needsAgentTemplate: z.boolean().describe('Whether the prompt needs agent template application'),
      reasoning: z.string().describe('Reasoning for the routing decision'),
      confidence: z.number().min(0).max(1).describe('Confidence in the routing decision')
    })
  },
  prompt: `Analyze the following prompt and determine the best enhancement strategy:

User Prompt: {{{userPrompt}}}
Context: {{{context}}}

Available Enhancement Types:
- knowledge: Enhance with Joblogic knowledge base information
- agent: Apply appropriate Joblogic agent template
- both: Apply both knowledge and agent enhancements
- auto: Let the system decide

Determine which enhancements would be most beneficial for this prompt.`
});

const smartPromptRouterFlow = ai.defineFlow(
  {
    name: 'smartPromptRouterFlow',
    inputSchema: SmartRouterInputSchema,
    outputSchema: SmartRouterOutputSchema,
  },
  async input => {
    // Step 1: Analyze the prompt to determine enhancement needs
    const { output: analysis } = await routingAnalysisPrompt(input, {
      model: 'googleai/gemini-2.5-flash'
    });

    const needsKnowledge = analysis!.needsKnowledge;
    const needsAgent = analysis!.needsAgentTemplate;
    const appliedEnhancements: string[] = [];
    let enhancedPrompt = input.userPrompt;

    // Step 2: Apply knowledge enhancement if needed
    if (needsKnowledge) {
      const knowledgeResult = await enhancePromptWithJoblogicKnowledge({
        prompt: enhancedPrompt
      });
      enhancedPrompt = knowledgeResult.enhancedPrompt;
      appliedEnhancements.push('Joblogic Knowledge Enhancement');
    }

    // Step 3: Apply agent template if needed
    if (needsAgent) {
      const agentResult = await enhancePromptWithAgentAwareness({
        userPrompt: enhancedPrompt,
        context: input.context,
        preferredAgent: 'auto'
      });
      enhancedPrompt = agentResult.enhancedPrompt;
      appliedEnhancements.push(`Agent Template: ${agentResult.appliedAgent}`);
    }

    // Step 4: Generate suggestions
    const suggestions = [
      'Test the enhanced prompt in the playground',
      'Use stress testing to validate robustness',
      'Compare with original prompt for improvements',
      'Consider model-specific optimizations'
    ];

    return {
      enhancedPrompt,
      appliedEnhancements,
      routingDecision: analysis!.reasoning,
      suggestions
    };
  }
);
