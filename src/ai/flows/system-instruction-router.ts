import { z } from 'zod';
import { ai } from '../genkit';

// Input schema for the system instruction router
export const SystemInstructionRouterInputSchema = z.object({
  userSystemInstruction: z.string().optional(),
  userPrompt: z.string(),
  context: z.string().optional(),
});

// Output schema for the system instruction router
export const SystemInstructionRouterOutputSchema = z.object({
  shouldUseLangMd: z.boolean(),
  finalSystemInstruction: z.string(),
  reasoning: z.string(),
  appliedSource: z.enum(['user_instruction', 'lang_md_default']),
});

export type SystemInstructionRouterInput = z.infer<typeof SystemInstructionRouterInputSchema>;
export type SystemInstructionRouterOutput = z.infer<typeof SystemInstructionRouterOutputSchema>;

// Default system instruction for prompt creation/improvement using golden standards
const DEFAULT_GOLDEN_STANDARD_SYSTEM_INSTRUCTION = `You are PromptPilot, an expert prompt engineering assistant. Your role is to help create, improve, and refine prompts for AI agents and chatbots.

## Your Purpose:
- Help users create high-quality prompts for AI systems
- Improve existing prompts while maintaining professional standards
- Ensure all prompts follow proven templates and best practices
- Provide guidance on prompt structure, tagging, and compliance

## Reference Standards:
You have access to golden standard prompt templates including:
- condition_agent: For classifying user queries and routing
- conversation_agent: For handling greetings and escalations  
- complex_agent: For advanced troubleshooting with probing
- howto_agent: For step-by-step guidance and instructions
- general_agent: For general assistance with reasoning

## When Creating/Improving Prompts:
1. Use proven templates as your reference for structure and best practices
2. Ensure proper tagging system (#Answer, #Escalate, #Sensitive, etc.)
3. Include reasoning requirements and response guidelines
4. Maintain professional tone and compliance standards
5. Follow specific agent patterns from the golden standards

## Your Response Style:
- Be helpful and professional
- Provide clear, actionable guidance
- Reference the golden standards when relevant
- Explain your reasoning for prompt improvements
- Focus on creating effective AI agent prompts

Remember: You are helping users create prompts FOR their AI agents, not acting as an AI agent yourself.`;

/**
 * System Instruction Router
 * 
 * This function determines whether to use the user's system instruction or fall back to the default golden standard instruction.
 * 
 * Logic:
 * - If user provides a system instruction (non-empty, meaningful content) → Use user instruction
 * - If user provides no system instruction or empty/placeholder content → Use golden standard default
 * 
 * @param input - Contains user system instruction, user prompt, and optional context
 * @returns Router decision with final system instruction and reasoning
 */
export async function routeSystemInstruction(
  input: SystemInstructionRouterInput,
  useGoldenStandard: boolean = true
): Promise<SystemInstructionRouterOutput> {
  // If golden standard is disabled, always use user instruction
  if (!useGoldenStandard) {
    return {
      shouldUseLangMd: false,
      finalSystemInstruction: input.userSystemInstruction || 'You are a helpful AI assistant.',
      reasoning: "Using custom instruction as Golden Standard is disabled.",
      appliedSource: "user_instruction"
    };
  }
  
  return systemInstructionRouterFlow(input);
}

const systemInstructionRouterPrompt = ai.definePrompt({
  name: 'systemInstructionRouterPrompt',
  input: { schema: SystemInstructionRouterInputSchema },
  output: { schema: SystemInstructionRouterOutputSchema },
  prompt: `You are a system instruction router for PromptPilot. Your job is to determine whether to use a user's custom system instruction or fall back to the default golden standard instruction set.

## Decision Logic (CONSERVATIVE APPROACH):

**Use User Instruction ONLY When:**
- User has provided a VERY specific, detailed system instruction
- The instruction is clearly custom and not generic
- The instruction contains specific guidance that overrides golden standards
- The instruction is substantial (at least 50+ characters of meaningful content)

**Use Default Golden Standard Instruction When:**
- User has not provided any system instruction
- User instruction is empty or contains only placeholder text
- User instruction is generic (like "You are a helpful assistant", "Assistant", "AI", etc.)
- User instruction is just example text or placeholders
- User instruction is short or not specific enough
- User instruction contains common AI assistant phrases

## Input Analysis:
User System Instruction: "{{userSystemInstruction}}"
User Prompt: "{{userPrompt}}"
Context: "{{context}}"

## Your Task:
1. Analyze the user's system instruction for meaningfulness and specificity
2. DEFAULT to golden standard instruction unless the user instruction is clearly custom and specific
3. Be conservative - prefer Golden Standard unless user has explicitly provided custom guidance
3. Provide clear reasoning for your decision
4. Return the appropriate system instruction

## Output Requirements:
- shouldUseLangMd: true if using default golden standard instruction, false if using user instruction
- finalSystemInstruction: The complete system instruction to use
- reasoning: Clear explanation of why this decision was made
- appliedSource: Either "user_instruction" or "golden_standard_default"

Remember: The goal is to respect user intent while ensuring proper compliance with golden standards when no specific instruction is provided.`,
});

const systemInstructionRouterFlow = ai.defineFlow(
  {
    name: 'systemInstructionRouterFlow',
    inputSchema: SystemInstructionRouterInputSchema,
    outputSchema: SystemInstructionRouterOutputSchema,
  },
  async input => {
    // Quick heuristic check first - be more conservative
    const hasUserInstruction = input.userSystemInstruction && 
      input.userSystemInstruction.trim().length > 50 && // Increased threshold
      !isPlaceholderText(input.userSystemInstruction);

    if (!hasUserInstruction) {
      return {
        shouldUseLangMd: true,
        finalSystemInstruction: DEFAULT_GOLDEN_STANDARD_SYSTEM_INSTRUCTION,
        reasoning: "Using Golden Standard (proven templates). No meaningful custom instruction provided.",
        appliedSource: "golden_standard_default"
      };
    }

    // Use AI to make the final decision for edge cases
    const { output } = await systemInstructionRouterPrompt(input, {
      model: 'googleai/gemini-2.5-flash'
    });

    return output!;
  }
);

/**
 * Helper function to detect placeholder or example text
 */
function isPlaceholderText(instruction: string): boolean {
  const defaultPatterns = [
    /^enter detailed instructions/i,
    /^for example/i,
    /^you are a helpful assistant$/i,
    /^you are a helpful ai$/i,
    /^you are an ai assistant$/i,
    /^you are chatgpt$/i,
    /^you are claude$/i,
    /^you are gemini$/i,
    /^you are a language model$/i,
    /^you are an ai$/i,
    /^assistant$/i,
    /^ai assistant$/i,
    /^helpful assistant$/i,
    /^ai$/i,
    /^bot$/i,
    /^chatbot$/i,
    /^provide accurate and helpful responses$/i,
    /^be polite and professional$/i,
    /^placeholder/i,
    /^example/i,
    /^enter your/i,
    /^type your/i,
    /^add your/i
  ];

  const trimmed = instruction.trim();
  
  // Check if it's too short to be meaningful
  if (trimmed.length < 50) return true;
  
  // Check for default/placeholder patterns
  return defaultPatterns.some(pattern => pattern.test(trimmed));
}
