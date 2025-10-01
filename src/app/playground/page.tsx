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
import { ChatSettingsModal } from '@/components/chat-settings-modal';
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
  ArrowDown,
  Eye,
  Sparkles,
  Crown,
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
import { comparePrompts } from '@/ai/flows/compare-prompts';
import { prepareFilesForGemini } from '@/lib/file-utils';
import { useStorage } from '@/contexts/storage-context';
import { useModel } from '@/contexts/model-context';
import { routePromptEnhancement } from '@/ai/flows/smart-prompt-router';
import { StressTestInterface } from '@/components/stress-test-interface';
import { ModelTestInterface } from '@/components/model-test-interface';
import { ModelIcon } from '@/components/model-icon';
import { LoadingAnimation } from '@/components/loading-animation';
import { SystemInstructionIndicator } from '@/components/system-instruction-indicator';

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
  const [showStressTest, setShowStressTest] = useState(false);
  const [showModelTest, setShowModelTest] = useState(false);
  const [reasoningMode, setReasoningMode] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [tokenUsage, setTokenUsage] = useState<{[key: string]: {prompt_tokens: number, completion_tokens: number, total_tokens: number}}>({});
  const [useGoldenStandard, setUseGoldenStandard] = useState(true);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showModelDropdown, setShowModelDropdown] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [savedCustomPrompt, setSavedCustomPrompt] = useState('');

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
        setCustomPrompt(data.customPrompt || '');
        setSavedCustomPrompt(data.savedCustomPrompt || '');
        setUseGoldenStandard(data.useGoldenStandard !== false);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, [availableModels]);

  // Save golden standard preference to localStorage
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem('playground-data') || '{}');
    savedData.useGoldenStandard = useGoldenStandard;
    localStorage.setItem('playground-data', JSON.stringify(savedData));
  }, [useGoldenStandard]);

  // Close model dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showModelDropdown) {
        setShowModelDropdown(null);
      }
    };

    if (showModelDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showModelDropdown]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    const data = {
      messages,
      systemPrompt,
      temperature,
      maxTokens,
      selectedModel,
      customPrompt,
      savedCustomPrompt,
      useGoldenStandard
    };
    localStorage.setItem('playground-data', JSON.stringify(data));
  }, [messages, systemPrompt, temperature, maxTokens, selectedModel, customPrompt, savedCustomPrompt, useGoldenStandard]);

  // Force re-render when model changes
  useEffect(() => {
    console.log('Selected model changed to:', selectedModel);
  }, [selectedModel]);

  // Scroll to bottom functionality
  const scrollToBottom = () => {
    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      setIsAtBottom(true);
      setShowScrollButton(false);
    }
  };

  // Check scroll position
  const checkScrollPosition = () => {
    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
      const isAtBottomNow = scrollHeight - scrollTop - clientHeight < 10;
      setIsAtBottom(isAtBottomNow);
      setShowScrollButton(!isAtBottomNow && messages.length > 0);
    }
  };

  // Auto-scroll to bottom when new messages arrive (only if user was already at bottom)
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages, isAtBottom]);

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

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call the playground API
      const response = await fetch('/api/playground/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: useGoldenStandard ? systemPrompt : customPrompt },
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            { role: 'user', content: input }
          ],
          config: {
            model: selectedModel,
            systemPrompt: useGoldenStandard ? systemPrompt : customPrompt,
            temperature: temperature,
            maxTokens: maxTokens,
            topP: 0.9,
            topK: 40,
            stopSequences: [],
            useGoldenStandard: useGoldenStandard
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

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        model: selectedModel
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
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === assistantMessage.id 
                        ? { ...msg, content: msg.content + data.content }
                        : msg
                    )
                  );
                }
                // Capture token usage if available
                if (data.usage) {
                  setTokenUsage(prev => ({
                    ...prev,
                    [assistantMessage.id]: data.usage
                  }));
                }
              } catch (e) {
                // Ignore parsing errors for incomplete chunks
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
    setInput('');
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

  const handleRegenerate = async (messageId: string, selectedModel?: string) => {
    // Find the message to regenerate
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;

    // Get the user message that prompted this response
    const userMessage = messages[messageIndex - 1];
    if (!userMessage || userMessage.role !== 'user') return;

    // Remove the current AI response
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    
    // Set the model if provided
    if (selectedModel) {
      setSelectedModel(selectedModel);
    }
    
    // Close the dropdown
    setShowModelDropdown(null);
    
    // Regenerate with the same user message using the selected model
    await regenerateWithModel(userMessage.content, selectedModel || availableModels[0]?.id || 'gpt-4');
  };

  const regenerateWithModel = async (userMessage: string, modelId: string) => {
    if (!userMessage.trim() || isLoading) return;

    setIsLoading(true);
    
    // Add user message
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: Date.now()
    };
    
    // Add assistant message placeholder
    const assistantMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      model: modelId
    };
    
    setMessages(prev => [...prev, userMsg, assistantMessage]);

    try {
      const response = await fetch('/api/playground/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: useGoldenStandard ? systemPrompt : customPrompt },
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            { role: 'user', content: userMessage }
          ],
          config: {
            model: modelId,
            systemPrompt: useGoldenStandard ? systemPrompt : customPrompt,
            temperature: temperature,
            maxTokens: maxTokens,
            topP: 0.9,
            topK: 40,
            stopSequences: [],
            useGoldenStandard: useGoldenStandard
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
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === assistantMessage.id 
                        ? { ...msg, content: msg.content + data.content }
                        : msg
                    )
                  );
                }
                // Capture token usage if available
                if (data.usage) {
                  setTokenUsage(prev => ({
                    ...prev,
                    [assistantMessage.id]: data.usage
                  }));
                }
              } catch (e) {
                // Ignore parsing errors for incomplete chunks
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error regenerating message:', error);
      toast({
        title: "Error",
        description: "Failed to regenerate message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelSwitch = (messageId: string, newModel: string) => {
    // Find the message to regenerate with different model
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;

    // Get the user message that prompted this response
    const userMessage = messages[messageIndex - 1];
    if (!userMessage || userMessage.role !== 'user') return;

    // Remove the current AI response
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    
    // Regenerate with different model
    setSelectedModel(newModel);
    setInput(userMessage.content);
    handleSendMessage();
  };

  const handleSmartEnhancement = async () => {
    if (!input.trim()) return;
    
    setIsEnhancing(true);
    try {
      const result = await routePromptEnhancement({
        userPrompt: input,
        context: 'Playground testing',
        enhancementType: 'auto'
      });
      
      setInput(result.enhancedPrompt);
      toast({
        title: "Prompt Enhanced",
        description: `Applied: ${result.appliedEnhancements.join(', ')}`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Enhancement Failed",
        description: "Failed to enhance prompt. Please try again.",
      });
    } finally {
      setIsEnhancing(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="min-h-screen flex flex-col">
        {/* Modern Header */}
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 flex-shrink-0">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
                    <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="h-6 w-px bg-slate-300 dark:bg-slate-600" />
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                  <Logo size={20} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">AI Playground</h1>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm">
                      Beta
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Test & compare AI models</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* System Instruction Toggle */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                  <Button
                    onClick={() => {
                      if (useGoldenStandard) {
                        // Already on golden standard, do nothing
                        return;
                      } else {
                        // Save current custom prompt before switching
                        if (systemPrompt && systemPrompt !== 'You are a helpful AI assistant.') {
                          setSavedCustomPrompt(systemPrompt);
                        }
                        setUseGoldenStandard(true);
                        toast({
                          title: "Switched to Golden Standard",
                          description: "Your custom prompt has been saved and can be restored later.",
                          duration: 2000,
                        });
                      }
                    }}
                    variant={useGoldenStandard ? "default" : "ghost"}
                    size="sm"
                    className="gap-2 text-xs h-8"
                  >
                    <Crown className="h-3 w-3" />
                    Golden Standard
                  </Button>
                  <Button
                    onClick={() => {
                      if (!useGoldenStandard) {
                        // If already on custom, just open settings
                        setShowSettings(true);
                      } else {
                        // Switch to custom and restore saved prompt if available
                        setUseGoldenStandard(false);
                        if (savedCustomPrompt) {
                          setCustomPrompt(savedCustomPrompt);
                          toast({
                            title: "Switched to Custom",
                            description: "Your saved custom prompt has been restored.",
                            duration: 2000,
                          });
                        } else {
                          setShowSettings(true);
                          toast({
                            title: "Switched to Custom",
                            description: "You can now edit your custom prompt in the settings.",
                            duration: 2000,
                          });
                        }
                      }
                    }}
                    variant={!useGoldenStandard ? "default" : "ghost"}
                    size="sm"
                    className="gap-2 text-xs h-8"
                  >
                    <Sparkles className="h-3 w-3" />
                    Custom
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <Button
                  onClick={() => {
                    setShowStressTest(true);
                    setShowModelTest(false);
                  }}
                  variant={showStressTest ? "default" : "ghost"}
                  size="sm"
                  className="gap-2 text-xs h-8"
                >
                  <TestTube className="h-3 w-3" />
                  Stress
                </Button>
                <Button
                  onClick={() => {
                    setShowModelTest(true);
                    setShowStressTest(false);
                  }}
                  variant={showModelTest ? "default" : "ghost"}
                  size="sm"
                  className="gap-2 text-xs h-8"
                >
                  <Bug className="h-3 w-3" />
                  Test
                </Button>
                <Button
                  onClick={() => router.push('/playground/compare')}
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-xs h-8"
                >
                  <SplitSquareHorizontal className="h-3 w-3" />
                  Compare
                </Button>
              </div>
              <Button
                onClick={() => {
                  console.log('Settings button clicked, current state:', showSettings);
                  setShowSettings(!showSettings);
                  console.log('Settings state after toggle:', !showSettings);
                }}
                      variant="outline"
                      size="sm"
                className="gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
              <ThemeToggle />
          </div>
        </div>
      </header>


      {/* Main Content */}
        <div className="flex-1 flex min-h-0">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col min-h-0">
            {showStressTest ? (
              /* Stress Test View - Full Width */
              <div className="flex-1 p-6 overflow-auto">
                <div className="max-w-6xl mx-auto">
                  <div className="mb-6">
                    <div className="flex items-center gap-4 mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                        onClick={() => setShowStressTest(false)}
                        className="gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
                    >
                        <ArrowLeft className="h-4 w-4" />
                      Back to Playground
                    </Button>
                      <div className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Stress Testing</h2>
                  </div>
                </div>
                  <StressTestInterface
                    onSendMessage={handleSendMessage}
                    onSystemPromptChange={setSystemPrompt}
                    currentSystemPrompt={systemPrompt}
                />
              </div>
            </div>
          ) : showModelTest ? (
            /* Model Test View - Full Width */
              <div className="flex-1 p-6 overflow-auto">
              <div className="max-w-6xl mx-auto">
                  <div className="mb-6">
                    <div className="flex items-center gap-4 mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowModelTest(false)}
                        className="gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
                    >
                        <ArrowLeft className="h-4 w-4" />
                      Back to Playground
                    </Button>
                      <div className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Model Testing</h2>
                  </div>
                </div>
                <ModelTestInterface />
              </div>
            </div>
            ) : (
              <>
            {/* Messages */}
            <div 
              id="messages-container"
              className="flex-1 overflow-y-auto p-4 min-h-0 relative"
              onScroll={checkScrollPosition}
            >
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center max-w-3xl">
                    <div className="relative mb-8">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-600/20 rounded-full blur-xl"></div>
                      <div className="relative p-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                        <Logo size={40} className="text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Welcome to AI Playground</h3>
                    <p key={selectedModel} className="text-slate-600 dark:text-slate-300 mb-6 text-base">
                      Test your prompts with <span className="font-semibold text-blue-600 dark:text-blue-400">{availableModels.find(m => m.id === selectedModel)?.name || selectedModel}</span>
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <span>Press</span>
                      <kbd className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs font-mono">Shift + Ctrl + S</kbd>
                      <span>for settings</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {message.role === 'user' ? (
                        // User message with bubble (GPT style)
                        <div className="max-w-[85%] rounded-2xl px-4 py-2 bg-blue-500 text-white">
                          <MarkdownRenderer content={message.content} />
                        </div>
                      ) : (
                        // AI response with GPT-like styling
                        <div className="max-w-[95%] flex items-start gap-4 group">
                          <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <ModelIcon modelId={message.model || selectedModel} size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                              <MarkdownRenderer content={message.content} />
                            </div>
                            <div className="mt-3 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                              {message.model && (
                                <span className="font-medium">{message.model}</span>
                              )}
                              {tokenUsage[message.id] && (
                                <div className="flex items-center gap-2">
                                  <span>•</span>
                                  <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                    {tokenUsage[message.id].total_tokens} tokens
                                  </span>
                                  <span className="text-slate-400 dark:text-slate-500">
                                    ({tokenUsage[message.id].prompt_tokens} + {tokenUsage[message.id].completion_tokens})
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="mt-3 flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(message.content, message.id)}
                                className="h-8 px-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-700"
                              >
                                {copiedMessageId === message.id ? (
                                  <Check className="h-3 w-3 mr-1" />
                                ) : (
                                  <Copy className="h-3 w-3 mr-1" />
                                )}
                                {copiedMessageId === message.id ? 'Copied!' : 'Copy'}
                              </Button>
                              
                              <div className="relative">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowModelDropdown(showModelDropdown === message.id ? null : message.id)}
                                  className="h-8 px-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-700"
                                >
                                  <RotateCcw className="h-3 w-3 mr-1" />
                                  Regenerate
                                </Button>
                                
                                {showModelDropdown === message.id && (
                                  <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 min-w-[200px]">
                                    <div className="p-2">
                                      <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Select Model:</div>
                                      {availableModels.map((model) => (
                                        <button
                                          key={model.id}
                                          onClick={() => {
                                            handleRegenerate(message.id, model.id);
                                            setShowModelDropdown(null);
                                          }}
                                          className="w-full text-left px-3 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md flex items-center gap-2"
                                        >
                                          <ModelIcon modelId={model.id} size={12} />
                                          {model.name}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="max-w-[95%] flex items-start gap-4">
                      <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <ModelIcon modelId={selectedModel} size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <LoadingAnimation reasoning={reasoningMode && (selectedModel.includes('o1') || selectedModel.includes('reasoning'))} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Scroll to Bottom Button */}
            {showScrollButton && (
              <div className="absolute bottom-20 right-6 z-10">
                <Button
                  onClick={scrollToBottom}
                  size="sm"
                  className="rounded-full h-10 w-10 p-0 shadow-lg bg-primary hover:bg-primary/90"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
            )}


            {/* Modern Input Area - Fixed at bottom */}
            <div className="flex-shrink-0 border-t border-slate-200/50 dark:border-slate-700/50 p-4 bg-slate-50 dark:bg-slate-900 min-h-[80px] sticky bottom-0 z-10">
              <div className="max-w-3xl mx-auto">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-600/10 rounded-3xl blur-sm group-focus-within:opacity-100 opacity-0 transition-opacity duration-300"></div>
                  <div className="relative bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-200 group-focus-within:border-blue-300 dark:group-focus-within:border-blue-600">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask anything... (Shift + Enter for new line)"
                      className="flex-1 min-h-[50px] max-h-[160px] resize-none pr-20 pl-4 py-3 text-sm border-0 bg-transparent focus:ring-0 focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (!isLoading) {
                            handleSendMessage();
                          }
                        }
                      }}
                      disabled={isLoading}
                    />
                    <div className="absolute right-2 top-2 flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFileUpload(!showFileUpload)}
                        disabled={isLoading}
                        className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                        title="Upload Files"
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      {isLoading ? (
                        <Button
                          onClick={() => {
                            // Stop generation logic would go here
                            setIsLoading(false);
                            toast({
                              title: "Generation Stopped",
                              description: "Response generation has been stopped.",
                            });
                          }}
                          size="sm"
                          variant="destructive"
                          className="h-7 px-2 bg-red-500 hover:bg-red-600 text-white shadow-lg"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          onClick={handleSendMessage}
                          disabled={!input.trim() || isLoading}
                          size="sm"
                          className="h-7 px-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-4">
                    <span>Press Enter to send</span>
                    <span>•</span>
                    <span>Shift + Enter for new line</span>
                    {isLoading && (
                      <>
                        <span>•</span>
                        <span className="text-blue-600 dark:text-blue-400">Generating response...</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1">
                      <Select value={selectedModel} onValueChange={setSelectedModel}>
                        <SelectTrigger className="w-auto h-6 border-0 bg-transparent text-xs font-medium text-slate-700 dark:text-slate-300 focus:ring-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableModels.map((model) => (
                            <SelectItem key={model.id} value={model.id} className="text-xs">
                              <div className="flex items-center gap-2">
                                <ModelIcon modelId={model.id} size={12} />
                                {model.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
              </>
            )}
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
        useGoldenStandard={useGoldenStandard}
        customPrompt={customPrompt}
        onCustomPromptChange={setCustomPrompt}
      />
    </div>
  );
}