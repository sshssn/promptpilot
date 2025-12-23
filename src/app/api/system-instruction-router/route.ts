import { NextRequest, NextResponse } from 'next/server';
import { routeSystemInstruction } from '@/ai/flows/system-instruction-router';

export async function POST(request: NextRequest) {
  try {
    const { userSystemInstruction, userPrompt, context, useGoldenStandard = true } = await request.json();

    if (!userPrompt) {
      return NextResponse.json({ error: 'User prompt is required' }, { status: 400 });
    }

    const result = await routeSystemInstruction({
      userSystemInstruction: userSystemInstruction || '',
      userPrompt,
      context: context || 'playground'
    }, useGoldenStandard);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in system instruction router API:', error);
    return NextResponse.json(
      { error: 'Failed to route system instruction' }, 
      { status: 500 }
    );
  }
}

