import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';
import { routeSystemInstruction } from '@/ai/flows/system-instruction-router';
import { mapModelToApiModel } from '@/lib/models';

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
  useGoldenStandard?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, config }: { messages: ChatMessage[]; config: PlaygroundConfig } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    // Filter out system messages and prepare the conversation
    const conversationMessages = messages.filter(msg => msg.role !== 'system');
    
    // Extract golden standard preference
    const useGoldenStandard = config.useGoldenStandard !== false; // Default to true
    
    // Route system instruction to determine which one to use
    const systemInstructionResult = await routeSystemInstruction({
      userSystemInstruction: config.systemPrompt,
      userPrompt: conversationMessages[conversationMessages.length - 1]?.content || '',
      context: 'playground_chat'
    }, useGoldenStandard);

    const systemPrompt = systemInstructionResult.finalSystemInstruction;

    // Create the streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const modelName = config.model || 'googleai/gemini-2.5-flash';
          const mappedModel = mapModelToApiModel(modelName);
          
          // Prepare the conversation with system instruction
          const conversation = [
            { role: 'system', content: systemPrompt },
            ...conversationMessages.map(msg => ({
              role: msg.role,
              content: msg.content
            }))
          ];

          let response: string = '';
          let tokenUsage: any = null;

          // Handle different providers
          if (modelName.startsWith('googleai/')) {
            // Use Genkit for Gemini models
            const prompt = conversation
              .map(msg => {
                if (msg.role === 'system') {
                  return `System: ${msg.content}`;
                }
                return `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`;
              })
              .join('\n') + '\n\nAssistant:';

            const generateResponse = ai.generate({
              model: mappedModel,
              prompt: prompt,
              config: {
                temperature: config.temperature,
                maxOutputTokens: config.maxTokens,
                topP: config.topP,
                topK: config.topK,
                stopSequences: config.stopSequences && config.stopSequences.length > 0 ? config.stopSequences : undefined,
              },
            });

            const result = await generateResponse;
            response = result?.text || '';
            
            // Capture token usage for Gemini
            if (result?.usage) {
              tokenUsage = {
                prompt_tokens: result.usage.inputTokens || 0,
                completion_tokens: result.usage.outputTokens || 0,
                total_tokens: result.usage.totalTokens || 0
              };
            }
          } else if (modelName.startsWith('gpt') || modelName.startsWith('o3')) {
            // Use direct OpenAI API
            const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: mappedModel,
                messages: conversation,
                temperature: config.temperature,
                max_tokens: config.maxTokens,
                top_p: config.topP,
                stop: config.stopSequences && config.stopSequences.length > 0 ? config.stopSequences : undefined,
              }),
            });

            if (!openaiResponse.ok) {
              throw new Error(`OpenAI API error: ${openaiResponse.status}`);
            }

            const openaiData = await openaiResponse.json();
            response = openaiData.choices?.[0]?.message?.content || '';
            
            // Capture token usage for OpenAI
            if (openaiData.usage) {
              tokenUsage = {
                prompt_tokens: openaiData.usage.prompt_tokens || 0,
                completion_tokens: openaiData.usage.completion_tokens || 0,
                total_tokens: openaiData.usage.total_tokens || 0
              };
            }
          } else if (modelName.startsWith('deepseek')) {
            // Use direct DeepSeek API with streaming
            const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: mappedModel,
                messages: conversation,
                temperature: config.temperature,
                max_tokens: config.maxTokens,
                top_p: config.topP,
                stop: config.stopSequences && config.stopSequences.length > 0 ? config.stopSequences : undefined,
                stream: true
              }),
            });

            if (!deepseekResponse.ok) {
              const errorText = await deepseekResponse.text();
              throw new Error(`DeepSeek API error: ${deepseekResponse.status} - ${errorText}`);
            }

            // Handle streaming response
            const reader = deepseekResponse.body?.getReader();
            if (!reader) {
              throw new Error('No response body for streaming');
            }

            const decoder = new TextDecoder();
            let done = false;

            while (!done) {
              const { value, done: readerDone } = await reader.read();
              done = readerDone;

              if (value) {
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    try {
                      const data = JSON.parse(line.slice(6));
                      if (data.choices?.[0]?.delta?.content) {
                        const content = data.choices[0].delta.content;
                        controller.enqueue(`data: ${JSON.stringify({ content })}\n\n`);
                      }
                      
                      // Capture token usage for DeepSeek
                      if (data.usage) {
                        tokenUsage = {
                          prompt_tokens: data.usage.prompt_tokens || 0,
                          completion_tokens: data.usage.completion_tokens || 0,
                          total_tokens: data.usage.total_tokens || 0
                        };
                      }
                    } catch (e) {
                      // Ignore parsing errors for incomplete chunks
                    }
                  }
                }
              }
            }
          } else {
            throw new Error(`Unsupported model: ${modelName}`);
          }
          
          // For non-streaming models, send the response
          if (response && !modelName.startsWith('deepseek')) {
            const data = JSON.stringify({ content: response });
            controller.enqueue(`data: ${data}\n\n`);
          }

          // Send token usage if available
          if (tokenUsage) {
            controller.enqueue(`data: ${JSON.stringify({ usage: tokenUsage })}\n\n`);
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
