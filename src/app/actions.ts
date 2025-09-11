
'use server';

import { z } from 'zod';
import { generatePromptFromDetails } from '@/ai/flows/generate-prompt-from-details';
import { improveExistingPrompt } from '@/ai/flows/improve-existing-prompt';
import { enhancePromptWithJoblogicKnowledge } from '@/ai/flows/enhance-prompt-with-joblogic-knowledge';

const generatePromptSchema = z.object({
  role: z.string(),
  context: z.string(),
  sampleInput: z.string(),
  expectedOutput: z.string(),
  enhanceWithJoblogic: z.boolean(),
});
export type GeneratePromptInputs = z.infer<typeof generatePromptSchema>;

const improvePromptSchema = z.object({
  existingPrompt: z.string().nonempty('Existing prompt is required.'),
  problemDescription: z.string().nonempty('Problem description is required.'),
  expectedChanges: z.string().nonempty('Expected changes are required.'),
});
export type ImprovePromptInputs = z.infer<typeof improvePromptSchema>;


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
