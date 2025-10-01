import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { messages, config } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      console.error('DeepSeek API key not configured');
      return NextResponse.json({ error: 'DeepSeek API key not configured' }, { status: 500 });
    }
    
    console.log('DeepSeek API key found, length:', apiKey.length);

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Map model ID to DeepSeek model name
          const modelMapping: { [key: string]: string } = {
            'deepseek-v3.1': 'deepseek-chat',
            'deepseek-v3.1-thinking': 'deepseek-chat'
          };
          
          const deepseekModel = modelMapping[config.model] || 'deepseek-chat';
          
          const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: deepseekModel,
              messages: messages.map(msg => ({
                role: msg.role,
                content: msg.content
              })),
              temperature: config.temperature || 1.0,
              max_tokens: config.maxTokens || 1000,
              stream: true
            })
          });

          if (!response.ok) {
            const error = await response.text();
            console.error('DeepSeek API error:', {
              status: response.status,
              statusText: response.statusText,
              error: error,
              model: deepseekModel,
              apiKeyLength: apiKey.length
            });
            throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('No response body for streaming');
          }

          const decoder = new TextDecoder();
          let done = false;

          try {
            while (true) {
              const { value, done: readerDone } = await reader.read();
              done = readerDone;
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data === '[DONE]') {
                    controller.enqueue(`data: ${JSON.stringify({ done: true })}\n\n`);
                    controller.close();
                    return;
                  }

                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices?.[0]?.delta?.content;
                    if (content) {
                      const data = JSON.stringify({ content });
                      controller.enqueue(`data: ${data}\n\n`);
                    }
                    
                    // Capture token usage
                    if (parsed.usage) {
                      const usageData = JSON.stringify({ usage: parsed.usage });
                      controller.enqueue(`data: ${usageData}\n\n`);
                    }
                  } catch (e) {
                    // Skip invalid JSON
                  }
                }
              }
            }
          } finally {
            reader.releaseLock();
          }
        } catch (error) {
          console.error('Error in DeepSeek chat:', error);
          const errorData = JSON.stringify({ 
            error: 'Failed to generate response',
            details: error instanceof Error ? error.message : 'Unknown error',
            isError: true
          });
          controller.enqueue(`data: ${errorData}\n\n`);
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('DeepSeek API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
