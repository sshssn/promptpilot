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
import { useModel, useModelsByProvider } from '@/contexts/model-context';
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
  Maximize2, 
  Minimize2,
  X,
  Bot,
  User,
  ArrowLeft,
  Paperclip
} from 'lucide-react';
import Image from 'next/image';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  model?: string;
}

interface ChatContainerProps {
  title: string;
  model: string;
  onModelChange: (model: string) => void;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onClearMessages: () => void;
  isLoading: boolean;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  onClose?: () => void;
  systemPrompt: string;
  onSystemPromptChange: (prompt: string) => void;
  onSettingsClick?: () => void;
}

function ChatContainer({
  title,
  model,
  onModelChange,
  messages,
  onSendMessage,
  onClearMessages,
  isLoading,
  isMaximized = false,
  onToggleMaximize,
  onClose,
  systemPrompt,
  onSystemPromptChange,
  onSettingsClick
}: ChatContainerProps) {
  const [input, setInput] = useState('');
  const [temperature, setTemperature] = useState(1.0);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [showSettings, setShowSettings] = useState(false);
  const { availableModels } = useModel();
  const { toast } = useToast();

  // Filter models to only show cost-effective ones for comparison
  const costEffectiveModels = availableModels.filter(model => {
    // Only show mini and nano variants to keep costs low
    return model.id.includes('mini') || model.id.includes('nano') || 
           model.id.includes('deepseek') || model.id.includes('gemini');
  });

  // Auto-adjust temperature when model changes
  useEffect(() => {
    const currentModel = getModelById(model);
    if (currentModel?.temperatureRestrictions?.default !== undefined) {
      setTemperature(currentModel.temperatureRestrictions.default);
    }
  }, [model]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
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

  const currentModel = availableModels.find(m => m.id === model);

  return (
    <Card className={`h-full flex flex-col ${isMaximized ? 'w-full' : 'w-1/2'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{title}</CardTitle>
            <Select value={model} onValueChange={onModelChange}>
              <SelectTrigger className="w-48 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {costEffectiveModels.map((modelOption) => (
                  <SelectItem key={modelOption.id} value={modelOption.id}>
                    <div className="flex items-center gap-2">
                      <Image
                        src={modelOption.icon}
                        alt={modelOption.name}
                        width={16}
                        height={16}
                      />
                      <span>{modelOption.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Temp: {temperature.toFixed(1)} | Tokens: {maxTokens}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSettingsClick}
              className="h-8 w-8 p-0"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearMessages}
              className="h-8 w-8 p-0"
              title="Clear messages"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            {onToggleMaximize && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleMaximize}
                className="h-8 w-8 p-0"
                title={isMaximized ? "Minimize" : "Maximize"}
              >
                {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            )}
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
                title="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
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
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[95%] rounded-lg px-3 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(message.content)}
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    {message.model && (
                      <div className="text-xs opacity-70 mt-1">
                        {message.model}
                      </div>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
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

        <Separator />

        {/* System Prompt Area */}
        <div className="p-4 border-b">
          <div className="space-y-2">
            <label className="text-sm font-medium">System Prompt</label>
            <Textarea
              value={systemPrompt}
              onChange={(e) => onSystemPromptChange(e.target.value)}
              placeholder="Enter system prompt for this model..."
              className="min-h-[80px] resize-none text-sm"
            />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`Message ${currentModel?.name}...`}
              className="min-h-[60px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="sm"
              className="self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SplitChatInterfaceProps {
  onClose?: () => void;
}

export function SplitChatInterface({ onClose }: SplitChatInterfaceProps = {}) {
  const { availableModels } = useModel();
  const { toast } = useToast();
  
  const [leftModel, setLeftModel] = useState(availableModels.find(m => m.id === 'gpt-5-nano')?.id || availableModels[0]?.id || 'gpt-5-nano');
  const [rightModel, setRightModel] = useState(availableModels.find(m => m.id === 'deepseek-v3.1')?.id || availableModels[1]?.id || 'deepseek-v3.1');
  const [leftMessages, setLeftMessages] = useState<ChatMessage[]>([]);
  const [rightMessages, setRightMessages] = useState<ChatMessage[]>([]);
  const [leftLoading, setLeftLoading] = useState(false);
  const [rightLoading, setRightLoading] = useState(false);
  const [maximizedPanel, setMaximizedPanel] = useState<'left' | 'right' | null>(null);
  const [leftSystemPrompt, setLeftSystemPrompt] = useState('You are a helpful AI assistant.');
  const [rightSystemPrompt, setRightSystemPrompt] = useState('You are a helpful AI assistant.');
  const [sharedInput, setSharedInput] = useState('');
  const [leftSettingsOpen, setLeftSettingsOpen] = useState(false);
  const [rightSettingsOpen, setRightSettingsOpen] = useState(false);
  const [autoClear, setAutoClear] = useState(false);
  
  // Add temperature and maxTokens state
  const [leftTemperature, setLeftTemperature] = useState(1.0);
  const [rightTemperature, setRightTemperature] = useState(1.0);
  const [leftMaxTokens, setLeftMaxTokens] = useState(1000);
  const [rightMaxTokens, setRightMaxTokens] = useState(1000);

  const sendToBothSides = async (message: string) => {
    if (!message.trim()) return;
    
    // Send to both sides simultaneously
    await Promise.all([
      sendMessage(message, 'left'),
      sendMessage(message, 'right')
    ]);
    
    // Auto-clear input if enabled
    if (autoClear) {
      setSharedInput('');
    }
  };

  const sendMessage = async (message: string, side: 'left' | 'right') => {
    const model = side === 'left' ? leftModel : rightModel;
    const setMessages = side === 'left' ? setLeftMessages : setRightMessages;
    const setLoading = side === 'left' ? setLeftLoading : setRightLoading;
    const systemPrompt = side === 'left' ? leftSystemPrompt : rightSystemPrompt;
    const currentMessages = side === 'left' ? leftMessages : rightMessages;
    const temperature = side === 'left' ? leftTemperature : rightTemperature;
    const maxTokens = side === 'left' ? leftMaxTokens : rightMaxTokens;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      // Prepare messages with system prompt
      const messagesWithSystem = [
        { role: 'system', content: systemPrompt },
        ...currentMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: message }
      ];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messagesWithSystem,
          config: {
            model,
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
        model
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
      setLoading(false);
    }
  };

  const clearMessages = (side: 'left' | 'right') => {
    if (side === 'left') {
      setLeftMessages([]);
    } else {
      setRightMessages([]);
    }
  };

  const toggleMaximize = (side: 'left' | 'right') => {
    if (maximizedPanel === side) {
      setMaximizedPanel(null);
    } else {
      setMaximizedPanel(side);
    }
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-1.5">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 flex items-center gap-2" 
              onClick={onClose}
              title="Go back to previous page (SHIFT+B)"
            >
              <ArrowLeft className="h-4 w-4" />
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⇧</span>B
              </kbd>
            </Button>
            <div className="h-3 w-px bg-border" />
            <div className="flex items-baseline gap-2">
              <h1 className="text-xl md:text-2xl font-headline font-bold text-foreground tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Model Comparison
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="gap-1 text-xs h-7">
              <Settings className="h-3 w-3" />
              <span className="font-medium">Settings</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <div className="w-1/2 border-r flex flex-col overflow-hidden">
          {/* Model Header */}
          <div className="flex-shrink-0 p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 px-3 py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">A</span>
                    <Image
                      src={getModelById(leftModel)?.icon || '/openai-color.svg'}
                      alt={getModelById(leftModel)?.name || 'Model'}
                      width={16}
                      height={16}
                      className="rounded-sm"
                    />
                    <span className="font-medium">{getModelById(leftModel)?.name || leftModel}</span>
                  </div>
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="p-1 h-6 w-6" onClick={() => setLeftSettingsOpen(true)}>
                  <Settings className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="p-1 h-6 w-6" onClick={() => clearMessages('left')}>
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* System Message */}
          <div className="flex-shrink-0 p-4 border-b">
            <div className="space-y-2">
              <label className="text-sm font-medium">System Prompt</label>
              <Textarea
                value={leftSystemPrompt}
                onChange={(e) => setLeftSystemPrompt(e.target.value)}
                placeholder="Enter system prompt for this model..."
                className="min-h-[80px] resize-none text-sm"
              />
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-hidden p-4">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                {leftMessages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Image
                          src={getModelById(leftModel)?.icon || '/openai-color.svg'}
                          alt={getModelById(leftModel)?.name || 'Model'}
                          width={20}
                          height={20}
                          className="rounded-sm"
                        />
                      </div>
                    )}
                    <div className={`max-w-[95%] rounded-lg p-3 ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      {message.role === 'assistant' ? (
                        <MarkdownRenderer content={message.content} />
                      ) : (
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      )}
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
                {leftLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Image
                        src={getModelById(leftModel)?.icon || '/openai-color.svg'}
                        alt={getModelById(leftModel)?.name || 'Model'}
                        width={20}
                        height={20}
                        className="rounded-sm"
                      />
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
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          {/* Model Header */}
          <div className="flex-shrink-0 p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-3 py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">B</span>
                    <Image
                      src={getModelById(rightModel)?.icon || '/openai-color.svg'}
                      alt={getModelById(rightModel)?.name || 'Model'}
                      width={16}
                      height={16}
                      className="rounded-sm"
                    />
                    <span className="font-medium">{getModelById(rightModel)?.name || rightModel}</span>
                  </div>
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="p-1 h-6 w-6" onClick={() => setRightSettingsOpen(true)}>
                  <Settings className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="p-1 h-6 w-6" onClick={() => clearMessages('right')}>
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* System Message */}
          <div className="flex-shrink-0 p-4 border-b">
            <div className="space-y-2">
              <label className="text-sm font-medium">System Prompt</label>
              <Textarea
                value={rightSystemPrompt}
                onChange={(e) => setRightSystemPrompt(e.target.value)}
                placeholder="Enter system prompt for this model..."
                className="min-h-[80px] resize-none text-sm"
              />
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-hidden p-4">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                {rightMessages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Image
                          src={getModelById(rightModel)?.icon || '/openai-color.svg'}
                          alt={getModelById(rightModel)?.name || 'Model'}
                          width={20}
                          height={20}
                          className="rounded-sm"
                        />
                      </div>
                    )}
                    <div className={`max-w-[95%] rounded-lg p-3 ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      {message.role === 'assistant' ? (
                        <MarkdownRenderer content={message.content} />
                      ) : (
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      )}
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
                {rightLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Image
                        src={getModelById(rightModel)?.icon || '/openai-color.svg'}
                        alt={getModelById(rightModel)?.name || 'Model'}
                        width={20}
                        height={20}
                        className="rounded-sm"
                      />
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
          </div>
        </div>
      </div>

      {/* Bottom Input Area */}
      <div className="flex-shrink-0 border-t p-6 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-50/60 dark:supports-[backdrop-filter]:bg-slate-900/60">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {/* Multimodal Upload Area */}
            <MultimodalUpload
              onFilesChange={(files) => {
                // Handle file uploads
                console.log('Files uploaded:', files);
              }}
              maxFiles={5}
              maxSize={10}
            />
            
            {/* Input Area */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="p-2">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Textarea
                value={sharedInput}
                onChange={(e) => setSharedInput(e.target.value)}
                placeholder="Chat with your prompt..."
                className="flex-1 min-h-[60px] resize-none border-0 bg-muted/50 focus:bg-background"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendToBothSides(sharedInput);
                    if (!autoClear) {
                      setSharedInput('');
                    }
                  }
                }}
              />
              <div className="flex items-center gap-2">
                <Button 
                  variant={autoClear ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => setAutoClear(!autoClear)}
                  className="text-xs"
                >
                  Auto-clear
                </Button>
                <Button
                  onClick={() => {
                    sendToBothSides(sharedInput);
                    if (!autoClear) {
                      setSharedInput('');
                    }
                  }}
                  disabled={!sharedInput.trim() || leftLoading || rightLoading}
                  size="sm"
                  className="p-2"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modals */}
      <ChatSettingsModal
        isOpen={leftSettingsOpen}
        onClose={() => setLeftSettingsOpen(false)}
        model={leftModel}
        onModelChange={setLeftModel}
        temperature={leftTemperature}
        onTemperatureChange={setLeftTemperature}
        maxTokens={leftMaxTokens}
        onMaxTokensChange={setLeftMaxTokens}
        systemPrompt={leftSystemPrompt}
        onSystemPromptChange={setLeftSystemPrompt}
        availableModels={availableModels.filter(model => 
          model.id.includes('mini') || model.id.includes('nano') || 
          model.id.includes('deepseek') || model.id.includes('gemini')
        )}
      />

      <ChatSettingsModal
        isOpen={rightSettingsOpen}
        onClose={() => setRightSettingsOpen(false)}
        model={rightModel}
        onModelChange={setRightModel}
        temperature={rightTemperature}
        onTemperatureChange={setRightTemperature}
        maxTokens={rightMaxTokens}
        onMaxTokensChange={setRightMaxTokens}
        systemPrompt={rightSystemPrompt}
        onSystemPromptChange={setRightSystemPrompt}
        availableModels={availableModels.filter(model => 
          model.id.includes('mini') || model.id.includes('nano') || 
          model.id.includes('deepseek') || model.id.includes('gemini')
        )}
      />
    </div>
  );
}
