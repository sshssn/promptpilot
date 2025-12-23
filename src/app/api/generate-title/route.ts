import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Simple title generation based on message content
    // In a real implementation, you'd call your AI service here
    const title = generateTitleFromMessage(message);
    
    return NextResponse.json({ title });
  } catch (error) {
    console.error('Error generating title:', error);
    return NextResponse.json({ error: 'Failed to generate title' }, { status: 500 });
  }
}

function generateTitleFromMessage(message: string): string {
  // Clean the message
  const cleanMessage = message.trim().replace(/[^\w\s]/g, '');
  
  // Extract first few words
  const words = cleanMessage.split(' ').slice(0, 6);
  
  // Capitalize first letter of each word
  const title = words.map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
  
  // If title is too short, add context
  if (title.length < 10) {
    return `${title} Discussion`;
  }
  
  // If title is too long, truncate
  if (title.length > 50) {
    return title.substring(0, 47) + '...';
  }
  
  return title;
}
