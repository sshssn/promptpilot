'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useModel, useModelsByProvider } from '@/contexts/model-context';
import { useToast } from '@/hooks/use-toast';
import { ChevronDown, Loader2, Check } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { getModelIcon } from '@/lib/models';

interface ModelToggleProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

export function ModelToggle({ 
  className, 
  showLabel = true, 
  variant = 'outline',
  size = 'sm'
}: ModelToggleProps) {
  const { activeModel, switchModel, isLoading } = useModel();
  const { toast } = useToast();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const openaiModels = useModelsByProvider('openai');
  const deepseekModels = useModelsByProvider('deepseek');
  const googleaiModels = useModelsByProvider('googleai');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleModelSwitch = async (modelId: string) => {
    // Find the model in any of the provider arrays
    const allModels = [...openaiModels, ...deepseekModels, ...googleaiModels];
    const newModel = allModels.find(m => m.id === modelId);
    const success = await switchModel(modelId);
    if (success) {
      toast({
        title: "Model Switched",
        description: `Now using ${newModel?.name || 'Unknown Model'}`,
        duration: 2000,
      });
    } else {
      toast({
        variant: 'destructive',
        title: "Switch Failed",
        description: "Failed to switch model. Please try again.",
        duration: 3000,
      });
    }
    setIsOpen(false);
  };

  const getModelIconPath = (modelId: string) => {
    return getModelIcon(modelId, theme || 'light');
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'openai': return 'OpenAI';
      case 'deepseek': return 'DeepSeek';
      case 'googleai': return 'Google AI';
      default: return provider;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={`gap-2 ${className} ${mounted && theme === 'light' ? 'bg-slate-800 hover:bg-slate-700 text-white' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Image
              src={getModelIconPath(activeModel.id)}
              alt={activeModel.name}
              width={16}
              height={16}
              className="flex-shrink-0"
            />
          )}
          {showLabel && (
            <span className="font-medium">
              {activeModel.name}
            </span>
          )}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Switch AI Model
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* OpenAI Models */}
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
          OpenAI
        </DropdownMenuLabel>
        {openaiModels.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => handleModelSwitch(model.id)}
            className="flex items-center gap-3 px-2 py-2"
          >
            <Image
              src={getModelIconPath(model.id)}
              alt={model.name}
              width={16}
              height={16}
              className="flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{model.name}</span>
                {model.isLatest && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                    Latest
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {model.description}
              </p>
            </div>
            {activeModel.id === model.id && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {/* DeepSeek Models */}
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
          DeepSeek
        </DropdownMenuLabel>
        {deepseekModels.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => handleModelSwitch(model.id)}
            className="flex items-center gap-3 px-2 py-2"
          >
            <Image
              src={getModelIconPath(model.id)}
              alt={model.name}
              width={16}
              height={16}
              className="flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{model.name}</span>
                {model.isLatest && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                    Latest
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {model.description}
              </p>
            </div>
            {activeModel.id === model.id && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {/* Google AI Models */}
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
          Google AI
        </DropdownMenuLabel>
        {googleaiModels.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => handleModelSwitch(model.id)}
            className="flex items-center gap-3 px-2 py-2"
          >
            <Image
              src={getModelIconPath(model.id)}
              alt={model.name}
              width={16}
              height={16}
              className="flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{model.name}</span>
                {model.isLatest && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                    Latest
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {model.description}
              </p>
            </div>
            {activeModel.id === model.id && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
