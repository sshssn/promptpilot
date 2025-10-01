'use client';

import Image from 'next/image';
import { Bot } from 'lucide-react';

interface ModelIconProps {
  modelId: string;
  size?: number;
  className?: string;
}

export function ModelIcon({ modelId, size = 16, className = '' }: ModelIconProps) {
  // Determine the logo based on model ID
  const getModelLogo = (modelId: string) => {
    const lowerModelId = modelId.toLowerCase();
    
    if (lowerModelId.includes('gpt') || lowerModelId.includes('openai') || lowerModelId.includes('o1')) {
      return '/openai-color.svg';
    } else if (lowerModelId.includes('deepseek')) {
      return '/deepseek-color.svg';
    } else if (lowerModelId.includes('gemini') || lowerModelId.includes('google') || lowerModelId.includes('claude')) {
      return '/gemini-color.svg';
    }
    return null;
  };

  const logoSrc = getModelLogo(modelId);

  if (logoSrc) {
    return (
      <Image
        src={logoSrc}
        alt={`${modelId} logo`}
        width={size}
        height={size}
        className={className}
      />
    );
  }

  // Fallback to generic bot icon
  return <Bot className={`h-${size/4} w-${size/4} ${className}`} />;
}
