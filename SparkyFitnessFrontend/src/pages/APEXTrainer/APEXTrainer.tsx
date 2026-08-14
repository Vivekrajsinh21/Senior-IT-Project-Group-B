import {
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Bot,
  Clock3,
  Send,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Button } from '@/components/ui/button';

const CONVERSATION_STORAGE_KEY =
  'apextrainer:ai-conversation-id';

const MESSAGE_STORAGE_KEY =
  'apextrainer:ai-current-messages';

/**
 * Response returned by the authenticated AI Gateway.
 */
interface GatewayResponse {
  answer?: string;
  detail?: string;
  conversation_id?: string;
}

/**
 * Basic authenticated user information returned by Better Auth.
 */
interface SessionUser {
  id?: string;
  name?: string | null;
  email?: string | null;
}

/**
 * Better Auth responses can have slightly different shapes,
 * so the frontend supports the common response structures.
 */
interface SessionResponse {
  user?: SessionUser;
  data?: {
    user?: SessionUser;
  };
  id?: string;
  name?: string | null;
  email?: string | null;
}

type ChatRole = 'user' | 'assistant' | 'system';

/**
 * A chat message displayed in the conversation.
 *
 * createdAt is stored as an ISO timestamp so the browser
 * can display it using the user's local timezone.
 */
interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

/**
 * Reuse the existing conversation ID for the current browser session.
 *
 * The ID is only a conversation identifier.
 * It is NOT used as an authenticated user ID.
 */
function getOrCreateConversationId(): string {
  const existingConversationId =
    window.sessionStorage.getItem(
      CONVERSATION_STORAGE_KEY,
    );

  if (existingConversationId) {
    return existingConversationId;
  }

  const conversationId = uuidv4();

  window.sessionStorage.setItem(
    CONVERSATION_STORAGE_KEY,
    conversationId,
  );

  return conversationId;
}

/**
 * Restore the visible messages after a page refresh.
 *
 * This is temporary browser-session storage only.
 * Persistent multi-device history will later be stored
 * securely in the ApexTrainer database.
 */
function loadStoredMessages(): ChatMessage[] {
  try {
    const raw =
      window.sessionStorage.getItem(
        MESSAGE_STORAGE_KEY,
      );

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as ChatMessage[];
  } catch {
    return [];
  }
}

/**
 * Extract the authenticated user from different
 * Better Auth response formats.
 */
function extractAuthenticatedUser(
  sessionData: SessionResponse | null,
): SessionUser | null {
  if (!sessionData) {
    return null;
  }

  if (sessionData.user) {
    return sessionData.user;
  }

  if (sessionData.data?.user) {
    return sessionData.data.user;
  }

  if (sessionData.id) {
    return {
      id: sessionData.id,
      name: sessionData.name,
      email: sessionData.email,
    };
  }

  return null;
}

/**
 * Use the user's saved first name for the friendly greeting.
 */
function getDisplayName(user: SessionUser): string {
  const savedName = user.name?.trim();

  if (savedName) {
    return savedName.split(/\s+/)[0] || savedName;
  }

  const emailName =
    user.email?.split('@')[0]?.trim();

  return emailName || 'there';
}

/**
 * Display message timestamps using the browser's
 * local time configuration.
 */
