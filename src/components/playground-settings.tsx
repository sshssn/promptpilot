'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Plus, Maximize2, Settings, Zap, Target, Palette, Code, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useModel, useModelsByProvider } from '@/contexts/model-context';
import { getModelById } from '@/lib/models';
import Image from 'next/image';

interface PlaygroundConfig {
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  topK: number;
  stopSequences: string[];
}

interface PlaygroundSettingsProps {
  config: PlaygroundConfig;
  onConfigChange: (config: Partial<PlaygroundConfig>) => void;
}

// Models will be loaded from context

export function PlaygroundSettings({ config, onConfigChange }: PlaygroundSettingsProps) {
  const [newStopSequence, setNewStopSequence] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { toast } = useToast();
  const { activeModel, switchModel } = useModel();
  const openaiModels = useModelsByProvider('openai');
  const deepseekModels = useModelsByProvider('deepseek');
  const googleaiModels = useModelsByProvider('googleai');

  const handleStopSequenceAdd = () => {
    if (newStopSequence.trim() && !config.stopSequences.includes(newStopSequence.trim())) {
      onConfigChange({
        stopSequences: [...config.stopSequences, newStopSequence.trim()]
      });
      setNewStopSequence('');
    }
  };

  const handleStopSequenceRemove = (sequence: string) => {
    onConfigChange({
      stopSequences: config.stopSequences.filter(s => s !== sequence)
    });
  };

  const handleStopSequenceKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleStopSequenceAdd();
    }
  };

  // Handle config changes with success notification
  const handleConfigChangeWithNotification = (changes: Partial<PlaygroundConfig>) => {
    // If model is changing, adjust temperature to model's default
    if (changes.model) {
      const newModel = getModelById(changes.model);
      if (newModel?.temperatureRestrictions?.default !== undefined) {
        changes.temperature = newModel.temperatureRestrictions.default;
      }
    }
    
    onConfigChange(changes);
    toast({
      title: "Settings Saved",
      description: "Your playground settings have been updated successfully.",
      duration: 2000,
    });
  };

  const presets = [
    {
      name: 'Focused & Precise',
      icon: Target,
      description: 'Best for factual, accurate responses',
      config: { temperature: 0.1, topP: 0.9, topK: 40, maxTokens: 1000 }
    },
    {
      name: 'Balanced',
      icon: Settings,
      description: 'Good balance of creativity and accuracy',
      config: { temperature: 0.7, topP: 0.9, topK: 40, maxTokens: 2000 }
    },
    {
      name: 'Creative & Diverse',
      icon: Palette,
      description: 'Maximum creativity and variety',
      config: { temperature: 1.2, topP: 0.95, topK: 60, maxTokens: 3000 }
    }
  ];

  return (
    <>
      <Tabs defaultValue="instructions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="instructions" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Instructions
          </TabsTrigger>
          <TabsTrigger value="model" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Model
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="instructions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    System Instructions
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Define how the AI should behave and respond
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullScreen(true)}
                  className="gap-2"
                >
                  <Maximize2 className="h-4 w-4" />
                  Full Screen
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="systemPrompt" className="text-base font-medium">
                    AI Instructions
                  </Label>
                  <Textarea
                    id="systemPrompt"
                    value={config.systemPrompt}
                    onChange={(e) => handleConfigChangeWithNotification({ systemPrompt: e.target.value })}
                    placeholder="Enter detailed instructions for the AI. For example:

You are a helpful assistant specialized in customer support. Your role is to:
- Provide accurate and helpful responses
- Be polite and professional
- Ask clarifying questions when needed
- Escalate complex issues when appropriate

