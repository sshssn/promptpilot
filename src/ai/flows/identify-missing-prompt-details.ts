'use server';

/**
 * @fileOverview Identifies missing key information in initial prompt details and asks targeted questions.
 *
 * - identifyMissingPromptDetails - A function that analyzes prompt details and identifies missing information.
 * - IdentifyMissingPromptDetailsInput - The input type for the identifyMissingPromptDetails function.
 * - IdentifyMissingPromptDetailsOutput - The return type for the identifyMissingPromptDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyMissingPromptDetailsInputSchema = z.object({
  sampleInput: z.string().optional().describe('A sample input for the prompt.'),
  expectedOutput: z.string().optional().describe('The expected output of the prompt.'),
  role: z.string().optional().describe('The role the AI should assume.'),
  context: z.string().optional().describe('The context in which the prompt will be used.'),
  existingPrompt: z.string().optional().describe('An existing prompt to improve.'),
  problemDescription: z.string().optional().describe('Description of the problem with the existing prompt.'),
  expectedChanges: z.string().optional().describe('Expected changes to the existing prompt.'),
});
export type IdentifyMissingPromptDetailsInput = z.infer<typeof IdentifyMissingPromptDetailsInputSchema>;

const IdentifyMissingPromptDetailsOutputSchema = z.object({
  missingDetails: z.array(z.string()).describe('A list of missing key details.'),
  questions: z.array(z.string()).describe('Targeted questions to fill in the missing details.'),
});
export type IdentifyMissingPromptDetailsOutput = z.infer<typeof IdentifyMissingPromptDetailsOutputSchema>;

export async function identifyMissingPromptDetails(
  input: IdentifyMissingPromptDetailsInput
): Promise<IdentifyMissingPromptDetailsOutput> {
  return identifyMissingPromptDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyMissingPromptDetailsPrompt',
  input: {schema: IdentifyMissingPromptDetailsInputSchema},
  output: {schema: IdentifyMissingPromptDetailsOutputSchema},
  prompt: `You are an AI prompt engineer assistant. Your task is to identify missing key details required for effective prompt generation and ask targeted question to the user to fill in the missing details.

  Analyze the provided information:
  Sample Input: {{{sampleInput}}}
  Expected Output: {{{expectedOutput}}}
  Role: {{{role}}}
  Context: {{{context}}}
  Existing Prompt: {{{existingPrompt}}}
  Problem Description: {{{problemDescription}}}
  Expected Changes: {{{expectedChanges}}}

  1.  Identify the missing key details required for effective prompt generation. Consider details such as sample input, expected output, role, context, etc.
  2.  Ask targeted questions to the user to fill in the missing details. The question should be clear and concise.
  3.  If the existing prompt is provided, analyze the prompt and identify the problem. Ask the user targeted question to improve the prompt.

  Return the missing details and targeted question in JSON format.
  {
    "missingDetails": ["missing detail 1", "missing detail 2", ...],
    "questions": ["question 1", "question 2", ...]
  }
  `,
});

const identifyMissingPromptDetailsFlow = ai.defineFlow(
  {
    name: 'identifyMissingPromptDetailsFlow',
    inputSchema: IdentifyMissingPromptDetailsInputSchema,
    outputSchema: IdentifyMissingPromptDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input, {
      model: 'googleai/gemini-2.5-flash'
    });
    return output!;
  }
);
