'use server';

/**
 * @fileOverview An AI agent for improving existing prompts.
 *
 * - improveExistingPrompt - A function that accepts an existing prompt, a description of the problem, and expected changes, then refines the prompt.
 * - ImproveExistingPromptInput - The input type for the improveExistingPrompt function.
 * - ImproveExistingPromptOutput - The return type for the improveExistingPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveExistingPromptInputSchema = z.object({
  existingPrompt: z
    .string()
    .describe('The existing prompt that needs improvement.'),
  problemDescription: z
    .string()
    .describe('A description of the problem with the existing prompt.'),
  expectedChanges: z
    .string()
    .describe('The expected changes to the existing prompt.'),
});
export type ImproveExistingPromptInput = z.infer<
  typeof ImproveExistingPromptInputSchema
>;

const ImproveExistingPromptOutputSchema = z.object({
  improvedPrompt: z.string().describe('The improved and refined prompt.'),
});
export type ImproveExistingPromptOutput = z.infer<
  typeof ImproveExistingPromptOutputSchema
>;

export async function improveExistingPrompt(
  input: ImproveExistingPromptInput
): Promise<ImproveExistingPromptOutput> {
  return improveExistingPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveExistingPromptPrompt',
  input: {schema: ImproveExistingPromptInputSchema},
  output: {schema: ImproveExistingPromptOutputSchema},
  prompt: `You are an expert prompt engineer. You will be given an existing prompt, a description of the problem with the prompt, and the expected changes to the prompt. You will rewrite and refine the prompt based on this information.

Existing Prompt: {{{existingPrompt}}}
Problem Description: {{{problemDescription}}}
Expected Changes: {{{expectedChanges}}}

Improved Prompt:`, // Keep it as a single line.
});

const improveExistingPromptFlow = ai.defineFlow(
  {
    name: 'improveExistingPromptFlow',
    inputSchema: ImproveExistingPromptInputSchema,
    outputSchema: ImproveExistingPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