Guidelines:
- Always greet customers professionally
- Use clear, concise language
- Provide step-by-step solutions when possible"
                    className="min-h-[200px] resize-none font-mono text-sm"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Characters: {config.systemPrompt.length}</span>
                    <span>Lines: {config.systemPrompt.split('\n').length}</span>
                  </div>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">💡 Pro Tips</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Be specific about the AI's role and personality</li>
                    <li>• Include examples of good and bad responses</li>
                    <li>• Set clear boundaries and constraints</li>
                    <li>• Use formatting to make instructions clear</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="model" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Model Configuration
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Choose your AI model and adjust generation parameters
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="model" className="text-base font-medium">AI Model</Label>
                <Select value={config.model} onValueChange={(value) => handleConfigChangeWithNotification({ model: value })}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* OpenAI Models */}
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">OpenAI</div>
                    {openaiModels.map((model) => (
                      <SelectItem key={model.id} value={model.id} className="py-3">
                        <div className="flex items-center gap-3">
                          <Image
                            src="/openai-color.svg"
                            alt={model.name}
                            width={16}
                            height={16}
                            className="flex-shrink-0"
                          />
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{model.name}</span>
                              {model.isLatest && (
                                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                                  Latest
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">{model.description}</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                    
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">DeepSeek</div>
                    {deepseekModels.map((model) => (
                      <SelectItem key={model.id} value={model.id} className="py-3">
                        <div className="flex items-center gap-3">
                          <Image
                            src="/deepseek-color.svg"
                            alt={model.name}
                            width={16}
                            height={16}
                            className="flex-shrink-0"
                          />
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{model.name}</span>
                              {model.isLatest && (
                                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                                  Latest
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">{model.description}</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                    
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Google AI</div>
                    {googleaiModels.map((model) => (
                      <SelectItem key={model.id} value={model.id} className="py-3">
                        <div className="flex items-center gap-3">
                          <Image
                            src="/gemini-color.svg"
                            alt={model.name}
                            width={16}
                            height={16}
                            className="flex-shrink-0"
                          />
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{model.name}</span>
                              {model.isLatest && (
                                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                                  Latest
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">{model.description}</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="temperature" className="text-base font-medium">
                    Temperature: {config.temperature}
                    {(() => {
                      const model = getModelById(config.model);
                      if (model?.temperatureRestrictions?.supportedValues?.length === 1) {
                        return <span className="text-xs text-muted-foreground ml-2">(Fixed at {model.temperatureRestrictions.supportedValues[0]})</span>;
                      }
                      return null;
                    })()}
                  </Label>
                  {(() => {
                    const model = getModelById(config.model);
                    const restrictions = model?.temperatureRestrictions;
                    
                    if (restrictions?.supportedValues?.length === 1) {
                      // Model only supports one temperature value
                      return (
                        <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                          This model only supports temperature = {restrictions.supportedValues[0]}
                        </div>
                      );
                    }
                    
                    // Model supports range of temperatures
                    const min = restrictions?.min ?? 0;
                    const max = restrictions?.max ?? 2;
                    const step = 0.1;
                    
                    return (
                      <>
                        <Slider
                          id="temperature"
                          min={min}
                          max={max}
                          step={step}
                          value={[config.temperature]}
                          onValueChange={([value]) => handleConfigChangeWithNotification({ temperature: value })}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Focused ({min})</span>
                          <span>Balanced (1)</span>
                          <span>Creative ({max})</span>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="maxTokens" className="text-base font-medium">
                    Max Tokens: {config.maxTokens}
                  </Label>
                  <Slider
                    id="maxTokens"
                    min={100}
                    max={4000}
                    step={100}
                    value={[config.maxTokens]}
                    onValueChange={([value]) => handleConfigChangeWithNotification({ maxTokens: value })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Short (100)</span>
                    <span>Long (4000)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Presets</CardTitle>
              <p className="text-sm text-muted-foreground">
                Choose a preset configuration for common use cases
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {presets.map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <Button
                      key={preset.name}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start gap-2"
                      onClick={() => handleConfigChangeWithNotification(preset.config)}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{preset.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground text-left">
                        {preset.description}
                      </p>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Advanced Parameters
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Fine-tune generation behavior with advanced settings
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="topP" className="text-base font-medium">
                    Top P: {config.topP}
                  </Label>
                  <Slider
                    id="topP"
                    min={0}
                    max={1}
                    step={0.05}
                    value={[config.topP]}
                    onValueChange={([value]) => onConfigChange({ topP: value })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Focused (0)</span>
                    <span>Diverse (1)</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="topK" className="text-base font-medium">
                    Top K: {config.topK}
                  </Label>
                  <Slider
                    id="topK"
                    min={1}
                    max={100}
                    step={1}
                    value={[config.topK]}
                    onValueChange={([value]) => onConfigChange({ topK: value })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Focused (1)</span>
                    <span>Diverse (100)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stop Sequences</CardTitle>
              <p className="text-sm text-muted-foreground">
                Define sequences that will stop the AI from generating further text
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stopSequence">Add Stop Sequence</Label>
                <div className="flex gap-2">
                  <Input
                    id="stopSequence"
                    value={newStopSequence}
                    onChange={(e) => setNewStopSequence(e.target.value)}
                    onKeyPress={handleStopSequenceKeyPress}
                    placeholder="Enter stop sequence (e.g., 'END', 'STOP', '###')"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleStopSequenceAdd}
                    disabled={!newStopSequence.trim()}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {config.stopSequences.length > 0 && (
                <div className="space-y-2">
                  <Label>Current Stop Sequences</Label>
                  <div className="flex flex-wrap gap-2">
                    {config.stopSequences.map((sequence, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {sequence}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => handleStopSequenceRemove(sequence)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Stop sequences will cause the AI to stop generating when encountered.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Full Screen Editor Dialog */}
      <Dialog open={isFullScreen} onOpenChange={setIsFullScreen}>
        <DialogContent className="max-w-6xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  System Instructions Editor
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Full screen editor for detailed system instructions
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsFullScreen(false)}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save & Close
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="p-6 pt-0 overflow-auto max-h-[calc(90vh-120px)]">
            <div className="space-y-4">
              <Textarea
                value={config.systemPrompt}
                onChange={(e) => onConfigChange({ systemPrompt: e.target.value })}
                placeholder="Enter detailed instructions for the AI..."
                className="min-h-[400px] resize-none font-mono text-sm"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Characters: {config.systemPrompt.length}</span>
                <span>Lines: {config.systemPrompt.split('\n').length}</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
