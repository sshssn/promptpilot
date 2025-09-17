'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Copy, Check, User, Bot, Settings, ArrowDown, Paperclip, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';
import { MultimodalUpload } from '@/components/multimodal-upload';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    preview?: string;
  }>;
}

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  type: 'image' | 'pdf' | 'document' | 'other';
}

interface PlaygroundInterfaceProps {
  conversation: Message[];
  onSendMessage: (message: string, attachments?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    preview?: string;
  }>) => void;
  isStreaming: boolean;
  systemPrompt: string;
}

export function PlaygroundInterface({
  conversation,
  onSendMessage,
  isStreaming,
  systemPrompt
}: PlaygroundInterfaceProps) {
  const [input, setInput] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Check if user is at bottom of scroll
  const checkScrollPosition = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        const { scrollTop, scrollHeight, clientHeight } = scrollElement;
        const isAtBottomNow = scrollHeight - scrollTop - clientHeight < 10;
        setIsAtBottom(isAtBottomNow);
        setShowScrollButton(!isAtBottomNow && conversation.length > 0);
      }
    }
  };

  // Auto-scroll to bottom when new messages arrive (only if user was already at bottom)
  useEffect(() => {
    if (isAtBottom && scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
    checkScrollPosition();
  }, [conversation, isAtBottom]);

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
        setIsAtBottom(true);
        setShowScrollButton(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || uploadedFiles.length > 0) && !isStreaming) {
      // Create message with attachments
      const message = input.trim() || 'Files attached';
      const attachments = uploadedFiles.map(file => ({
        id: file.id,
        name: file.file.name,
        type: file.file.type,
        size: file.file.size,
        preview: file.preview
      }));
      
      onSendMessage(message, attachments);
      setInput('');
      setUploadedFiles([]);
      setShowUpload(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const copyToClipboard = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      toast({
        title: "Copied!",
        description: "Message copied to clipboard.",
      });
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'assistant':
        return <Bot className="h-4 w-4" />;
      case 'system':
        return <Settings className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'user':
        return 'bg-blue-500';
      case 'assistant':
        return 'bg-green-500';
      case 'system':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'user':
        return 'You';
      case 'assistant':
        return 'Assistant';
      case 'system':
        return 'System Prompt';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Messages */}
      <ScrollArea 
        ref={scrollAreaRef} 
        className="flex-1 p-3 md:p-4"
        onScrollCapture={checkScrollPosition}
      >
        <div className="max-w-2xl mx-auto space-y-3 md:space-y-4">
          {conversation
            .filter(message => message.role !== 'system')
            .map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
              <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                {message.role === 'user' ? (
                  <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3 shadow-sm">
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {message.attachments.map((attachment) => (
                          <div key={attachment.id} className="flex items-center gap-2 p-2 bg-primary-foreground/10 rounded-lg">
                            {attachment.preview ? (
                              <img
                                src={attachment.preview}
                                alt={attachment.name}
                                className="h-8 w-8 rounded object-cover"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded bg-primary-foreground/20 flex items-center justify-center">
                                <Paperclip className="h-4 w-4" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{attachment.name}</p>
                              <p className="text-xs opacity-70">
                                {(attachment.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="whitespace-pre-wrap text-xs leading-relaxed">
                      {message.content}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] opacity-70">
                        {formatTimestamp(message.timestamp)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                        onClick={() => copyToClipboard(message.content, message.id)}
                      >
                        {copiedMessageId === message.id ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-primary text-primary-foreground flex-shrink-0">
                      {message.role === 'assistant' ? (
                        <Logo size={16} className="text-primary-foreground" />
                      ) : (
                        getRoleIcon(message.role)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-[10px]">
                          {getRoleLabel(message.role)}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {formatTimestamp(message.timestamp)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 ml-auto"
                          onClick={() => copyToClipboard(message.content, message.id)}
                        >
                          {copiedMessageId === message.id ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap text-xs leading-relaxed">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {conversation.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-primary/10 rounded-full p-4 mb-6">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Start Testing Your Prompt
              </h3>
              <p className="text-muted-foreground max-w-sm leading-relaxed text-sm">
                Send a message to test how the AI responds with your system prompt. 
                Try different types of questions to see how well it follows the instructions.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

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

      {/* Input Area */}
      <div className="border-t bg-background/50 backdrop-blur-sm p-3 md:p-4 flex-shrink-0">
        <div className="max-w-2xl mx-auto">
          {/* File Upload Area */}
          {showUpload && (
            <div className="mb-4">
              <MultimodalUpload
                onFilesChange={setUploadedFiles}
                maxFiles={5}
                maxSize={10}
              />
            </div>
          )}
          
          {/* Frost Glass Input Container */}
          <div className="relative">
            <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl p-3 shadow-xl">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <div className="flex-1 relative">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything... (Press Enter to send, Shift+Enter for new line)"
                    className="min-h-[45px] max-h-[90px] resize-none pr-[50px] bg-transparent border-0 focus:ring-0 placeholder:text-muted-foreground/70 text-foreground text-sm"
                    disabled={isStreaming}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUpload(!showUpload)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-[45px] w-[45px] p-0 hover:bg-white/20 dark:hover:bg-white/10"
                    disabled={isStreaming}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  type="submit"
                  disabled={(!input.trim() && uploadedFiles.length === 0) || isStreaming}
                  className="px-4 h-[45px] rounded-xl bg-primary hover:bg-primary/90 shadow-lg transition-all duration-200 hover:scale-105 text-sm"
                >
                  {isStreaming ? (
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="hidden sm:inline text-xs">Sending...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Send className="h-3 w-3" />
                      <span className="hidden sm:inline text-xs">Send</span>
                    </div>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
