import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface PlaygroundConfig {
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  topK: number;
  stopSequences: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { messages, config }: { messages: ChatMessage[]; config: PlaygroundConfig } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    // Filter out system messages and prepare the conversation
    const conversationMessages = messages.filter(msg => msg.role !== 'system');
    
    // Create the system prompt
    const systemPrompt = config.systemPrompt || 'You are a helpful AI assistant.';

    // Create the streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Use the configured model or default to googleai/gemini-2.5-flash
          const modelName = config.model || 'googleai/gemini-2.5-flash';
          
          // Prepare the conversation for the AI
          const conversation = [
            { role: 'user', content: systemPrompt },
            ...conversationMessages.map(msg => ({
              role: msg.role,
              content: msg.content
            }))
          ];

          // Format conversation as string
          const conversationText = conversation
            .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
            .join('\n');

          // Create a simple prompt for the AI
          const prompt = `You are a helpful AI assistant. Respond to the user's messages naturally and helpfully.

Conversation:
${conversationText}

Assistant:`;

          // Use the AI model directly with streaming
          const generateResponse = ai.generate({
            model: modelName,
            prompt: prompt,
            config: {
              temperature: config.temperature,
              maxOutputTokens: config.maxTokens,
              topP: config.topP,
              topK: config.topK,
              stopSequences: config.stopSequences.length > 0 ? config.stopSequences : undefined,
            },
          });

          // Get the response (non-streaming for now)
          const result = await generateResponse;
          
          // Send the response
          if (result && result.text) {
            const data = JSON.stringify({ content: result.text });
            controller.enqueue(`data: ${data}\n\n`);
          } else {
            // Handle case where result is empty or doesn't have text
            const errorData = JSON.stringify({ 
              error: 'No response generated',
              details: 'The AI model did not generate a response'
            });
            controller.enqueue(`data: ${errorData}\n\n`);
          }

          // Send completion signal
          controller.enqueue(`data: ${JSON.stringify({ done: true })}\n\n`);
          controller.close();
        } catch (error) {
          console.error('Error in playground chat:', error);
          const errorData = JSON.stringify({ 
            error: 'Failed to generate response',
            details: error instanceof Error ? error.message : 'Unknown error'
          });
          controller.enqueue(`data: ${errorData}\n\n`);
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in playground chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