function formatMessageTime(
  isoTimestamp: string,
): string {
  const date = new Date(isoTimestamp);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Create one message object with a trusted local timestamp.
 */
function createMessage(
  role: ChatRole,
  content: string,
): ChatMessage {
  return {
    id: uuidv4(),
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

export default function APEXTrainer() {
  const [question, setQuestion] =
    useState('');

  const [messages, setMessages] =
    useState<ChatMessage[]>(
      loadStoredMessages,
    );

  const [loading, setLoading] =
    useState(false);

  const [displayName, setDisplayName] =
    useState('there');

  const [sessionReady, setSessionReady] =
    useState(false);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  /*
   * Load the currently authenticated ApexTrainer user.
   *
   * The frontend never selects or submits a user ID.
   * Better Auth resolves the session cookie to the real user.
   */
  useEffect(() => {
    const controller = new AbortController();

    const loadAuthenticatedUser = async () => {
      try {
        const response = await fetch(
          '/api/auth/get-session',
          {
            method: 'GET',
            credentials: 'include',
            headers: {
              Accept: 'application/json',
            },
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          if (response.status === 401) {
            setDisplayName('there');
            setSessionReady(true);
            return;
          }

          throw new Error(
            `Session request failed with status ${response.status}.`,
          );
        }

        const sessionData =
          (await response.json()) as
            | SessionResponse
            | null;

        const authenticatedUser =
          extractAuthenticatedUser(sessionData);

        if (authenticatedUser?.id) {
          setDisplayName(
            getDisplayName(authenticatedUser),
          );
        }

        setSessionReady(true);
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === 'AbortError'
        ) {
          return;
        }

        console.error(
          'Unable to load authenticated user:',
          error,
        );

        setSessionReady(true);
      }
    };

    void loadAuthenticatedUser();

    return () => {
      controller.abort();
    };
  }, []);

  /*
   * Save the visible conversation in sessionStorage.
   *
   * This preserves the current conversation across refreshes.
   * Database-backed chat history will replace this later.
   */
  useEffect(() => {
    window.sessionStorage.setItem(
      MESSAGE_STORAGE_KEY,
      JSON.stringify(messages),
    );
  }, [messages]);

  /*
   * Automatically scroll to the newest message.
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [messages, loading]);

  /**
   * Send the user's message to the authenticated AI Gateway.
   */
  const askApexTrainer = async () => {
    const userQuestion = question.trim();

    if (!userQuestion || loading) {
      return;
    }

    const userMessage =
      createMessage('user', userQuestion);

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setQuestion('');
    setLoading(true);

    const controller = new AbortController();

    const timeoutId = window.setTimeout(
      () => controller.abort(),
      120000,
    );

    try {
      const conversationId =
        getOrCreateConversationId();

      const response = await fetch(
        '/api/ai/chat',
        {
          method: 'POST',

          /*
           * Send the Better Auth cookie to the Gateway.
           * The authenticated user identity is resolved
           * by the backend, never trusted from the browser.
           */
          credentials: 'include',

          headers: {
            'Content-Type': 'application/json',
          },

          signal: controller.signal,

          body: JSON.stringify({
            message: userQuestion,
            conversation_id: conversationId,
          }),
        },
      );

      const data = (await response
        .json()
        .catch(() => ({}))) as GatewayResponse;

      let assistantText = '';

      if (response.status === 401) {
        assistantText =
          'Your session has expired. Please sign in again.';
      } else if (response.status === 429) {
        assistantText =
          data.detail ??
          'You’re sending messages a little too quickly. Please wait a moment and try again.';
      } else if (!response.ok) {
        assistantText =
          data.detail ??
          'I couldn’t complete that request right now. Please try again.';
      } else if (!data.answer) {
        assistantText =
          'I didn’t receive a readable response. Please try again.';
      } else {
        assistantText = data.answer;
      }

      setMessages((current) => [
        ...current,
        createMessage(
          'assistant',
          assistantText,
        ),
      ]);
    } catch (error) {
      let assistantText =
        'I couldn’t connect to APEXTrainer right now. Please try again.';

      if (
        error instanceof DOMException &&
        error.name === 'AbortError'
      ) {
        assistantText =
          'That request took too long. Please try again.';
      } else {
        console.error(
          'APEXTrainer AI Gateway error:',
          error,
        );
      }

      setMessages((current) => [
        ...current,
        createMessage(
          'assistant',
          assistantText,
        ),
      ]);
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  /**
   * Enter sends the message.
   * Shift + Enter inserts a new line.
   */
  const handleKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey
    ) {
      event.preventDefault();
      void askApexTrainer();
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-13rem)] w-full max-w-5xl flex-col px-4 py-6 md:px-6">
      {/* Chat header */}
      <div className="mb-4 flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border bg-muted/40">
            <Bot className="h-6 w-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold md:text-2xl">
                APEXTrainer Coach
              </h1>

              <span className="hidden rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 sm:inline">
                Online
              </span>
            </div>

            <p className="text-sm text-muted-foreground">
              Your personal fitness assistant
            </p>
          </div>
        </div>

        <Sparkles className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* Conversation area */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-background">
        <div className="flex-1 space-y-5 overflow-y-auto p-4 md:p-6">
          {/* Friendly first message */}
          {messages.length === 0 && (
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <Bot className="h-4 w-4" />
              </div>

              <div className="max-w-[85%] md:max-w-[70%]">
                <div className="rounded-2xl rounded-tl-md bg-muted px-4 py-3">
                  <p className="text-sm leading-6">
                    {sessionReady
                      ? `Hi ${displayName}! I’m your APEXTrainer coach. Ask me about your workouts, nutrition, progress, or goals.`
                      : 'Loading your ApexTrainer account...'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => {
            const isUser =
              message.role === 'user';

            return (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  isUser
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                {!isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] md:max-w-[72%] ${
                    isUser
                      ? 'items-end'
                      : 'items-start'
                  } flex flex-col`}
                >
                  <div
                    className={
                      isUser
                        ? 'rounded-2xl rounded-tr-md bg-primary px-4 py-3 text-primary-foreground'
                        : 'rounded-2xl rounded-tl-md bg-muted px-4 py-3'
                    }
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap text-sm leading-6">
                        {message.content}
                      </p>
                    ) : (
                      <div className="prose prose-sm max-w-none break-words dark:prose-invert [&_h1]:mb-2 [&_h1]:mt-3 [&_h2]:mb-2 [&_h2]:mt-3 [&_h3]:mb-2 [&_h3]:mt-3 [&_li]:my-1 [&_p]:my-2">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>

                  <div className="mt-1 flex items-center gap-1.5 px-1 text-[11px] text-muted-foreground">
                    <Clock3 className="h-3 w-3" />

                    <span>
                      {formatMessageTime(
                        message.createdAt,
                      )}
                    </span>
                  </div>
                </div>

                {isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <UserRound className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Thinking indicator */}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <Bot className="h-4 w-4" />
              </div>

              <div>
                <div className="rounded-2xl rounded-tl-md bg-muted px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground/70" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground/70 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground/70 [animation-delay:300ms]" />
                  </div>
                </div>

                <p className="mt-1 px-1 text-[11px] text-muted-foreground">
                  APEXTrainer is thinking...
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message composer */}
        <div className="border-t bg-background p-3 md:p-4">
          <div className="flex items-end gap-2 rounded-xl border bg-muted/20 p-2 focus-within:ring-1 focus-within:ring-ring">
            <textarea
              className="max-h-40 min-h-[44px] flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:outline-none"
              value={question}
              onChange={(event) =>
                setQuestion(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Ask about your workouts, food, progress, goals..."
              disabled={loading}
              rows={1}
            />

            <Button
              size="icon"
              className="h-10 w-10 shrink-0 rounded-lg"
              onClick={() =>
                void askApexTrainer()
              }
              disabled={
                loading ||
                !question.trim()
              }
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Press Enter to send • Shift + Enter for a new line
          </p>
        </div>
      </div>
    </div>
  );
}
