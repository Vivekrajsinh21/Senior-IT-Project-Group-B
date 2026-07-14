import { useState } from 'react';
import { Bot, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useActiveUser } from '@/contexts/ActiveUserContext';

const LANGFLOW_URL =
  'https://langflow.apextrainer.duckdns.org/api/v1/run/apextrainer-fitness-rag?stream=false';

// Demo only: do not commit a real API key to GitHub.
// For production, move this key to the backend .env and call /api/ai/chat instead.
const LANGFLOW_API_KEY = 'lf_83db394c39afef523a299458b0c81b5bdd05770478bdcc521c593a362229ccfa';

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

export default function APEXTrainer() {
  const [question, setQuestion] = useState('search nutrition of banana');
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

    const { activeUserId } = useActiveUser();

    try {
      const sessionId = `user-id-${activeUserId}-${Date.now()}`;

      const response = await fetch(LANGFLOW_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': LANGFLOW_API_KEY,
        },
        body: JSON.stringify({
          output_type: 'chat',
          input_type: 'chat',
          input_value: userQuestion,
          session_id: sessionId,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage =
          data?.detail ||
          data?.message ||
          data?.error ||
          `Langflow request failed with status ${response.status}`;

        setAnswer(`Langflow error: ${errorMessage}`);
        return;
      }

      const text = getLangflowMessage(data);

      if (!text) {
        setAnswer('No response from APEXTrainer.');
        return;
      }

      setAnswer(String(text));
    } catch (error) {
      console.error('APEXTrainer connection error:', error);
      setAnswer('Failed to connect to Langflow.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center gap-3">
        <Bot className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">APEXTrainer AI Assistant</h1>
          <p className="text-muted-foreground">
            Powered by Langflow Agent + USDA API
          </p>
        </div>
      </div>

      <textarea
        className="min-h-32 w-full rounded-md border bg-background p-3"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask ApexTrainer anything..."
        disabled={loading}
      />

      <Button
        className="mt-4 flex items-center gap-2"
        onClick={askApexTrainer}
        disabled={loading}
      >
        <Send className="h-4 w-4" />
        {loading ? 'Thinking...' : 'Ask APEXTrainer'}
      </Button>

      {answer && (
        <div className="mt-6 whitespace-pre-wrap rounded-md border bg-muted/30 p-4">
          {answer}
        </div>
      )}
    </div>
  );
}