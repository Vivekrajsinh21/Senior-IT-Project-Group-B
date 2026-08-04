import { useEffect, useState } from 'react';
import { Bot, Send } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';

const CONVERSATION_STORAGE_KEY =
  'apextrainer:ai-conversation-id';

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

function extractAuthenticatedUser(
  sessionData: SessionResponse | null,
): SessionUser | null {
  if (!sessionData) {
    return null;
  }

  /*
   * Normal Better Auth response:
   * {
   *   session: {...},
   *   user: {
   *     id: "...",
   *     name: "...",
   *     email: "..."
   *   }
   * }
   */
  if (sessionData.user) {
    return sessionData.user;
  }

  /*
   * Support an API response wrapped inside "data".
   */
  if (sessionData.data?.user) {
    return sessionData.data.user;
  }

  /*
   * Support an endpoint that returns the user object directly.
   */
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
    /*
     * Use the first part of the saved name.
     * Example: "Vivek Raj" becomes "Vivek".
     */
    return savedName.split(/\s+/)[0] || savedName;
  }

  const emailName = user.email
    ?.split('@')[0]
    ?.trim();

  if (emailName) {
    return emailName;
  }

  return 'there';
}

export default function APEXTrainer() {
  const [question, setQuestion] =
    useState('context check');

  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const [welcomeMessage, setWelcomeMessage] =
    useState(
      'Checking your authenticated ApexTrainer account...',
    );

  /*
   * Load the currently logged-in user when this page opens.
   *
   * The frontend does not send or choose a user ID.
   * Better Auth maps the login cookie to the real user record
   * and returns the verified user's ID and name.
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
            setWelcomeMessage(
              'Please sign in to use your personal ApexTrainer coach.',
            );
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

        if (!authenticatedUser?.id) {
          setWelcomeMessage(
            'Please sign in to use your personal ApexTrainer coach.',
          );
          return;
        }

        /*
         * The ID has already been mapped to the user record
         * by Better Auth. We use the verified user's saved name.
         */
        const displayName =
          getDisplayName(authenticatedUser);

        setWelcomeMessage(
          `Hi ${displayName}! I’m your APEXTrainer coach. ` +
            'How can I help you today?',
        );
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

        setWelcomeMessage(
          'Hi! I’m your APEXTrainer coach. ' +
            'How can I help you today?',
        );
      }
    };

    void loadAuthenticatedUser();

    return () => {
      controller.abort();
    };
  }, []);

  const askApexTrainer = async () => {
    const userQuestion = question.trim();

    if (!userQuestion) {
      setAnswer('Please enter a question first.');
      return;
    }

    setLoading(true);
    setAnswer('');

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
           * Send the Better Auth session cookie
           * to the authenticated AI Gateway.
           */
          credentials: 'include',

          headers: {
            'Content-Type': 'application/json',
          },

          signal: controller.signal,

          /*
           * Do not send user_id from the frontend.
           * The AI Gateway gets the real user ID
           * from the verified login session.
           */
          body: JSON.stringify({
            message: userQuestion,
            conversation_id: conversationId,
          }),
        },
      );

      const data = (await response
        .json()
        .catch(() => ({}))) as GatewayResponse;

      if (response.status === 401) {
        setAnswer(
          'Your login session has expired. ' +
            'Please sign in again.',
        );
        return;
      }

      if (response.status === 429) {
        setAnswer(
          data.detail ??
            'Too many requests. ' +
              'Please wait and try again.',
        );
        return;
      }

      if (!response.ok) {
        setAnswer(
          data.detail ??
            `AI Gateway request failed with status ${response.status}.`,
        );
        return;
      }

      if (!data.answer) {
        setAnswer(
          'The AI Gateway returned no readable answer.',
        );
        return;
      }

      setAnswer(data.answer);
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === 'AbortError'
      ) {
        setAnswer(
          'The AI request timed out. ' +
            'Please try again.',
        );
        return;
      }

      console.error(
        'APEXTrainer AI Gateway error:',
        error,
      );

      setAnswer(
        'Failed to connect to the APEXTrainer AI service.',
      );
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center gap-3">
        <Bot className="h-8 w-8" />

        <div>
          <h1 className="text-3xl font-bold">
            APEXTrainer AI Assistant
          </h1>

          <p className="text-muted-foreground">
            Authenticated AI fitness assistant
          </p>
        </div>
      </div>

      <div className="mb-4 rounded-md border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <Bot className="mt-0.5 h-5 w-5 shrink-0" />

          <p className="text-sm">
            {welcomeMessage}
          </p>
        </div>
      </div>

      <textarea
        className="min-h-32 w-full rounded-md border bg-background p-3"
        value={question}
        onChange={(event) =>
          setQuestion(event.target.value)
        }
        placeholder="Ask ApexTrainer anything..."
        disabled={loading}
      />

      <Button
        className="mt-4 flex items-center gap-2"
        onClick={askApexTrainer}
        disabled={loading}
      >
        <Send className="h-4 w-4" />

        {loading
          ? 'Thinking...'
          : 'Ask APEXTrainer'}
      </Button>

      {answer && (
        <div className="mt-6 whitespace-pre-wrap rounded-md border bg-muted/30 p-4">
          {answer}
        </div>
      )}
    </div>
  );
}