'use client';

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { MessageCircle, X, Maximize, Minimize, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';

/** ---------------------------------------------
 *  Types
 *  --------------------------------------------- */

type Role = 'user' | 'assistant' | 'system';

export type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  createdAt?: number;
};

type FlowiseResponse =
  | string
  | {
      text?: string;
      answer?: string;
      output?: string;
      message?: string;
      // Fall back to rendering unknown payloads cleanly
      [k: string]: unknown;
    };

type WidgetEvent =
  | { type: 'send'; message: ChatMessage }
  | { type: 'response'; message: ChatMessage }
  | { type: 'error'; error: Error }
  | { type: 'toggle'; open: boolean }
  | { type: 'maximize'; maximized: boolean };

export type PromptPilotWidgetProps = {
  /** Flowise /chatflow endpoint (defaults to your current one) */
  endpoint?: string;
  /** Optional headers (e.g., auth) */
  headers?: Record<string, string>;
  /** Initial assistant greeting */
  welcome?: string;
  /** System instruction sent along with the first request */
  systemPrompt?: string;
  /** Persist chat history in localStorage */
  persist?: boolean;
  /** Storage key for history */
  storageKey?: string;
  /** Include chat history when calling Flowise */
  sendHistory?: boolean;
  /** Called on important lifecycle events */
  onEvent?: (evt: WidgetEvent) => void;
  /** Optional className passthrough for the floating wrapper */
  className?: string;
  /** If Flowise supports streaming (ReadableStream), enable it */
  streaming?: boolean;
};

/** ---------------------------------------------
 *  Defaults
 *  --------------------------------------------- */

const DEFAULTS = {
  endpoint: 'https://cloud.flowiseai.com/api/v1/prediction/b18c3c80-adfb-4374-8cd0-fb48a4307d2e',
  storageKey: 'prompt-pilot.chat.v1',
  welcome: 'Hello! I\'m your PromptPilot Assistant. I can help you with prompt engineering, AI interactions, and optimizing your prompts for better results. How can I assist you today?',
};

/** ---------------------------------------------
 *  Utilities
 *  --------------------------------------------- */

// tiny uid (timestamp + counter) – avoids pulling in nanoid
let __ctr = 0;
const uid = (p = '') => `${p}${Date.now().toString(36)}-${(__ctr++).toString(36)}`;

const pickAnswer = (r: FlowiseResponse) => {
  if (typeof r === 'string') return r;
  return (
    r?.text ??
    r?.answer ??
    (typeof r?.output === 'string' ? r.output : undefined) ??
    (r?.message as string | undefined) ??
    JSON.stringify(r)
  );
};

const saveToStorage = (key: string, data: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
};

const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

/** ---------------------------------------------
 *  Chat reducer (predictable state)
 *  --------------------------------------------- */

type ChatState = {
  messages: ChatMessage[];
  isOpen: boolean;
  isMaximized: boolean;
  isLoading: boolean;
  pendingAssistantId?: string;
  error?: string;
};

type ChatAction =
  | { type: 'OPEN_TOGGLE' }
  | { type: 'MAX_TOGGLE' }
  | { type: 'SEND_START'; user: ChatMessage; assistantId: string }
  | { type: 'STREAM_APPEND'; id: string; chunk: string }
  | { type: 'ANSWER_SET'; id: string; content: string }
  | { type: 'DONE' }
  | { type: 'ERROR'; message: string }
  | { type: 'RESET_ERROR' }
  | { type: 'BOOTSTRAP'; messages: ChatMessage[] };

const reducer = (s: ChatState, a: ChatAction): ChatState => {
  switch (a.type) {
    case 'OPEN_TOGGLE':
      return { ...s, isOpen: !s.isOpen, isMaximized: s.isOpen ? false : s.isMaximized };
    case 'MAX_TOGGLE':
      return { ...s, isMaximized: !s.isMaximized };
    case 'SEND_START': {
      return {
        ...s,
        isLoading: true,
        error: undefined,
        pendingAssistantId: a.assistantId,
        messages: [...s.messages, a.user, { id: a.assistantId, role: 'assistant', content: '' }],
      };
    }
    case 'STREAM_APPEND': {
      return {
        ...s,
        messages: s.messages.map((m) => (m.id === a.id ? { ...m, content: m.content + a.chunk } : m)),
      };
    }
    case 'ANSWER_SET': {
      return {
        ...s,
        messages: s.messages.map((m) => (m.id === a.id ? { ...m, content: a.content } : m)),
      };
    }
    case 'DONE':
      return { ...s, isLoading: false, pendingAssistantId: undefined };
    case 'ERROR':
      return { ...s, isLoading: false, pendingAssistantId: undefined, error: a.message };
    case 'RESET_ERROR':
      return { ...s, error: undefined };
    case 'BOOTSTRAP':
      return { ...s, messages: a.messages };
    default:
      return s;
  }
};

/** ---------------------------------------------
 *  Network: query Flowise (supports full + streaming)
 *  --------------------------------------------- */

