'use server';

/**
 * @fileOverview A flow that automatically applies the appropriate Joblogic agent template to enhance prompts.
 * 
 * This flow analyzes user prompts and automatically applies the most relevant Joblogic agent template
 * to ensure all generated prompts follow Joblogic's golden standards.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Agent templates from your existing system
const AGENT_TEMPLATES = {
  condition: `You are an expert assistant trained to classify customer messages about Joblogic (Field Service Management software) into one of these categories: How-To, Complex, Issue, Request, or Conversation.`,
  
  other: `You are an intelligent assistant helping Joblogic (Field Service Management software) customers with their questions about Joblogic.`,
  
  conversation: `You are a professional conversation agent handling greetings, acknowledgments, and flow management for Joblogic support.`,
  
  complex: `You are an advanced troubleshooting agent for complex Joblogic issues requiring in-depth investigation and escalation.`,
  
  howTo: `You are a step-by-step guidance agent providing clear instructions for Joblogic features and workflows.`
};

const AgentAwareEnhancementInputSchema = z.object({
  userPrompt: z.string().describe('The user\'s original prompt to enhance'),
  context: z.string().optional().describe('Additional context about the use case'),
  preferredAgent: z.enum(['condition', 'other', 'conversation', 'complex', 'howTo', 'auto']).optional().describe('Preferred agent type, or auto-detect')
});

export type AgentAwareEnhancementInput = z.infer<typeof AgentAwareEnhancementInputSchema>;

const AgentAwareEnhancementOutputSchema = z.object({
  enhancedPrompt: z.string().describe('The enhanced prompt with appropriate agent template'),
  appliedAgent: z.string().describe('The agent template that was applied'),
  reasoning: z.string().describe('Why this agent was chosen'),
  suggestions: z.array(z.string()).describe('Additional suggestions for improvement')
});

export type AgentAwareEnhancementOutput = z.infer<typeof AgentAwareEnhancementOutputSchema>;

export async function enhancePromptWithAgentAwareness(
  input: AgentAwareEnhancementInput
): Promise<AgentAwareEnhancementOutput> {
  return agentAwareEnhancementFlow(input);
}

const agentDetectionPrompt = ai.definePrompt({
  name: 'agentDetectionPrompt',
  input: { schema: AgentAwareEnhancementInputSchema },
  output: { 
    schema: z.object({
      recommendedAgent: z.enum(['condition', 'other', 'conversation', 'complex', 'howTo']),
      confidence: z.number().min(0).max(1),
      reasoning: z.string()
    })
  },
  prompt: `Analyze the following prompt and determine which Joblogic agent template would be most appropriate:

User Prompt: {{{userPrompt}}}
Context: {{{context}}}

Available Agents:
- condition: For classifying customer messages into categories
- other: For general customer support and assistance
- conversation: For greetings, acknowledgments, and flow management
- complex: For advanced troubleshooting and escalation
- howTo: For step-by-step guidance and instructions

Determine the most appropriate agent and provide reasoning.`
});

const agentEnhancementPrompt = ai.definePrompt({
  name: 'agentEnhancementPrompt',
  input: { schema: AgentAwareEnhancementInputSchema },
  output: { schema: AgentAwareEnhancementOutputSchema },
  prompt: `You are an expert prompt engineer specializing in Joblogic agent templates. 
  
  Your task is to enhance the user's prompt by applying the appropriate Joblogic agent template.

  Original Prompt: {{{userPrompt}}}
  Context: {{{context}}}
  
  Apply the relevant agent template and enhance the prompt to follow Joblogic's golden standards.
  
  Return the enhanced prompt with the applied agent template, reasoning for the choice, and suggestions for further improvement.`
});

const agentAwareEnhancementFlow = ai.defineFlow(
  {
    name: 'agentAwareEnhancementFlow',
    inputSchema: AgentAwareEnhancementInputSchema,
    outputSchema: AgentAwareEnhancementOutputSchema,
  },
  async input => {
    // Step 1: Detect appropriate agent if not specified
    let selectedAgent = input.preferredAgent;
    
    if (!selectedAgent || selectedAgent === 'auto') {
      const { output: detection } = await agentDetectionPrompt(input, {
        model: 'googleai/gemini-2.5-flash'
      });
      selectedAgent = detection!.recommendedAgent;
    }

    // Step 2: Apply agent template and enhance prompt
    const agentTemplate = AGENT_TEMPLATES[selectedAgent as keyof typeof AGENT_TEMPLATES];
    
    const { output } = await agentEnhancementPrompt({
      ...input,
      agentTemplate
    }, {
      model: 'googleai/gemini-2.5-flash'
    });

    return {
      enhancedPrompt: output!.enhancedPrompt,
      appliedAgent: selectedAgent,
      reasoning: output!.reasoning,
      suggestions: output!.suggestions
    };
  }
);
