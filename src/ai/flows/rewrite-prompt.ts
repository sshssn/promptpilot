'use server';

/**
 * @fileOverview An AI agent for rewriting follow-up questions into standalone questions.
 *
 * - rewritePrompt - A function that transforms a follow-up question into a standalone question.
 * - RewritePromptInput - The input type for the rewritePrompt function.
 * - RewritePromptOutput - The return type for the rewritePrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RewritePromptInputSchema = z.object({
  chatHistory: z
    .string()
    .optional()
    .describe('The chat history to provide context for the follow-up question.'),
  followUpQuestion: z
    .string()
    .describe('The follow-up question that needs to be rewritten into a standalone question.'),
});
export type RewritePromptInput = z.infer<typeof RewritePromptInputSchema>;

const RewritePromptOutputSchema = z.object({
  standaloneQuestion: z.string().describe('The rewritten standalone question that preserves the original meaning.'),
});
export type RewritePromptOutput = z.infer<typeof RewritePromptOutputSchema>;

export async function rewritePrompt(
  input: RewritePromptInput
): Promise<RewritePromptOutput> {
  return rewritePromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'rewritePromptPrompt',
  input: {schema: RewritePromptInputSchema},
  output: {schema: RewritePromptOutputSchema},
  prompt: `You are an expert at transforming follow-up questions into standalone questions that preserve the original meaning.

## 📌 Responsibilities

1. **Analyze Inputs**
   - **Chat History ({{chatHistory}}):** Use only when necessary to fill in missing context.  
   - **Follow-Up Question ({{followUpQuestion}}):** Identify whether it already makes sense on its own.

2. **Rewrite the Question**
   - If the follow-up question **depends on prior context**, rewrite it into a **fully self-contained question**.  
   - If the follow-up is **already standalone**, leave it **unchanged**.  
   - Ensure the rewritten version is:
     - **Natural** (flows like a normal question).  
     - **Unambiguous** (no missing context).  
     - **Self-contained** (understandable without chat history).

3. **Preserve Meaning**
   - Do not alter the **intent** or **scope** of the original follow-up.  
   - Only add context necessary to make it complete.  

## 📤 Output Format

Always return in the following format:

Standalone Question: <rephrased_question_here>

{{#if chatHistory}}
Chat History:
{{chatHistory}}

{{/if}}
Follow-Up Question: {{followUpQuestion}}

Rewrite the follow-up question into a standalone question:`,
});

const rewritePromptFlow = ai.defineFlow(
  {
    name: 'rewritePromptFlow',
    inputSchema: RewritePromptInputSchema,
    outputSchema: RewritePromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input, {
      model: 'googleai/gemini-2.5-flash'
    });
    return output!;
  }
);

