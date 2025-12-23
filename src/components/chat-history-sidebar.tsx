'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Clock, 
  Settings, 
  RotateCcw, 
  PanelLeftClose, 
  Home, 
  TestTube, 
  Bug,
  SplitSquareHorizontal,
  Edit3, 
  Check, 
  X,
  MoreVertical,
  MessageCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';

interface ChatSession {
  id: string;
  title: string;
  timestamp: number;
  messageCount: number;
  systemPrompt?: string;
  author?: string;
  testCaseTag?: string;
}

interface ChatHistorySidebarProps {
  currentSessionId?: string;
  currentConversationLength?: number;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
  onSessionDelete: (sessionId: string) => void;
  onSessionRename: (sessionId: string, newTitle: string) => void;
  onSettingsClick: () => void;
  onStressTestClick: () => void;
  onModelTestClick: () => void;
  onSplitChatClick: () => void;
  onClearClick: () => void;
  onHideSidebar: () => void;
  refreshTrigger?: number; // Add refresh trigger prop
}

export function ChatHistorySidebar({
  currentSessionId,
  currentConversationLength = 0,
  onSessionSelect,
  onNewSession,
  onSessionDelete,
  onSessionRename,
  onSettingsClick,
  onStressTestClick,
  onModelTestClick,
  onSplitChatClick,
  onClearClick,
  onHideSidebar,
  refreshTrigger
}: ChatHistorySidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);
  const { toast } = useToast();

  // Load sessions from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSessions = localStorage.getItem('playground-sessions');
      if (savedSessions) {
        try {
          setSessions(JSON.parse(savedSessions));
        } catch (error) {
          console.error('Failed to load chat sessions:', error);
        }
      }
    }
  }, [refreshTrigger]); // Refresh when trigger changes

  // Save sessions to localStorage
  const saveSessions = (newSessions: ChatSession[]) => {
    setSessions(newSessions);
    if (typeof window !== 'undefined') {
      localStorage.setItem('playground-sessions', JSON.stringify(newSessions));
    }
  };

  // Generate AI-powered thread name based on conversation content
  const generateThreadName = async (conversation: any[]) => {
    try {
      // Get the first user message to generate a meaningful title
      const firstUserMessage = conversation.find(msg => msg.role === 'user');
      if (!firstUserMessage) {
        return generateFallbackName();
      }

      // Call AI to generate a title
      const response = await fetch('/api/generate-title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: firstUserMessage.content.substring(0, 200) // Limit to first 200 chars
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.title || generateFallbackName();
      }
    } catch (error) {
      console.error('Failed to generate title:', error);
    }
    
    return generateFallbackName();
  };

  // Fallback name generator
  const generateFallbackName = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return `${dateStr} at ${timeStr}`;
  };

  // Detect test case tag from system prompt
  const detectTestCaseTag = (systemPrompt: string): string | undefined => {
    if (!systemPrompt) return undefined;
    
    const prompt = systemPrompt.toLowerCase();
    
    // Check for specific test case patterns
    if (prompt.includes('supportchatbot_condition_agent') || prompt.includes('classify customer messages')) {
      return 'Condition';
    }
    if (prompt.includes('supportchatbot_other_agent') || prompt.includes('intelligent assistant helping')) {
      return 'Other';
    }
    if (prompt.includes('supportchatbot_conversation_llm') || prompt.includes('expert assistant trained to have conversations')) {
      return 'Conversation';
    }
    if (prompt.includes('supportchatbot_complex_agent') || prompt.includes('complex query') || prompt.includes('advanced troubleshooting')) {
      return 'Complex';
    }
    if (prompt.includes('supportchatbot_howto_agent') || prompt.includes('how-to') || prompt.includes('step-by-step')) {
      return 'How-To';
    }
    
    return undefined;
  };

  // Add new session - check for conversation history first
  const handleNewSession = async () => {
    if (isCreatingNewChat) return; // Prevent spamming
    
    // Check if current session has conversation history
    if (currentConversationLength === 0) {
      toast({
        title: "Start a conversation first",
        description: "Please send a message in the current chat before creating a new one",
        duration: 3000,
      });
      return;
    }
    
    setIsCreatingNewChat(true);

    try {
      // Let parent handle session creation
      onNewSession();
      
      // Success toast with auto-dismiss
      toast({
        title: "New Chat",
        description: "Started a new conversation",
        duration: 2000,
      });
      
    } finally {
      setIsCreatingNewChat(false);
    }
  };

  // Delete session
  const handleDeleteSession = (sessionId: string) => {
    const newSessions = sessions.filter(s => s.id !== sessionId);
    saveSessions(newSessions);
    onSessionDelete(sessionId);
    toast({
      title: "Chat Deleted",
      description: "Chat session has been removed",
    });
  };

  // Start editing session title
  const handleStartEdit = (session: ChatSession) => {
    setEditingSession(session.id);
    setEditTitle(session.title);
  };

  // Save edited title
  const handleSaveEdit = () => {
    if (editingSession && editTitle.trim()) {
      const newSessions = sessions.map(s => 
        s.id === editingSession ? { ...s, title: editTitle.trim() } : s
      );
      saveSessions(newSessions);
      onSessionRename(editingSession, editTitle.trim());
      setEditingSession(null);
      setEditTitle('');
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingSession(null);
    setEditTitle('');
  };

  // Update session (called from parent when messages are added)
  const updateSession = async (sessionId: string, updates: Partial<ChatSession>) => {
    // Auto-detect test case tag if system prompt is provided
    if (updates.systemPrompt) {
      const testCaseTag = detectTestCaseTag(updates.systemPrompt);
      updates.testCaseTag = testCaseTag;
    }
    
    const newSessions = sessions.map(s => 
      s.id === sessionId ? { ...s, ...updates } : s
    );
    saveSessions(newSessions);
  };

  // Update session title after first message (called from parent)
  const updateSessionTitle = async (sessionId: string, conversation: any[]) => {
    // Only update if title is still "New Chat"
    const session = sessions.find(s => s.id === sessionId);
    if (session && session.title === "New Chat") {
      try {
        const title = await generateThreadName(conversation);
        const newSessions = sessions.map(s => 
          s.id === sessionId ? { ...s, title } : s
        );
        saveSessions(newSessions);
      } catch (error) {
        console.error('Failed to update session title:', error);
      }
    }
  };

  // Expose updateSession functions to parent
  useEffect(() => {
    (window as any).updatePlaygroundSession = updateSession;
    (window as any).updatePlaygroundSessionTitle = updateSessionTitle;
  }, [sessions]);

  const formatTime = (timestamp: number) => {
    if (!timestamp || isNaN(timestamp)) {
      return 'Unknown';
    }
    
    const date = new Date(timestamp);
    const now = new Date();
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="w-full bg-background border-r border-border/50 flex flex-col h-full overflow-hidden">
      {/* Header - Close Button and Logo */}
      <div className="px-3 py-3 border-b border-border/50 flex-shrink-0">
        <div className="flex flex-col items-center gap-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={onHideSidebar}
            className="h-7 w-7 p-0 hover:bg-muted self-end"
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 rounded-lg bg-primary/10">
              <Logo size={24} />
            </div>
            <h2 className="text-sm font-semibold text-foreground">PromptPilot</h2>
          </div>
        </div>
      </div>

      {/* Navigation Buttons - Vertical Stack */}
      <div className="px-3 py-2 border-b border-border/50 flex-shrink-0">
        <div className="space-y-1">
          <Link href="/">
            <Button
              size="sm"
              variant="outline"
              className="w-full justify-start h-9 px-3 text-sm font-medium"
              title="Return to the main prompt engineering interface"
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            onClick={onSettingsClick}
            className="w-full justify-start h-9 px-3 text-sm font-medium"
            title="Configure model settings, temperature, and other parameters"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onSplitChatClick}
            className="w-full justify-start h-9 px-3 text-sm font-medium"
            title="Compare responses from different AI models side by side (Ctrl+Alt+C)"
          >
            <SplitSquareHorizontal className="h-4 w-4 mr-2" />
            <span className="flex-1">Compare Models</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌃⌥</span>C
            </kbd>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onModelTestClick}
            className="w-full justify-start h-9 px-3 text-sm font-medium"
            title="Test and evaluate different AI models with various prompts (SHIFT+M)"
          >
            <Bug className="h-4 w-4 mr-2" />
            <span className="flex-1">Model Testing</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⇧</span>M
            </kbd>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onStressTestClick}
            className="w-full justify-start h-9 px-3 text-sm font-medium"
            title="Run stress tests and performance benchmarks on AI models"
          >
            <TestTube className="h-4 w-4 mr-2" />
            Stress Testing
          </Button>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="px-3 py-2 border-b border-border/50 flex-shrink-0">
        <Button
          onClick={handleNewSession}
          disabled={isCreatingNewChat}
          className="w-full h-9 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg transition-all duration-200"
          title="Start a new conversation (SHIFT+N)"
        >
          {isCreatingNewChat ? (
            <>
              <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-2" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              <span className="flex-1">New Chat</span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-primary-foreground/20 px-1.5 font-mono text-[10px] font-medium text-primary-foreground/80 opacity-100">
                <span className="text-xs">⇧</span>N
              </kbd>
            </>
          )}
        </Button>
      </div>

      {/* Chat History */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-1.5">
          {sessions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <MessageCircle className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="text-xs font-medium mb-1">No conversations yet</p>
              <p className="text-[10px]">Start a new chat to see it here</p>
            </div>
          ) : (
            <div className="space-y-1">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`group relative rounded-lg transition-all duration-200 cursor-pointer ${
                    currentSessionId === session.id 
                      ? 'bg-primary/10 border border-primary/20' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => onSessionSelect(session.id)}
                >
                  <div className="p-2">
                    {editingSession === session.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="h-8 text-sm font-medium"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          onBlur={handleSaveEdit}
                        />
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            className="h-6 px-2 text-xs"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                            className="h-6 px-2 text-xs"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 
                            className="text-xs font-medium text-foreground mb-1 break-words leading-tight"
                            title={session.title}
                          >
                            {session.title}
                          </h3>
                          <div className="flex items-center gap-1.5">
                            {session.testCaseTag && (
                              <Badge 
                                variant="secondary" 
                                className="text-[10px] h-4 px-1.5 font-medium"
                              >
                                {session.testCaseTag}
                              </Badge>
                            )}
                            {session.systemPrompt && !session.testCaseTag && (
                              <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                                Custom
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 hover:bg-muted"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(session);
                            }}
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 hover:bg-destructive/10 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSession(session.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-1.5 border-t border-border/50 flex-shrink-0 space-y-1">
        {/* Theme Toggle */}
        <div className="flex justify-center">
          <ThemeToggle />
        </div>
        
        {/* Clear Current Chat */}
        <Button
          size="sm"
          variant="outline"
          onClick={onClearClick}
          className="w-full h-6 text-[10px] font-medium"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Clear Chat
        </Button>
      </div>
    </div>
  );
}