async function queryFlowise({
  endpoint,
  headers,
  question,
  history,
  streaming,
  signal,
}: {
  endpoint: string;
  headers?: Record<string, string>;
  question: string;
  history?: ChatMessage[];
  streaming?: boolean;
  signal?: AbortSignal;
}): Promise<{ mode: 'stream' | 'json'; read?: (onChunk: (t: string) => void) => Promise<string>; final?: string }> {
  const payload: Record<string, unknown> = { question };
  if (history && history.length) {
    // Flowise expects specific role format: "apiMessage" for assistant, "userMessage" for user
    payload.history = history.map((m) => ({ 
      role: m.role === 'assistant' ? 'apiMessage' : 'userMessage', 
      content: m.content 
    }));
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(headers ?? {}) },
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed (${res.status})`);
  }

  // Stream if possible & enabled
  if (streaming && res.body) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    async function read(onChunk: (t: string) => void): Promise<string> {
      let acc = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        acc += chunk;
        onChunk(chunk);
      }
      // Some Flowise setups still return JSON as a single chunk; try to pick answer if JSON-like
      try {
        const parsed = JSON.parse(acc) as FlowiseResponse;
        const picked = pickAnswer(parsed);
        if (typeof picked === 'string') return picked;
      } catch {
        /* not json, fine */
      }
      return acc;
    }

    return { mode: 'stream', read };
  }

  // Fallback: JSON or text
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    const json = (await res.json()) as FlowiseResponse;
    return { mode: 'json', final: pickAnswer(json) ?? '' };
  } else {
    const text = await res.text();
    return { mode: 'json', final: text };
  }
}

/** ---------------------------------------------
 *  Component
 *  --------------------------------------------- */

export function PromptPilotWidget({
  endpoint = DEFAULTS.endpoint,
  headers,
  welcome = DEFAULTS.welcome,
  systemPrompt,
  persist = true,
  storageKey = DEFAULTS.storageKey,
  sendHistory = true,
  onEvent,
  className,
  streaming = true,
}: PromptPilotWidgetProps) {
  // Hide widget on playground page
  const [shouldHide, setShouldHide] = useState(false);
  const [input, setInput] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [state, dispatch] = useReducer(reducer, {
    isOpen: false,
    isMaximized: false,
    isLoading: false,
    messages: [],
  });

  // Check if should hide widget - only show on homepage
  useEffect(() => {
    const checkPath = () => {
      const currentPath = window.location.pathname;
      const shouldHideWidget = currentPath !== '/' && currentPath !== '/index.html';
      console.log('Flowise widget path check:', currentPath, 'shouldHide:', shouldHideWidget);
      setShouldHide(shouldHideWidget);
    };
    
    checkPath();
    window.addEventListener('popstate', checkPath);
    return () => window.removeEventListener('popstate', checkPath);
  }, []);

  // Bootstrap messages (welcome + optional system)
  useEffect(() => {
    const existing = persist ? loadFromStorage<ChatMessage[]>(storageKey, []) : [];
    if (existing.length) {
      dispatch({ type: 'BOOTSTRAP', messages: existing });
      return;
    }
    const initial: ChatMessage[] = [
      ...(systemPrompt ? [{ id: uid('sys-'), role: 'system' as const, content: systemPrompt }] : []),
      { id: 'welcome', role: 'assistant', content: welcome, createdAt: Date.now() },
    ];
    dispatch({ type: 'BOOTSTRAP', messages: initial });
  }, [persist, storageKey, systemPrompt, welcome]);

  // Persist on change
  useEffect(() => {
    if (!persist) return;
    saveToStorage(storageKey, state.messages);
  }, [persist, storageKey, state.messages]);

  // Auto-scroll to bottom when messages or loading change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [state.messages, state.isLoading, state.pendingAssistantId]);

  const visibleMessages = useMemo(
    () => state.messages.filter((m) => m.role !== 'system'),
    [state.messages]
  );

  const toggleOpen = useCallback(() => {
    dispatch({ type: 'OPEN_TOGGLE' });
    onEvent?.({ type: 'toggle', open: !state.isOpen });
  }, [onEvent, state.isOpen]);

  const toggleMaximize = useCallback(() => {
    dispatch({ type: 'MAX_TOGGLE' });
    onEvent?.({ type: 'maximize', maximized: !state.isMaximized });
  }, [onEvent, state.isMaximized]);

  const cancelOngoing = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  const handleSend = useCallback(async () => {
    const prompt = input.trim();
    if (!prompt || state.isLoading) return;

    // Build messages to send (include system if present)
    const history = sendHistory ? state.messages : [];
    const userMsg: ChatMessage = { id: uid('u-'), role: 'user', content: prompt, createdAt: Date.now() };
    const assistantId = uid('a-');

    dispatch({ type: 'SEND_START', user: userMsg, assistantId });
    setInput('');
    onEvent?.({ type: 'send', message: userMsg });

    cancelOngoing();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await queryFlowise({
        endpoint,
        headers,
        question: prompt,
        history,
        streaming,
        signal: ctrl.signal,
      });

      if (res.mode === 'stream' && res.read) {
        const final = await res.read((chunk) => {
          dispatch({ type: 'STREAM_APPEND', id: assistantId, chunk });
        });
        // Ensure clean content at the end (covers json-y single chunk streams)
        dispatch({ type: 'ANSWER_SET', id: assistantId, content: final });
        onEvent?.({
          type: 'response',
          message: { id: assistantId, role: 'assistant', content: final, createdAt: Date.now() },
        });
      } else {
        const final = (res.final ?? '').toString();
        dispatch({ type: 'ANSWER_SET', id: assistantId, content: final });
        onEvent?.({
          type: 'response',
          message: { id: assistantId, role: 'assistant', content: final, createdAt: Date.now() },
        });
      }
      dispatch({ type: 'DONE' });
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Unknown error');
      dispatch({ type: 'ERROR', message: e.message || 'Something went wrong.' });
      dispatch({ type: 'ANSWER_SET', id: assistantId, content: 'Sorry, something went wrong.' });
      onEvent?.({ type: 'error', error: e });
    } finally {
      abortRef.current = null;
    }
  }, [cancelOngoing, endpoint, headers, input, onEvent, sendHistory, state.isLoading, state.messages, streaming]);

  // Enter to send, Shift+Enter for newline
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
      // Escape to cancel in-flight request
      if (e.key === 'Escape' && state.isLoading) {
        cancelOngoing();
        dispatch({ type: 'DONE' });
      }
    },
    [handleSend, cancelOngoing, state.isLoading]
  );

  // Hide widget on playground/compare pages
  if (shouldHide) {
    return null;
  }

  return (
    <>
      {/* Floating launcher */}
      <div className={cn('fixed bottom-4 right-4 z-50', className)}>
        <Button
          onClick={toggleOpen}
          size="icon"
          className="rounded-full w-14 h-14 bg-primary hover:bg-primary/90 shadow-2xl"
          aria-expanded={state.isOpen}
          aria-controls="prompt-pilot-panel"
        >
          {state.isOpen ? <X className="h-7 w-7 text-primary-foreground" /> : <MessageCircle className="h-7 w-7 text-primary-foreground" />}
          <span className="sr-only">{state.isOpen ? 'Close chat' : 'Open chat'}</span>
        </Button>
      </div>

      {/* Panel */}
      <div
        id="prompt-pilot-panel"
        className={cn(
          'fixed z-40 transition-all duration-300 ease-out',
          state.isMaximized ? 'bottom-4 right-4 left-4 top-4' : 'bottom-24 right-4 w-full max-w-sm',
          state.isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        )}
        aria-hidden={!state.isOpen}
      >
        <Card className={cn('flex flex-col bg-card/95 backdrop-blur border-border shadow-2xl rounded-xl', state.isMaximized ? 'h-full' : 'h-[70vh] max-h-[600px]')}>
          <CardHeader className="flex flex-row items-center gap-3 border-b flex-shrink-0">
            <div className="p-2 bg-primary/10 rounded-full">
              <Logo size={20} className="text-primary" />
            </div>
            <CardTitle className="font-headline text-foreground flex-1">PromptPilot Assistant</CardTitle>
            <div className="flex items-center gap-1">
              {state.isLoading ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    cancelOngoing();
                    dispatch({ type: 'DONE' });
                  }}
                  className="text-muted-foreground"
                >
                  Stop
                </Button>
              ) : null}
              <Button variant="ghost" size="icon" onClick={toggleMaximize} className="text-muted-foreground">
                {state.isMaximized ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                <span className="sr-only">{state.isMaximized ? 'Minimize' : 'Maximize'}</span>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full" role="log" aria-live="polite" aria-relevant="additions">
              <div className="p-4 space-y-3">
                {visibleMessages.map((m) => (
                  <div key={m.id} className={cn('flex gap-3', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                    {m.role !== 'user' && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Logo size={16} className="text-primary" />
                      </div>
                    )}
                    <div className={cn('max-w-[95%] rounded-lg px-3 py-2', m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                      <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                    </div>
                  </div>
                ))}

                {/* Typing dots */}
                {state.isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Logo size={16} className="text-primary" />
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

                {/* Error banner (compact, non-blocking) */}
                {state.error && (
                  <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
                    {state.error}
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </ScrollArea>
          </CardContent>

          <Separator />

          <CardFooter className="p-4 flex-shrink-0">
            <div className="flex w-full gap-2 items-end">
              <div className="flex-1">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Type your message…"
                  className="min-h-[52px] max-h-32 resize-none"
                  disabled={state.isLoading}
                  aria-label="Chat input"
                />
              </div>
              <Button 
                onClick={handleSend} 
                disabled={!input.trim() || state.isLoading} 
                size="icon"
                className="h-[52px] w-[52px] flex-shrink-0" 
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

// Backwards-compatible export for layout import
export const FlowiseWidget = PromptPilotWidget;
