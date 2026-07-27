import { useState } from 'react';
import { Bot, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useActiveUser } from '@/contexts/ActiveUserContext';

/*
 * Copy the exact URL from:
 * Langflow → Share → API Access
 *
 * Example:
 * https://langflow.apextrainer.duckdns.org/api/v1/run/<FLOW_ID>?stream=false
 */
const LANGFLOW_URL =
  import.meta.env.VITE_LANGFLOW_URL?.trim() ?? '';

/*
 * Demo only:
 * VITE environment variables are included in the browser bundle.
 * For production, the Langflow request should be moved to the backend.
 */
const LANGFLOW_API_KEY =
  import.meta.env.VITE_LANGFLOW_API_KEY?.trim() ?? '';

/*
 * Component ID shown in Langflow API Access.
 */
const USER_CONTEXT_COMPONENT_ID =
  'CustomComponent-M3tu3';

function getLangflowMessage(data: any): string {
  return (
    data?.outputs?.[0]?.outputs?.[0]?.results?.message?.text ||
    data?.outputs?.[0]?.outputs?.[0]?.results?.message?.data?.text ||
    data?.outputs?.[0]?.outputs?.[0]?.artifacts?.message ||
    data?.outputs?.[0]?.outputs?.[0]?.outputs?.message?.message?.text ||
    data?.message ||
    data?.text ||
    ''
  );
}

function getLangflowError(data: any, status: number): string {
  const error =
    data?.detail ??
    data?.message ??
    data?.error;

  if (typeof error === 'string') {
    return error;
  }

  if (error) {
    try {
      return JSON.stringify(error);
    } catch {
      // Use the fallback error message below.
    }
  }

  return `Langflow request failed with status ${status}`;
}

/*
 * The same user keeps the same session while using
 * the current browser tab.
 *
 * Closing the tab creates a new conversation session.
 */
function getOrCreateLangflowSessionId(
  userId: string,
): string {
  const storageKey =
    `apextrainer:langflow-session:${userId}`;

  const existingSession =
    window.sessionStorage.getItem(storageKey);

  if (existingSession) {
    return existingSession;
  }

  const randomPart =
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`;

  const newSessionId =
    `apextrainer:${userId}:${randomPart}`;

  window.sessionStorage.setItem(
    storageKey,
    newSessionId,
  );

  return newSessionId;
}

export default function APEXTrainer() {
  const { activeUserId } = useActiveUser();

  /*
   * Use "context check" while testing the User Context component.
   * You can change this later.
   */
  const [question, setQuestion] =
    useState('context check');

  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const askApexTrainer = async () => {
    const userQuestion = question.trim();

    if (!userQuestion) {
      setAnswer('Please enter a question first.');
      return;
    }

    if (
      activeUserId === null ||
      activeUserId === undefined ||
      String(activeUserId).trim() === ''
    ) {
      setAnswer(
        'No active user was found. Please log in or select a user first.',
      );
      return;
    }

    if (!LANGFLOW_URL) {
      setAnswer(
        'Langflow URL is not configured. Add VITE_LANGFLOW_URL to the frontend environment file.',
      );
      return;
    }

    if (!LANGFLOW_API_KEY) {
      setAnswer(
        'Langflow API key is not configured. Add VITE_LANGFLOW_API_KEY to the frontend environment file.',
      );
      return;
    }

    setLoading(true);
    setAnswer('');

    try {
      const activeUserIdString =
        String(activeUserId);

      /*
       * Same user + same browser tab = same chat session.
       */
      const sessionId =
        getOrCreateLangflowSessionId(
          activeUserIdString,
        );

      const requestBody = {
        input_value: userQuestion,
        input_type: 'chat',
        output_type: 'chat',

        /*
         * Used by Langflow message history and memory.
         */
        session_id: sessionId,

        /*
         * Runtime parameters passed to:
         * CustomComponent-M3tu3
         */
        tweaks: {
          [USER_CONTEXT_COMPONENT_ID]: {
            apextrainer_user_id:
              activeUserIdString,

            langflow_session_id:
              sessionId,
          },
        },
      };

      console.log('Sending Langflow request:', {
        input_value: userQuestion,
        session_id: sessionId,
        apextrainer_user_id:
          activeUserIdString,
        component_id:
          USER_CONTEXT_COMPONENT_ID,
      });

      const response = await fetch(
        LANGFLOW_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': LANGFLOW_API_KEY,
          },
          body: JSON.stringify(requestBody),
        },
      );

      const responseText =
        await response.text();

      let data: any = null;

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          data = {
            text: responseText,
          };
        }
      }

      if (!response.ok) {
        const errorMessage =
          getLangflowError(
            data,
            response.status,
          );

        setAnswer(
          `Langflow error: ${errorMessage}`,
        );
        return;
      }

      const text =
        getLangflowMessage(data);

      if (!text) {
        console.warn(
          'Unexpected Langflow response:',
          data,
        );

        setAnswer(
          'Langflow completed the request but returned no readable message.',
        );
        return;
      }

      setAnswer(String(text));
    } catch (error) {
      console.error(
        'APEXTrainer connection error:',
        error,
      );

      setAnswer(
        'Failed to connect to the APEXTrainer AI service.',
      );
    } finally {
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
            Powered by Langflow Agent + ApexTrainer APIs
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