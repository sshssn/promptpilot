'use client';

import { cn } from '@/lib/utils';

interface LoadingAnimationProps {
  reasoning?: boolean;
  className?: string;
}

export function LoadingAnimation({ reasoning = false, className }: LoadingAnimationProps) {
  if (reasoning) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-sm text-muted-foreground">Reasoning...</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
      <span className="text-sm text-muted-foreground">Generating...</span>
    </div>
  );
}
