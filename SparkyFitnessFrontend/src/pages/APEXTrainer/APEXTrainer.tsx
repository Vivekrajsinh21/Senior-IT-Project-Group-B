import { useState } from 'react';
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

export default function APEXTrainer() {
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
           * to the same-origin backend.
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

      if (response.status === 401) {
        setAnswer(
          'Your login session has expired. Please sign in again.',
        );
        return;
      }

      if (response.status === 429) {
        setAnswer(
          data.detail ??
            'Too many requests. Please wait and try again.',
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
          'The AI request timed out. Please try again.',
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