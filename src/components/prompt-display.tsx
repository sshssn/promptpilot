
'use client';

import { useState } from 'react';
import { Copy, Check, Maximize2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PromptDisplayProps {
  prompt: string;
}

export function PromptDisplay({ prompt }: PromptDisplayProps) {
  const [hasCopied, setHasCopied] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(prompt);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <>
      <div className="relative group">
        <TooltipProvider>
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={copyToClipboard}
                >
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copy prompt</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copied!</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => setIsFullScreen(true)}
                >
                  <Maximize2 className="h-4 w-4" />
                  <span className="sr-only">View full screen</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View full screen</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
        <pre className="p-6 bg-muted/50 rounded-lg font-code text-sm whitespace-pre-wrap break-words border">
          <code>{prompt}</code>
        </pre>
      </div>

      <Dialog open={isFullScreen} onOpenChange={setIsFullScreen}>
        <DialogContent className="max-w-6xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <DialogTitle>Prompt Preview</DialogTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyToClipboard}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsFullScreen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="p-6 pt-0 overflow-auto max-h-[calc(90vh-120px)]">
            <pre className="font-code text-sm whitespace-pre-wrap break-words bg-muted/50 p-6 rounded-lg border">
              <code>{prompt}</code>
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
