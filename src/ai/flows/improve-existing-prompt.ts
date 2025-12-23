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
import {FileData} from '@/lib/file-utils';
import { routeSystemInstruction } from './system-instruction-router';
import { leakedPromptsContext } from '@/lib/leaked-prompts-context';

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
  files: z.array(z.object({
    name: z.string(),
    mimeType: z.string(),
    data: z.string()
  })).optional().describe('Optional files to include in the prompt improvement.'),
  agentPrompt: z.string().optional().describe('Optional agent prompt to use as reference for improvement.'),
  userSystemInstruction: z.string().optional().describe('User-provided system instruction to override default Joblogic standards.'),
  modelId: z.string().optional().describe('The selected model ID for model-specific guidance.'),
});
export type ImproveExistingPromptInput = z.infer<
  typeof ImproveExistingPromptInputSchema
>;

const ImproveExistingPromptOutputSchema = z.object({
  improvedPrompt: z.string().describe('The improved and refined prompt.'),
  appliedSystemInstruction: z.string().describe('The system instruction that was applied.'),
  instructionSource: z.enum(['user_instruction', 'lang_md_default']).describe('Source of the applied system instruction.'),
  reasoning: z.string().describe('Reasoning for the system instruction choice.'),
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
  prompt: `You are PromptPilot, an expert prompt engineering assistant for Joblogic employees. You help create and improve prompts for Joblogic's AI chatbot agents using the golden standard templates from lang.md and real-world examples from major AI providers.

  {{#if agentPrompt}}
  Reference Agent Prompt:
  {{{agentPrompt}}}
  
  Use this agent prompt as a reference for best practices and structure when improving the existing prompt.
  {{/if}}

  {{#if appliedSystemInstruction}}
  SYSTEM INSTRUCTION TO FOLLOW:
  {{{appliedSystemInstruction}}}
  
  IMPORTANT: You MUST follow the system instruction above when improving the prompt. This instruction takes precedence over any other guidance. Use this as your reference for best practices, structure, and compliance requirements.
  {{/if}}

  {{#if leakedPromptsGuidance}}
  LEAKED PROMPTS GUIDANCE:
  {{{leakedPromptsGuidance}}}
  
  Use these real-world examples from major AI providers (OpenAI, Anthropic, Google, etc.) as reference for best practices, structure, and quality standards.
  {{/if}}

  {{#if modelSpecificGuidance}}
  MODEL-SPECIFIC GUIDANCE:
  {{{modelSpecificGuidance}}}
  
  This guidance is specifically tailored for the selected model and includes exact matches from leaked prompts for that model.
  {{/if}}

## Joblogic Golden Standards Reference:
You have access to Joblogic's golden standard prompt templates from lang.md:
- supportchatbot_condition_agent: For classifying customer queries
- supportchatbot_other_agent: For general assistance with reasoning  
- supportchatbot_conversation_llm: For handling greetings and escalations
- supportchatbot_complex_agent: For advanced troubleshooting with probing
- supportchatbot_howto_agent: For step-by-step guidance

## Task:
Existing Prompt: {{{existingPrompt}}}
Problem Description: {{{problemDescription}}}
Expected Changes: {{{expectedChanges}}}

{{#if files}}
Additional Context from Files:
{{#each files}}
- {{name}} ({{mimeType}}): [File content provided as media]
{{/each}}
{{/if}}

## Your Instructions:
- Read the "Expected Changes" field VERY carefully and follow it PRECISELY
- If the expected changes ask for minimal modifications or specific additions, make ONLY those changes
- Preserve the original structure, formatting, and content unless specifically asked to change it
- If the expected changes say "keep most of it the same but only add X", then keep the original prompt intact and only add the requested element
- Do NOT rewrite, restructure, or improve anything that wasn't explicitly mentioned in the expected changes
- Do NOT make unnecessary changes beyond what is explicitly requested in the expected changes
- Do NOT change the tone, style, or approach unless specifically requested
- If only one specific issue needs fixing, fix ONLY that issue and leave everything else unchanged
- Your goal is to make the MINIMAL changes necessary to address the specific problem described
- ALWAYS follow the system instruction provided above if present
- Ensure the improved prompt follows Joblogic standards and includes proper tagging (#Answer, #Escalate, #Sensitive, etc.)
- Reference the golden standard templates from lang.md for structure and best practices
- Use leaked prompts examples as quality benchmarks and structure references

Improved Prompt:`, // Keep it as a single line.
});

const improveExistingPromptFlow = ai.defineFlow(
  {
    name: 'improveExistingPromptFlow',
    inputSchema: ImproveExistingPromptInputSchema,
    outputSchema: ImproveExistingPromptOutputSchema,
  },
  async input => {
    // Step 1: Route system instruction
    const systemInstructionResult = await routeSystemInstruction({
      userSystemInstruction: input.userSystemInstruction,
      userPrompt: input.existingPrompt,
      context: input.problemDescription
    });

    // Step 2: Get leaked prompts guidance with model-specific matching
    const guidanceContext = await leakedPromptsContext.getGuidanceContext(
      input.existingPrompt + ' ' + input.problemDescription,
      'improve',
      input.modelId
    );
    
    const leakedPromptsGuidance = await leakedPromptsContext.getPromptImprovementGuidance(
      input.existingPrompt,
      input.problemDescription
    );

    // Handle media files properly
    const mediaParts = [];
    if (input.files) {
      for (const file of input.files) {
        if (file.mimeType.startsWith('image/')) {
          mediaParts.push({
            media: {
              mimeType: file.mimeType,
              data: file.data
            }
          });
        }
      }
    }

    const {output} = await prompt({
      ...input,
      appliedSystemInstruction: systemInstructionResult.finalSystemInstruction,
      leakedPromptsGuidance: leakedPromptsGuidance,
      modelSpecificGuidance: guidanceContext.modelSpecificGuidance
    }, {
      model: 'googleai/gemini-2.5-flash',
      media: mediaParts
    });

    return {
      improvedPrompt: output!.improvedPrompt,
      appliedSystemInstruction: systemInstructionResult.finalSystemInstruction,
      instructionSource: systemInstructionResult.appliedSource,
      reasoning: systemInstructionResult.reasoning
    };
  }
);
