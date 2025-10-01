'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  SplitSquareHorizontal, 
  Upload, 
  FileText, 
  Bot, 
  Play, 
  Settings,
  Copy,
  Check,
  Lightbulb,
  TrendingUp,
  Target,
  BarChart3,
  Loader2,
  Zap,
  AlertTriangle,
  Maximize,
  CheckCircle,
  X,
  Send,
  User,
  Paperclip,
  Mic,
  Image,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  TestTube,
  Bug,
  RotateCcw,
  Shuffle
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { ModelToggle } from '@/components/model-toggle';
import { Logo } from '@/components/logo';
import { MultimodalUpload } from '@/components/multimodal-upload';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { prepareFilesForGemini } from '@/lib/file-utils';
import { useStorage } from '@/contexts/storage-context';
import { useModel } from '@/contexts/model-context';
import { ModelIcon } from '@/components/model-icon';
import { LoadingAnimation } from '@/components/loading-animation';

export default function ComparePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { availableModels } = useModel();
  
  // Model and chat state
  const [selectedModel, setSelectedModel] = useState(availableModels[0]?.id || 'gpt-4');
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful AI assistant.');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [reasoningMode, setReasoningMode] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [leftSystemPrompt, setLeftSystemPrompt] = useState('');
  const [rightSystemPrompt, setRightSystemPrompt] = useState('');
  const [showLeftSystemPrompt, setShowLeftSystemPrompt] = useState(false);
  const [showRightSystemPrompt, setShowRightSystemPrompt] = useState(false);
  const [leftSystemPromptFullscreen, setLeftSystemPromptFullscreen] = useState(false);
  const [rightSystemPromptFullscreen, setRightSystemPromptFullscreen] = useState(false);

  // Separate settings for Model A and Model B
  const [leftTemperature, setLeftTemperature] = useState(0.7);
  const [rightTemperature, setRightTemperature] = useState(0.7);
  const [leftMaxTokens, setLeftMaxTokens] = useState(1000);
  const [rightMaxTokens, setRightMaxTokens] = useState(1000);
  
  // Split mode state
  const [leftModel, setLeftModel] = useState(availableModels[0]?.id || 'gpt-4');
  const [rightModel, setRightModel] = useState(availableModels[1]?.id || 'gpt-3.5-turbo');
  const [leftMessages, setLeftMessages] = useState<any[]>([]);
  const [rightMessages, setRightMessages] = useState<any[]>([]);
  const [sharedInput, setSharedInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [leftTokenUsage, setLeftTokenUsage] = useState<{[key: string]: {prompt_tokens: number, completion_tokens: number, total_tokens: number}}>({});
  const [rightTokenUsage, setRightTokenUsage] = useState<{[key: string]: {prompt_tokens: number, completion_tokens: number, total_tokens: number}}>({});
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('playground-data');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setMessages(data.messages || []);
        setSystemPrompt(data.systemPrompt || 'You are a helpful AI assistant.');
        setTemperature(data.temperature || 0.7);
        setMaxTokens(data.maxTokens || 1000);
        setSelectedModel(data.selectedModel || availableModels[0]?.id);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, [availableModels]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    const data = {
      messages,
      systemPrompt,
      temperature,
      maxTokens,
      selectedModel
    };
    localStorage.setItem('playground-data', JSON.stringify(data));
  }, [messages, systemPrompt, temperature, maxTokens, selectedModel]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'p':
            e.preventDefault();
            router.push('/playground');
            break;
          case 'b':
            e.preventDefault();
            router.back();
            break;
          case 's':
            e.preventDefault();
            setShowSettings(!showSettings);
            break;
          case 'f':
            e.preventDefault();
            setShowFileUpload(!showFileUpload);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, showSettings, showFileUpload]);

  const sendToBothSides = async (message: string) => {
    if (!message.trim()) return;
    
    setIsStreaming(true);
    
    // Add user message to both sides
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: Date.now()
    };
    
    setLeftMessages(prev => [...prev, userMessage]);
    setRightMessages(prev => [...prev, userMessage]);
    
    try {
      // Call APIs for both models simultaneously
      const [leftResponse, rightResponse] = await Promise.all([
        fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...leftMessages, userMessage].map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            config: {
              model: leftModel,
              systemPrompt: leftSystemPrompt || systemPrompt,
              temperature: leftTemperature,
              maxTokens: leftMaxTokens,
              topP: 0.9,
              topK: 40,
              stopSequences: []
            }
          }),
        }),
        fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...rightMessages, userMessage].map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            config: {
              model: rightModel,
              systemPrompt: rightSystemPrompt || systemPrompt,
              temperature: rightTemperature,
              maxTokens: rightMaxTokens,
              topP: 0.9,
              topK: 40,
              stopSequences: []
            }
          }),
        })
      ]);

      // Process left response
      if (leftResponse.ok) {
        const leftReader = leftResponse.body?.getReader();
        if (leftReader) {
          const leftAssistantMessage = {
            id: `left-${Date.now()}`,
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
            model: leftModel
          };
          setLeftMessages(prev => [...prev, leftAssistantMessage]);
          
          const leftDecoder = new TextDecoder();
          let leftDone = false;
          while (!leftDone) {
            const { value, done } = await leftReader.read();
            leftDone = done;
            if (value) {
              const chunk = leftDecoder.decode(value);
              const lines = chunk.split('\n');
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6));
                    if (data.content) {
                      setLeftMessages(prev => 
                        prev.map(msg => 
                          msg.id === leftAssistantMessage.id 
                            ? { ...msg, content: msg.content + data.content }
                            : msg
                        )
                      );
                    }
                    // Capture token usage for left side
                    if (data.usage) {
                      setLeftTokenUsage(prev => ({
                        ...prev,
                        [leftAssistantMessage.id]: data.usage
                      }));
                    }
                  } catch (e) {
                    // Ignore parsing errors
                  }
                }
              }
            }
          }
        }
      }

      // Process right response
      if (rightResponse.ok) {
        const rightReader = rightResponse.body?.getReader();
        if (rightReader) {
          const rightAssistantMessage = {
            id: `right-${Date.now()}`,
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
            model: rightModel
          };
          setRightMessages(prev => [...prev, rightAssistantMessage]);
          
          const rightDecoder = new TextDecoder();
          let rightDone = false;
          while (!rightDone) {
            const { value, done } = await rightReader.read();
            rightDone = done;
            if (value) {
              const chunk = rightDecoder.decode(value);
              const lines = chunk.split('\n');
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6));
                    if (data.content) {
                      setRightMessages(prev => 
                        prev.map(msg => 
                          msg.id === rightAssistantMessage.id 
                            ? { ...msg, content: msg.content + data.content }
                            : msg
                        )
                      );
                    }
                    // Capture token usage for right side
                    if (data.usage) {
                      setRightTokenUsage(prev => ({
                        ...prev,
                        [rightAssistantMessage.id]: data.usage
                      }));
                    }
                  } catch (e) {
                    // Ignore parsing errors
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in comparison mode:', error);
      toast({
        title: "Error",
        description: "Failed to get responses from models. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleFileUpload = (files: any[]) => {
    setUploadedFiles(files);
    setShowFileUpload(false);
    toast({
      title: "Files Uploaded",
      description: `${files.length} file(s) uploaded successfully.`,
    });
  };

  const handleClear = () => {
    setMessages([]);
    setLeftMessages([]);
    setRightMessages([]);
    setInput('');
    setSharedInput('');
    setUploadedFiles([]);
    localStorage.removeItem('playground-data');
    toast({
      title: "Cleared",
      description: "Chat history has been cleared.",
    });
  };

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopiedMessageId(messageId);
        setTimeout(() => setCopiedMessageId(null), 2000);
        toast({
          title: "Copied",
          description: "Message copied to clipboard.",
        });
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopiedMessageId(messageId);
        setTimeout(() => setCopiedMessageId(null), 2000);
        toast({
          title: "Copied",
          description: "Message copied to clipboard.",
        });
      }
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900">
      <div className="h-full flex flex-col">
        {/* Modern Header */}
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 flex-shrink-0">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/playground')}
                className="gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Playground
              </Button>
              <div className="h-6 w-px bg-slate-300 dark:bg-slate-600" />
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                  <Logo size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">Model Comparison</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Compare AI models side by side</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowSettings(!showSettings)}
                variant="outline"
                size="sm"
                className="gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
              <ModelToggle showLabel={false} />
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Split View Content */}
        <div className="flex-1 flex">
          {/* Left Panel */}
          <div className="flex-1 border-r border-slate-200/50 dark:border-slate-700/50">
            <div className="h-full flex flex-col">
              <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                      <ModelIcon modelId={leftModel} size={16} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{availableModels.find(m => m.id === leftModel)?.name || leftModel}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Model A</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowLeftSystemPrompt(!showLeftSystemPrompt)}
                      className="text-xs"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      System Instructions
                    </Button>
                    <Select value={leftModel} onValueChange={setLeftModel}>
                      <SelectTrigger className="w-40 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableModels.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* System Prompt Container */}
                {showLeftSystemPrompt && (
                  <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">System Instructions</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setLeftSystemPromptFullscreen(!leftSystemPromptFullscreen)}
                          className="text-xs"
                        >
                          <Maximize className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowLeftSystemPrompt(false)}
                          className="text-xs"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      id="left-system-prompt"
                      value={leftSystemPrompt}
                      onChange={(e) => setLeftSystemPrompt(e.target.value)}
                      placeholder="Enter system instructions for this model..."
                      className="min-h-[100px] text-sm"
                    />
                  </div>
                )}
              </div>
              <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-900">
                {leftMessages.length === 0 ? (
                  <div className="text-center text-slate-500 dark:text-slate-400 mt-12">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-600/20 rounded-full blur-xl"></div>
                      <div className="relative p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                        <Logo size={32} className="text-white" />
                      </div>
                    </div>
                    <p className="text-lg font-medium">Start a conversation to compare models</p>
                    <p className="text-sm mt-2">Send a message to see how different models respond</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leftMessages.map((message) => (
                      <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} group`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-2 shadow-sm ${
                          message.role === 'user' 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' 
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                        }`}>
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              {message.role === 'user' ? (
                                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                  <User className="h-3 w-3 text-white" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                                  <ModelIcon modelId={message.model || leftModel} size={12} />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <MarkdownRenderer content={message.content} />
                              {message.model && (
                                <div className="text-xs opacity-70 mt-2 flex items-center gap-2">
                                  <ModelIcon modelId={message.model} size={10} />
                                  {message.model}
                                  {leftTokenUsage[message.id] && (
                                    <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">
                                      tokens {leftTokenUsage[message.id].total_tokens}
                                    </span>
                                  )}
                                </div>
                              )}
                              
                              {/* Action Buttons */}
                              <div className="mt-3 flex items-center gap-2 ">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(message.content, message.id)}
                                  className="h-7 px-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-700"
                                >
                                  {copiedMessageId === message.id ? (
                                    <Check className="h-3 w-3 mr-1" />
                                  ) : (
                                    <Copy className="h-3 w-3 mr-1" />
                                  )}
                                  {copiedMessageId === message.id ? 'Copied!' : 'Copy'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isStreaming && (
                      <div className="flex justify-start">
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
                          <LoadingAnimation reasoning={reasoningMode && (leftModel.includes('o1') || leftModel.includes('reasoning'))} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="flex-1">
            <div className="h-full flex flex-col">
              <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                      <ModelIcon modelId={rightModel} size={16} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{availableModels.find(m => m.id === rightModel)?.name || rightModel}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Model B</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRightSystemPrompt(!showRightSystemPrompt)}
                      className="text-xs"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      System Instructions
                    </Button>
                    <Select value={rightModel} onValueChange={setRightModel}>
                      <SelectTrigger className="w-40 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableModels.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* System Prompt Container */}
                {showRightSystemPrompt && (
                  <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">System Instructions</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRightSystemPromptFullscreen(!rightSystemPromptFullscreen)}
                          className="text-xs"
                        >
                          <Maximize className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowRightSystemPrompt(false)}
                          className="text-xs"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      id="right-system-prompt"
                      value={rightSystemPrompt}
                      onChange={(e) => setRightSystemPrompt(e.target.value)}
                      placeholder="Enter system instructions for this model..."
                      className="min-h-[100px] text-sm"
                    />
                  </div>
                )}
              </div>
              <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-900">
                {rightMessages.length === 0 ? (
                  <div className="text-center text-slate-500 dark:text-slate-400 mt-12">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-600/20 rounded-full blur-xl"></div>
                      <div className="relative p-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                        <Logo size={32} className="text-white" />
                      </div>
                    </div>
                    <p className="text-lg font-medium">Start a conversation to compare models</p>
                    <p className="text-sm mt-2">Send a message to see how different models respond</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rightMessages.map((message) => (
                      <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} group`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-2 shadow-sm ${
                          message.role === 'user' 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' 
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                        }`}>
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              {message.role === 'user' ? (
                                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                  <User className="h-3 w-3 text-white" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                                  <ModelIcon modelId={message.model || rightModel} size={12} />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <MarkdownRenderer content={message.content} />
                              {message.model && (
                                <div className="text-xs opacity-70 mt-2 flex items-center gap-2">
                                  <ModelIcon modelId={message.model} size={10} />
                                  {message.model}
                                  {rightTokenUsage[message.id] && (
                                    <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">
                                      tokens {rightTokenUsage[message.id].total_tokens}
                                    </span>
                                  )}
                                </div>
                              )}
                              
                              {/* Action Buttons */}
                              <div className="mt-3 flex items-center gap-2 ">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(message.content, message.id)}
                                  className="h-7 px-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-700"
                                >
                                  {copiedMessageId === message.id ? (
                                    <Check className="h-3 w-3 mr-1" />
                                  ) : (
                                    <Copy className="h-3 w-3 mr-1" />
                                  )}
                                  {copiedMessageId === message.id ? 'Copied!' : 'Copy'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isStreaming && (
                      <div className="flex justify-start">
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
                          <LoadingAnimation reasoning={reasoningMode && (rightModel.includes('o1') || rightModel.includes('reasoning'))} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Input Area */}
        <div className="flex-shrink-0 border-t p-4 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <Textarea
                  value={sharedInput}
                  onChange={(e) => setSharedInput(e.target.value)}
                  placeholder="Type your message here..."
                  className="flex-1 min-h-[60px] resize-none pr-12"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendToBothSides(sharedInput);
                      setSharedInput('');
                    }
                  }}
                />
                <div className="absolute right-3 top-3 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFileUpload(!showFileUpload)}
                    className="h-8 w-8 p-0"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button
                onClick={() => {
                  sendToBothSides(sharedInput);
                  setSharedInput('');
                }}
                disabled={!sharedInput.trim() || isStreaming}
                size="lg"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* File Upload Modal */}
      {showFileUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Upload Files</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFileUpload(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <MultimodalUpload
              onFilesChange={handleFileUpload}
              maxFiles={5}
              maxSize={10}
            />
          </div>
        </div>
      )}
      
      {/* Left System Prompt Fullscreen Modal */}
      {leftSystemPromptFullscreen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setLeftSystemPromptFullscreen(false);
          }
        }}>
          <div className="bg-background rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">System Instructions - Model A</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLeftSystemPromptFullscreen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              value={leftSystemPrompt}
              onChange={(e) => setLeftSystemPrompt(e.target.value)}
              placeholder="Enter system instructions for Model A..."
              className="min-h-[400px] text-sm"
            />
          </div>
        </div>
      )}

      {/* Right System Prompt Fullscreen Modal */}
      {rightSystemPromptFullscreen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setRightSystemPromptFullscreen(false);
          }
        }}>
          <div className="bg-background rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">System Instructions - Model B</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRightSystemPromptFullscreen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              value={rightSystemPrompt}
              onChange={(e) => setRightSystemPrompt(e.target.value)}
              placeholder="Enter system instructions for Model B..."
              className="min-h-[400px] text-sm"
            />
          </div>
        </div>
      )}

      {/* Settings Modal for Both Models */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowSettings(false);
          }
        }}>
          <div className="bg-background rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Model Comparison Settings</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-8">
              {/* Model A Settings */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                    <ModelIcon modelId={leftModel} size={16} className="text-white" />
                  </div>
                  <h4 className="text-lg font-semibold">Model A Settings</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium">Temperature: {leftTemperature}</Label>
                    <div className="mt-2 space-y-2">
                      <Slider
                        value={[leftTemperature]}
                        onValueChange={(value) => setLeftTemperature(value[0])}
                        max={2}
                        min={0}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Focused</span>
                        <span>Creative</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Max Tokens: {leftMaxTokens}</Label>
                    <div className="mt-2 space-y-2">
                      <Slider
                        value={[leftMaxTokens]}
                        onValueChange={(value) => setLeftMaxTokens(value[0])}
                        max={4000}
                        min={100}
                        step={100}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Short</span>
                        <span>Long</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">System Instructions</Label>
                  <Textarea
                    value={leftSystemPrompt}
                    onChange={(e) => setLeftSystemPrompt(e.target.value)}
                    placeholder="Enter system instructions for Model A..."
                    className="mt-2 min-h-[100px]"
                  />
                </div>
              </div>

              <Separator />

              {/* Model B Settings */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                    <ModelIcon modelId={rightModel} size={16} className="text-white" />
                  </div>
                  <h4 className="text-lg font-semibold">Model B Settings</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium">Temperature: {rightTemperature}</Label>
                    <div className="mt-2 space-y-2">
                      <Slider
                        value={[rightTemperature]}
                        onValueChange={(value) => setRightTemperature(value[0])}
                        max={2}
                        min={0}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Focused</span>
                        <span>Creative</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Max Tokens: {rightMaxTokens}</Label>
                    <div className="mt-2 space-y-2">
                      <Slider
                        value={[rightMaxTokens]}
                        onValueChange={(value) => setRightMaxTokens(value[0])}
                        max={4000}
                        min={100}
                        step={100}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Short</span>
                        <span>Long</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">System Instructions</Label>
                  <Textarea
                    value={rightSystemPrompt}
                    onChange={(e) => setRightSystemPrompt(e.target.value)}
                    placeholder="Enter system instructions for Model B..."
                    className="mt-2 min-h-[100px]"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Reasoning Mode</Label>
                    <p className="text-xs text-muted-foreground">Show reasoning animation for supported models</p>
                  </div>
                  <Switch 
                    checked={reasoningMode} 
                    onCheckedChange={setReasoningMode}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleClear}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear Chat
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
