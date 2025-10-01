'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useModel } from '@/contexts/model-context';
import { getModelById } from '@/lib/models';
import { ChatSettingsModal } from '@/components/chat-settings-modal';
import { MultimodalUpload } from '@/components/multimodal-upload';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, 
  RotateCcw, 
  Settings, 
  Copy, 
  Check, 
  X,
  Bot,
  User,
  ArrowLeft,
  Paperclip,
  Plus,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  Mic
} from 'lucide-react';
import Image from 'next/image';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  model?: string;
  responseId?: string;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface Variable {
  id: string;
  name: string;
  value: string;
  description: string;
}

export function SinglePaneCompare({ onClose, onCompare }: { onClose?: () => void; onCompare?: () => void }) {
  const { availableModels } = useModel();
  const { toast } = useToast();
  
  // Model and configuration state
  const [selectedModel, setSelectedModel] = useState(availableModels.find(m => m.id === 'gpt-5')?.id || availableModels[0]?.id || 'gpt-5');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful AI assistant.');
  const [temperature, setTemperature] = useState(1.0);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [showSettings, setShowSettings] = useState(false);
  
  // UI state
  const [showCompare, setShowCompare] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [showDeveloperMessage, setShowDeveloperMessage] = useState(false);
  
  // Tools and variables
  const [tools, setTools] = useState<Tool[]>([]);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [developerMessage, setDeveloperMessage] = useState('');
  
  // Model configuration
  const [textFormat, setTextFormat] = useState('text');
  const [effort, setEffort] = useState('medium');
  const [verbosity, setVerbosity] = useState('medium');
  const [summary, setSummary] = useState('auto');

  // Initialize tools based on model capabilities
  useEffect(() => {
    const currentModel = getModelById(selectedModel);
    if (currentModel) {
      const modelTools: Tool[] = [];
      
      // Common tools for all models
      modelTools.push({
        id: 'memory',
        name: 'Memory',
        description: 'Store and retrieve information across conversations',
        enabled: false
      });
      
      modelTools.push({
        id: 'calculator',
        name: 'Calculator',
        description: 'Perform mathematical calculations',
        enabled: false
      });
      
      // Function calling tools
      if (currentModel.capabilities?.includes('function-calling')) {
        modelTools.push({
          id: 'web-search',
          name: 'Web Search',
          description: 'Search the web for current information',
          enabled: false
        });
        modelTools.push({
          id: 'code-execution',
          name: 'Code Execution',
          description: 'Execute Python code and return results',
          enabled: false
        });
        modelTools.push({
          id: 'file-operations',
          name: 'File Operations',
          description: 'Read, write, and manage files',
          enabled: false
        });
        modelTools.push({
          id: 'database-query',
          name: 'Database Query',
          description: 'Query databases and retrieve data',
          enabled: false
        });
        modelTools.push({
          id: 'api-calls',
          name: 'API Calls',
          description: 'Make HTTP requests to external APIs',
          enabled: false
        });
      }
      
      // Vision capabilities
      if (currentModel.capabilities?.includes('vision')) {
        modelTools.push({
          id: 'image-analysis',
          name: 'Image Analysis',
          description: 'Analyze and describe images',
          enabled: false
        });
        modelTools.push({
          id: 'image-generation',
          name: 'Image Generation',
          description: 'Generate images from text descriptions',
          enabled: false
        });
        modelTools.push({
          id: 'ocr',
          name: 'OCR (Optical Character Recognition)',
          description: 'Extract text from images',
          enabled: false
        });
      }
      
      // Audio capabilities
      if (currentModel.capabilities?.includes('audio')) {
        modelTools.push({
          id: 'audio-processing',
          name: 'Audio Processing',
          description: 'Process and analyze audio files',
          enabled: false
        });
        modelTools.push({
          id: 'speech-to-text',
          name: 'Speech to Text',
          description: 'Convert speech to text',
          enabled: false
        });
        modelTools.push({
          id: 'text-to-speech',
          name: 'Text to Speech',
          description: 'Convert text to speech',
          enabled: false
        });
      }
      
      // Video capabilities
      if (currentModel.capabilities?.includes('video')) {
        modelTools.push({
          id: 'video-analysis',
          name: 'Video Analysis',
          description: 'Analyze and describe video content',
          enabled: false
        });
        modelTools.push({
          id: 'video-generation',
          name: 'Video Generation',
          description: 'Generate videos from text descriptions',
          enabled: false
        });
      }
      
      // Advanced capabilities
      if (currentModel.capabilities?.includes('advanced')) {
        modelTools.push({
          id: 'reasoning',
          name: 'Advanced Reasoning',
          description: 'Complex logical reasoning and problem solving',
          enabled: false
        });
        modelTools.push({
          id: 'planning',
          name: 'Planning',
          description: 'Create and execute multi-step plans',
          enabled: false
        });
      }
      
      // Multimodal capabilities
      if (currentModel.capabilities?.includes('multimodal')) {
        modelTools.push({
          id: 'multimodal-analysis',
          name: 'Multimodal Analysis',
          description: 'Analyze content across text, images, and audio',
          enabled: false
        });
      }
      
      // Coding capabilities
      if (currentModel.capabilities?.includes('coding')) {
        modelTools.push({
          id: 'code-review',
          name: 'Code Review',
          description: 'Review and suggest improvements for code',
          enabled: false
        });
        modelTools.push({
          id: 'debugging',
          name: 'Debugging',
          description: 'Help debug and fix code issues',
          enabled: false
        });
      }
      
      setTools(modelTools);
    }
  }, [selectedModel]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare messages with system prompt
      const messagesWithSystem = [
        { role: 'system', content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: input }
      ];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messagesWithSystem,
          config: {
            model: selectedModel,
            temperature: temperature,
            maxTokens: maxTokens
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        model: selectedModel,
        responseId: `resp_${Math.random().toString(36).substr(2, 9)}`
      };

      setMessages(prev => [...prev, assistantMessage]);

      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (value) {
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                done = true;
                break;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === assistantMessage.id 
                        ? { ...msg, content: msg.content + parsed.content }
                        : msg
                    )
                  );
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send message. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Message copied to clipboard",
      duration: 2000,
    });
  };

  const addVariable = () => {
    const newVariable: Variable = {
      id: `var_${Date.now()}`,
      name: '',
      value: '',
      description: ''
    };
    setVariables(prev => [...prev, newVariable]);
  };

  const updateVariable = (id: string, field: keyof Variable, value: string) => {
    setVariables(prev => 
      prev.map(v => v.id === id ? { ...v, [field]: value } : v)
    );
  };

  const removeVariable = (id: string) => {
    setVariables(prev => prev.filter(v => v.id !== id));
  };

  const toggleTool = (id: string) => {
    setTools(prev => 
      prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t)
    );
  };

  const currentModel = getModelById(selectedModel);

  return (
    <div className="h-screen bg-background flex">
      {/* Left Configuration Panel */}
      <div className="w-1/3 border-r border-border/50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="text-sm">New prompt</span>
            </Button>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">
                Draft
              </Button>
            </div>
          </div>
        </div>

        {/* Model Configuration */}
        <div className="p-4 border-b border-border/50">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center gap-2">
                        <Image
                          src={model.icon}
                          alt={model.name}
                          width={16}
                          height={16}
                        />
                        <span>{model.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">text.format:</span>
                <Badge variant="secondary" className="text-xs">{textFormat}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">effort:</span>
                <Badge variant="secondary" className="text-xs">{effort}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">verbosity:</span>
                <Badge variant="secondary" className="text-xs">{verbosity}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">summary:</span>
                <Badge variant="secondary" className="text-xs">{summary}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Variables Section */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Variables</span>
            <Button variant="ghost" size="sm" onClick={addVariable}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {variables.map((variable) => (
              <div key={variable.id} className="space-y-1">
                <div className="flex items-center gap-1">
                  <Input
                    placeholder="Variable name"
                    value={variable.name}
                    onChange={(e) => updateVariable(variable.id, 'name', e.target.value)}
                    className="text-xs h-7"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVariable(variable.id)}
                    className="h-7 w-7 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <Input
                  placeholder="Default value"
                  value={variable.value}
                  onChange={(e) => updateVariable(variable.id, 'value', e.target.value)}
                  className="text-xs h-7"
                />
              </div>
            ))}
            {variables.length === 0 && (
              <p className="text-xs text-muted-foreground">No variables added</p>
            )}
          </div>
        </div>

        {/* Tools Section */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Tools</span>
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          <ScrollArea className="max-h-48">
            <div className="space-y-2">
              {tools.map((tool) => (
                <div key={tool.id} className="flex items-center justify-between p-2 rounded border hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{tool.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{tool.description}</div>
                  </div>
                  <Button
                    variant={tool.enabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleTool(tool.id)}
                    className="h-6 px-2 text-xs flex-shrink-0 ml-2"
                  >
                    {tool.enabled ? 'On' : 'Off'}
                  </Button>
                </div>
              ))}
              {tools.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No tools available for this model</p>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Developer Message */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Developer Message</span>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          <Textarea
            value={developerMessage}
            onChange={(e) => setDeveloperMessage(e.target.value)}
            placeholder="Describe desired model behavior (tone, tool usage, response style)"
            className="min-h-[100px] resize-none text-sm"
          />
        </div>

        {/* Prompt Messages */}
        <div className="p-4 flex-1">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Prompt Messages</span>
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add message
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Enter task specifics. Use {{template variables}} for dynamic inputs"
                  className="text-sm"
                />
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Check className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Chat Panel */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Response ID:</span>
              <span className="text-sm font-mono">resp_68cbf3c1a...</span>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onCompare}>
              Compare
            </Button>
            <Button variant="outline" size="sm">
              Optimize
            </Button>
            <Button variant="outline" size="sm">
              Evaluate
            </Button>
            <Button size="sm">
              Save
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <Bot className="h-8 w-8 mb-2" />
                <p className="text-sm">Start a conversation with {currentModel?.name}</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {message.role === 'user' ? 'User' : 'Assistant'}
                    </span>
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Lightbulb className="h-3 w-3" />
                        <span>Thought for 1 second &gt;</span>
                      </div>
                    )}
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <MarkdownRenderer content={message.content} />
                  </div>
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        Good
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                        <ThumbsDown className="h-3 w-3 mr-1" />
                        Bad
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
            {isLoading && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Assistant</span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Lightbulb className="h-3 w-3" />
                    <span>Thought for 1 second &gt;</span>
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Performance Metrics */}
        <div className="px-4 py-2 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>5.1s</span>
              <span>8t</span>
              <span>113t</span>
            </div>
            <Button variant="ghost" size="sm" className="text-xs">
              Auto-clear
            </Button>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Mic className="h-4 w-4" />
            </Button>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Chat with your prompt..."
              className="flex-1 min-h-[60px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <ChatSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        model={selectedModel}
        onModelChange={setSelectedModel}
        temperature={temperature}
        onTemperatureChange={setTemperature}
        maxTokens={maxTokens}
        onMaxTokensChange={setMaxTokens}
        systemPrompt={systemPrompt}
        onSystemPromptChange={setSystemPrompt}
        availableModels={availableModels}
      />
    </div>
  );
}
