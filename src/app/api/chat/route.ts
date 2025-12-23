import { NextRequest, NextResponse } from 'next/server';
import { getModelById } from '@/lib/models';

export async function POST(request: NextRequest) {
  try {
    const { messages, config } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    const model = getModelById(config.model);
    if (!model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 400 });
    }

    // Route to appropriate provider
    let targetUrl = '';
    switch (model.provider) {
      case 'openai':
        targetUrl = '/api/chat/openai';
        break;
      case 'deepseek':
        targetUrl = '/api/chat/deepseek';
        break;
      case 'googleai':
        targetUrl = '/api/playground/chat'; // Use existing Gemini route
        break;
      default:
        return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
    }

    // Forward the request to the appropriate provider
    const response = await fetch(`${request.nextUrl.origin}${targetUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages, config }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: 'Provider error', details: error }, { status: response.status });
    }

    // Return the streaming response
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
