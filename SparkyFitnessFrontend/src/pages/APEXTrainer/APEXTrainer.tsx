import { useState } from 'react';
import { Bot, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LANGFLOW_URL =
  'https://langflow.apextrainer.duckdns.org/api/v1/run/23d67d60-5dff-4cc8-95f1-b6b16184f9a2?stream=false';

const LANGFLOW_API_KEY = 'sk-oY6MYkUvGePZkp8-v25JHqboFX3JdBR6uRGerRZhGUI';

export default function APEXTrainer() {
  const [question, setQuestion] = useState('search nutrition of banana');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const askApexTrainer = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer('');

    try {
      const response = await fetch(LANGFLOW_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': LANGFLOW_API_KEY,
        },
        body: JSON.stringify({
          output_type: 'chat',
          input_type: 'chat',
          input_value: question,
          session_id: `apextrainer-${Date.now()}`,
        }),
      });

      const data = await response.json();

      const text =
        data?.outputs?.[0]?.outputs?.[0]?.results?.message?.text ||
        data?.outputs?.[0]?.outputs?.[0]?.artifacts?.message ||
        'No response from APEXTrainer.';

      setAnswer(String(text));
    } catch {
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
