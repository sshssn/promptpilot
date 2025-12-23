'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Zap, Target, Palette, Code, Save } from 'lucide-react';
import { getModelById } from '@/lib/models';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface ChatSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: string;
  onModelChange: (model: string) => void;
  temperature: number;
  onTemperatureChange: (temperature: number) => void;
  maxTokens: number;
  onMaxTokensChange: (maxTokens: number) => void;
  systemPrompt: string;
  onSystemPromptChange: (prompt: string) => void;
  availableModels: Array<{
    id: string;
    name: string;
    icon: string;
    description: string;
    capabilities: string[];
  }>;
  useGoldenStandard?: boolean;
  customPrompt?: string;
  onCustomPromptChange?: (prompt: string) => void;
}

export function ChatSettingsModal({
  isOpen,
  onClose,
  model,
  onModelChange,
  temperature,
  onTemperatureChange,
  maxTokens,
  onMaxTokensChange,
  systemPrompt,
  onSystemPromptChange,
  availableModels,
  useGoldenStandard = true,
  customPrompt = '',
  onCustomPromptChange
}: ChatSettingsModalProps) {
  const [localTemperature, setLocalTemperature] = useState(temperature);
  const [localMaxTokens, setLocalMaxTokens] = useState(maxTokens);
  const [localSystemPrompt, setLocalSystemPrompt] = useState(systemPrompt);
  const [localCustomPrompt, setLocalCustomPrompt] = useState(customPrompt);
  const { toast } = useToast();

  // Update local state when props change
  useEffect(() => {
    setLocalTemperature(temperature);
    setLocalMaxTokens(maxTokens);
    setLocalSystemPrompt(systemPrompt);
    setLocalCustomPrompt(customPrompt);
  }, [temperature, maxTokens, systemPrompt, customPrompt]);

  const handleSave = () => {
    onTemperatureChange(localTemperature);
    onMaxTokensChange(localMaxTokens);
    onSystemPromptChange(localSystemPrompt);
    
    // Save custom prompt if provided
    if (onCustomPromptChange) {
      onCustomPromptChange(localCustomPrompt);
    }
    
    // Show success feedback
    toast({
      title: "Settings Saved",
      description: "Your chat settings have been updated successfully.",
      duration: 2000,
    });
    
    onClose();
  };

  const handleModelChange = (newModel: string) => {
    onModelChange(newModel);
    // Auto-adjust temperature for the new model
    const modelConfig = getModelById(newModel);
    if (modelConfig?.temperatureRestrictions?.default !== undefined) {
      setLocalTemperature(modelConfig.temperatureRestrictions.default);
    }
  };

  const currentModel = getModelById(model);
  const temperatureRestrictions = currentModel?.temperatureRestrictions;

  const presets = [
    {
      name: 'Focused & Precise',
      icon: Target,
      description: 'Best for factual, accurate responses',
      config: { temperature: 0.1, maxTokens: 1000 }
    },
    {
      name: 'Balanced',
      icon: Settings,
      description: 'Good balance of creativity and accuracy',
      config: { temperature: 0.7, maxTokens: 2000 }
    },
    {
      name: 'Creative & Diverse',
      icon: Palette,
      description: 'Maximum creativity and variety',
      config: { temperature: 1.2, maxTokens: 3000 }
    }
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setLocalTemperature(preset.config.temperature);
    setLocalMaxTokens(preset.config.maxTokens);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Chat Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="model">Model</TabsTrigger>
            <TabsTrigger value="prompt">System Prompt</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            {/* Presets */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Quick Presets</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {presets.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start gap-2"
                    onClick={() => applyPreset(preset)}
                  >
                    <div className="flex items-center gap-2">
                      <preset.icon className="h-4 w-4" />
                      <span className="font-medium">{preset.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground text-left">
                      {preset.description}
                    </p>
                  </Button>
                ))}
              </div>
            </div>

            {/* Temperature */}
            <div className="space-y-3">
              <Label className="text-base font-medium">
                Temperature: {localTemperature}
                {temperatureRestrictions?.supportedValues?.length === 1 && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (Fixed at {temperatureRestrictions.supportedValues[0]})
                  </span>
                )}
              </Label>
              
              {temperatureRestrictions?.supportedValues?.length === 1 ? (
                <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground border">
                  This model only supports temperature = {temperatureRestrictions.supportedValues[0]}
                </div>
              ) : (
                <>
                  <Slider
                    min={temperatureRestrictions?.min ?? 0}
                    max={temperatureRestrictions?.max ?? 1}
                    step={0.1}
                    value={[localTemperature]}
                    onValueChange={([value]) => setLocalTemperature(value)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Focused ({temperatureRestrictions?.min ?? 0})</span>
                    <span>Balanced (0.7)</span>
                    <span>Creative ({temperatureRestrictions?.max ?? 1})</span>
                  </div>
                </>
              )}
            </div>

            {/* Max Tokens */}
            <div className="space-y-3">
              <Label className="text-base font-medium">
                Max Tokens: {localMaxTokens}
              </Label>
              <Slider
                min={100}
                max={4000}
                step={100}
                value={[localMaxTokens]}
                onValueChange={([value]) => setLocalMaxTokens(value)}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Short (100)</span>
                <span>Medium (2000)</span>
                <span>Long (4000)</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="model" className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-medium">AI Model</Label>
              <Select value={model} onValueChange={handleModelChange}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((modelOption) => (
                    <SelectItem key={modelOption.id} value={modelOption.id} className="py-3">
                      <div className="flex items-center gap-3">
                        <Image
                          src={modelOption.icon}
                          alt={modelOption.name}
                          width={20}
                          height={20}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{modelOption.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {modelOption.description}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentModel && (
              <div className="space-y-3">
                <Label className="text-base font-medium">Model Capabilities</Label>
                <div className="flex flex-wrap gap-2">
                  {currentModel.capabilities.map((capability) => (
                    <Badge key={capability} variant="secondary">
                      {capability}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="prompt" className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-medium">
                {useGoldenStandard ? 'System Prompt' : 'Custom Prompt'}
              </Label>
              <Textarea
                value={useGoldenStandard ? localSystemPrompt : localCustomPrompt}
                onChange={(e) => {
                  if (useGoldenStandard) {
                    setLocalSystemPrompt(e.target.value);
                  } else {
                    setLocalCustomPrompt(e.target.value);
                  }
                }}
                placeholder={useGoldenStandard ? "Enter system prompt for this model..." : "Enter your custom prompt..."}
                className="min-h-[300px] resize-none font-mono text-sm"
                maxLength={2000}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Characters: {(useGoldenStandard ? localSystemPrompt : localCustomPrompt).length}/2000</span>
                <span>Lines: {(useGoldenStandard ? localSystemPrompt : localCustomPrompt).split('\n').length}</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
