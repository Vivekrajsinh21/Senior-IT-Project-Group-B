import {
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Bot,
  Clock3,
  Menu,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Button } from '@/components/ui/button';

interface GatewayResponse {
  answer?: string;
  detail?: string;
  conversation_id?: string;
}

interface SessionUser {
  id?: string;
  name?: string | null;
  email?: string | null;
}

interface SessionResponse {
  user?: SessionUser;
  data?: {
    user?: SessionUser;
  };
  id?: string;
  name?: string | null;
  email?: string | null;
}

type ChatRole = 'user' | 'assistant';

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

interface ApiMessage {
  id: string;
  role: ChatRole;
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ConversationsResponse {
  conversations?: Conversation[];
}

interface MessagesResponse {
  conversation_id?: string;
  messages?: ApiMessage[];
}

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

function getDisplayName(user: SessionUser): string {
  const savedName = user.name?.trim();

  if (savedName) {
    return savedName.split(/\s+/)[0] || savedName;
  }

  const emailName =
    user.email?.split('@')[0]?.trim();

  return emailName || 'there';
}

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

function createLocalMessage(
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

function getConversationGroup(
  isoTimestamp: string,
): 'Today' | 'Yesterday' | 'Previous chats' {
  const date = new Date(isoTimestamp);
  const now = new Date();

  const startToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const startYesterday = new Date(startToday);
  startYesterday.setDate(
    startYesterday.getDate() - 1,
  );

  if (date >= startToday) {
    return 'Today';
  }

  if (date >= startYesterday) {
    return 'Yesterday';
  }

  return 'Previous chats';
}

export default function APEXTrainer() {
  const [question, setQuestion] =
    useState('');

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [conversations, setConversations] =
    useState<Conversation[]>([]);

  const [
    activeConversationId,
    setActiveConversationId,
  ] = useState<string>(() => uuidv4());

  const [loading, setLoading] =
    useState(false);

  const [historyLoading, setHistoryLoading] =
    useState(true);

  const [displayName, setDisplayName] =
    useState('there');

  const [sessionReady, setSessionReady] =
    useState(false);

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  /*
   * Load the authenticated ApexTrainer user.
   *
   * The frontend does not choose or send a user ID.
   * Better Auth determines the real authenticated user.
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
          setSessionReady(true);
          return;
        }

        const sessionData =
          (await response.json()) as
            | SessionResponse
            | null;

        const user =
          extractAuthenticatedUser(sessionData);

        if (user?.id) {
          setDisplayName(
            getDisplayName(user),
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

    return () => controller.abort();
  }, []);

  /*
   * Load only the conversations owned by the
   * currently authenticated user.
   */
  const loadConversations = async (
    selectNewest = false,
  ) => {
    try {
      const response = await fetch(
        '/api/ai/conversations',
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          `History request failed: ${response.status}`,
        );
      }

      const data =
        (await response.json()) as ConversationsResponse;

      const history =
        data.conversations ?? [];

      setConversations(history);

      if (
        selectNewest &&
        history.length > 0
      ) {
        setActiveConversationId(
          history[0].id,
        );
      }
    } catch (error) {
      console.error(
        'Unable to load chat history:',
        error,
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (!sessionReady) {
      return;
    }

    void loadConversations();
  }, [sessionReady]);

  /*
   * Scroll to the newest message.
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [messages, loading]);

  /*
   * Start a fresh conversation.
   *
   * The conversation is not stored in PostgreSQL
   * until the user actually sends the first message.
   */
  const startNewChat = () => {
    setActiveConversationId(uuidv4());
    setMessages([]);
    setQuestion('');
    setSidebarOpen(false);
  };

  /*
   * Load a saved conversation from PostgreSQL.
   */
  const openConversation = async (
    conversationId: string,
  ) => {
    if (loading) {
      return;
    }

    try {
      setHistoryLoading(true);

      const response = await fetch(
        `/api/ai/conversations/${conversationId}/messages`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          `Message history request failed: ${response.status}`,
        );
      }

      const data =
        (await response.json()) as MessagesResponse;

      const restoredMessages: ChatMessage[] =
        (data.messages ?? []).map(
          (message) => ({
            id: message.id,
            role: message.role,
            content: message.content,
            createdAt: message.created_at,
          }),
        );

      setActiveConversationId(
        conversationId,
      );

      setMessages(restoredMessages);
      setSidebarOpen(false);
    } catch (error) {
      console.error(
        'Unable to load conversation:',
        error,
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  /*
   * Delete a conversation.
   *
   * The backend checks ownership using the
   * authenticated session before deleting it.
   */
  const removeConversation = async (
    conversationId: string,
  ) => {
    try {
      const response = await fetch(
        `/api/ai/conversations/${conversationId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        },
      );

      if (!response.ok) {
        throw new Error(
          `Delete request failed: ${response.status}`,
        );
      }

      setConversations((current) =>
        current.filter(
          (conversation) =>
            conversation.id !== conversationId,
        ),
      );

      if (
        activeConversationId ===
        conversationId
      ) {
        startNewChat();
      }
    } catch (error) {
      console.error(
        'Unable to delete conversation:',
        error,
      );
    }
  };

  /*
   * Send a chat message through the authenticated
   * ApexTrainer AI Gateway.
   */
  const askApexTrainer = async () => {
    const userQuestion =
      question.trim();

    if (!userQuestion || loading) {
      return;
    }

    const userMessage =
      createLocalMessage(
        'user',
        userQuestion,
      );

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setQuestion('');
    setLoading(true);

    const controller =
      new AbortController();

    const timeoutId =
      window.setTimeout(
        () => controller.abort(),
        120000,
      );

    try {
      const response = await fetch(
        '/api/ai/chat',
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type':
              'application/json',
          },
          signal: controller.signal,

          /*
           * No user_id is sent.
           *
           * The Gateway verifies the login cookie and
           * associates this conversation with the
           * authenticated user on the server.
           */
          body: JSON.stringify({
            message: userQuestion,
            conversation_id:
              activeConversationId,
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
          'You’re sending messages a little too quickly. Please wait a moment.';
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
        createLocalMessage(
          'assistant',
          assistantText,
        ),
      ]);

      /*
       * A successful chat request creates or updates
       * the PostgreSQL conversation. Refresh the
       * sidebar so its title and timestamp appear.
       */
      if (response.ok) {
        await loadConversations();
      }
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
        createLocalMessage(
          'assistant',
          assistantText,
        ),
      ]);
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  };

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

  const groups = [
    'Today',
    'Yesterday',
    'Previous chats',
  ] as const;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-7xl gap-4 px-4 py-5 md:px-6">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close chat history"
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* Chat history sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r bg-background p-3 transition-transform md:static md:z-auto md:w-64 md:shrink-0 md:translate-x-0 md:rounded-xl md:border ${
          sidebarOpen
            ? 'translate-x-0'
            : '-translate-x-full'
        }`}
      >
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="font-semibold">
              Chat History
            </p>

            <p className="text-xs text-muted-foreground">
              Your conversations
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() =>
              setSidebarOpen(false)
            }
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="outline"
          className="mb-4 w-full justify-start gap-2"
          onClick={startNewChat}
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>

        <div className="flex-1 overflow-y-auto">
          {historyLoading &&
            conversations.length === 0 && (
              <p className="px-2 py-4 text-sm text-muted-foreground">
                Loading conversations...
              </p>
            )}

          {!historyLoading &&
            conversations.length === 0 && (
              <div className="px-2 py-8 text-center">
                <MessageSquare className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />

                <p className="text-sm font-medium">
                  No chat history yet
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Your conversations will appear here.
                </p>
              </div>
            )}

          {groups.map((group) => {
            const groupConversations =
              conversations.filter(
                (conversation) =>
                  getConversationGroup(
                    conversation.updated_at,
                  ) === group,
              );

            if (
              groupConversations.length === 0
            ) {
              return null;
            }

            return (
              <div
                key={group}
                className="mb-5"
              >
                <p className="mb-1 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {group}
                </p>

                <div className="space-y-1">
                  {groupConversations.map(
                    (conversation) => {
                      const isActive =
                        conversation.id ===
                        activeConversationId;

                      return (
                        <div
                          key={
                            conversation.id
                          }
                          className={`group flex items-center rounded-lg ${
                            isActive
                              ? 'bg-muted'
                              : 'hover:bg-muted/60'
                          }`}
                        >
                          <button
                            type="button"
                            className="min-w-0 flex-1 px-3 py-2 text-left"
                            onClick={() =>
                              void openConversation(
                                conversation.id,
                              )
                            }
                          >
                            <p className="truncate text-sm font-medium">
                              {
                                conversation.title
                              }
                            </p>

                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                              {formatMessageTime(
                                conversation.updated_at,
                              )}
                            </p>
                          </button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="mr-1 h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100"
                            aria-label="Delete conversation"
                            onClick={() =>
                              void removeConversation(
                                conversation.id,
                              )
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main chat */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              onClick={() =>
                setSidebarOpen(true)
              }
            >
              <Menu className="h-4 w-4" />
            </Button>

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

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-background">
          {/* Messages */}
          <div className="flex-1 space-y-5 overflow-y-auto p-4 md:p-6">
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
                    className={`flex max-w-[85%] flex-col md:max-w-[72%] ${
                      isUser
                        ? 'items-end'
                        : 'items-start'
                    }`}
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
                            remarkPlugins={[
                              remarkGfm,
                            ]}
                          >
                            {
                              message.content
                            }
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

            {/* Typing indicator */}
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

          {/* Composer */}
          <div className="border-t bg-background p-3 md:p-4">
            <div className="flex items-end gap-2 rounded-xl border bg-muted/20 p-2 focus-within:ring-1 focus-within:ring-ring">
              <textarea
                className="max-h-40 min-h-[44px] flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
                value={question}
                onChange={(event) =>
                  setQuestion(
                    event.target.value,
                  )
                }
                onKeyDown={
                  handleKeyDown
                }
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
      </main>
    </div>
  );
}
