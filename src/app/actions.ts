
'use server';

import { z } from 'zod';
import { generatePromptFromDetails } from '@/ai/flows/generate-prompt-from-details';
import { improveExistingPrompt } from '@/ai/flows/improve-existing-prompt';
import { enhancePromptWithJoblogicKnowledge } from '@/ai/flows/enhance-prompt-with-joblogic-knowledge';
import { rewritePrompt } from '@/ai/flows/rewrite-prompt';
import { evaluatePrompt } from '@/ai/flows/evaluate-prompt';

const generatePromptSchema = z.object({
  role: z.string(),
  context: z.string(),
  sampleInput: z.string(),
  expectedOutput: z.string(),
  enhanceWithJoblogic: z.boolean(),
  files: z.array(z.object({
    name: z.string(),
    mimeType: z.string(),
    data: z.string()
  })).optional(),
  agentPrompt: z.string().optional(),
});
export type GeneratePromptInputs = z.infer<typeof generatePromptSchema>;

const improvePromptSchema = z.object({
  existingPrompt: z.string().nonempty('Existing prompt is required.'),
  problemDescription: z.string().nonempty('Problem description is required.'),
  expectedChanges: z.string().nonempty('Expected changes are required.'),
});
export type ImprovePromptInputs = z.infer<typeof improvePromptSchema>;

const rewritePromptSchema = z.object({
  chatHistory: z.string().optional(),
  followUpQuestion: z.string().nonempty('Follow-up question is required.'),
});
export type RewritePromptInputs = z.infer<typeof rewritePromptSchema>;

const evaluatePromptSchema = z.object({
  promptToEvaluate: z.string().nonempty('Prompt to evaluate is required.'),
  chatbotType: z.enum(['supportchatbot_conversation_llm', 'supportchatbot_other_agent', 'supportchatbot_howto_agent', 'supportchatbot_complex_agent', 'supportchatbot_condition_agent']),
  files: z.array(z.object({
    name: z.string(),
    mimeType: z.string(),
    data: z.string()
  })).optional(),
});
export type EvaluatePromptInputs = z.infer<typeof evaluatePromptSchema>;


export async function generatePromptAction(
  inputs: GeneratePromptInputs
): Promise<{ data?: string; error?: string; }> {
  
  if (!inputs.role && !inputs.context && !inputs.sampleInput && !inputs.expectedOutput) {
      return { error: 'Please provide at least one detail to generate a prompt.' };
  }

  try {
    const result = await generatePromptFromDetails({
      role: inputs.role,
      context: inputs.context,
      sampleInput: inputs.sampleInput,
      expectedOutput: inputs.expectedOutput,
      files: inputs.files,
      agentPrompt: inputs.agentPrompt,
    });

    let finalPrompt = result.prompt;

    if (inputs.enhanceWithJoblogic) {
      const enhancedResult = await enhancePromptWithJoblogicKnowledge({
        prompt: finalPrompt,
      });
      finalPrompt = enhancedResult.enhancedPrompt;
    }

    return { data: finalPrompt };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to generate prompt. Please try again.' };
  }
}

export async function improvePromptAction(
  inputs: ImprovePromptInputs
): Promise<{ data?: string; error?: string; }> {
  try {
    const result = await improveExistingPrompt(inputs);
    return { data: result.improvedPrompt };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to improve prompt. Please try again.' };
  }
}

export async function rewritePromptAction(
  inputs: RewritePromptInputs
): Promise<{ data?: string; error?: string; }> {
  try {
    const result = await rewritePrompt(inputs);
    return { data: result.standaloneQuestion };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to rewrite prompt. Please try again.' };
  }
}

export async function evaluatePromptAction(
  inputs: EvaluatePromptInputs
): Promise<{ data?: any; error?: string; }> {
  try {
    const result = await evaluatePrompt(inputs);
    return { data: result };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to evaluate prompt. Please try again.' };
  }
}
