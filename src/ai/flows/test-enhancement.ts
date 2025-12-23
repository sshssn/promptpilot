'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TestEnhancementInputSchema = z.object({
  originalQuery: z.string().describe('The original user query'),
  scrapedKnowledge: z.string().describe('The knowledge from Joblogic documentation'),
});

export type TestEnhancementInput = z.infer<typeof TestEnhancementInputSchema>;

const TestEnhancementOutputSchema = z.object({
  enhancedPrompt: z.string().describe('The enhanced prompt with Joblogic knowledge integrated'),
  knowledgeUsed: z.array(z.string()).describe('Key pieces of knowledge that were used'),
  confidence: z.number().describe('Confidence score from 0-1'),
});

export type TestEnhancementOutput = z.infer<typeof TestEnhancementOutputSchema>;

export async function testEnhancementWithGemini(
  input: TestEnhancementInput
): Promise<TestEnhancementOutput> {
  return testEnhancementFlow(input);
}

const testEnhancementPrompt = ai.definePrompt({
  name: 'testEnhancementPrompt',
  input: { schema: TestEnhancementInputSchema },
  output: { schema: TestEnhancementOutputSchema },
  prompt: `You are an expert prompt engineer specializing in Joblogic Field Service Management software. Your task is to enhance a user's query with relevant information from the Joblogic knowledge base.

Original User Query: {{{originalQuery}}}

Available Joblogic Knowledge:
{{{scrapedKnowledge}}}

Instructions:
1. Analyze the original query to understand what the user is trying to accomplish
2. Identify the most relevant pieces of knowledge from the available content
3. Create an enhanced prompt that incorporates the relevant Joblogic-specific information
4. Ensure the enhanced prompt is clear, actionable, and includes specific Joblogic features/procedures
5. Maintain the user's original intent while adding valuable context

Enhanced Prompt:`,
});

const testEnhancementFlow = ai.defineFlow(
  {
    name: 'testEnhancementFlow',
    inputSchema: TestEnhancementInputSchema,
    outputSchema: TestEnhancementOutputSchema,
  },
  async input => {
    const { output } = await testEnhancementPrompt(input, {
      model: 'googleai/gemini-2.5-flash'
    });
    
    // Extract key knowledge pieces used (simplified extraction)
    const knowledgeUsed = extractKeyKnowledge(input.scrapedKnowledge);
    
    // Calculate confidence based on knowledge relevance
    const confidence = calculateConfidence(input.originalQuery, input.scrapedKnowledge);
    
    return {
      enhancedPrompt: output!.enhancedPrompt,
      knowledgeUsed,
      confidence,
    };
  }
);

function extractKeyKnowledge(knowledge: string): string[] {
  // Extract key points from the knowledge string
  const lines = knowledge.split('\n').filter(line => line.trim());
  const keyPoints: string[] = [];
  
  for (const line of lines) {
    if (line.startsWith('##') || line.startsWith('-') || line.startsWith('Step:')) {
      keyPoints.push(line.trim());
    }
  }
  
  return keyPoints.slice(0, 5); // Return top 5 key points
}

function calculateConfidence(query: string, knowledge: string): number {
  const queryWords = query.toLowerCase().split(/\s+/);
  const knowledgeWords = knowledge.toLowerCase().split(/\s+/);
  
  let matches = 0;
  for (const word of queryWords) {
    if (word.length > 3 && knowledgeWords.includes(word)) {
      matches++;
    }
  }
  
  return Math.min(matches / queryWords.length, 1);
}
