import { useState } from 'react';

import { api } from '../api/client.js';

const SUGGESTED_QUESTIONS = [
  'How can I save more this month?',
  'Am I overspending in any category?',
  'What should I watch out for next month?',
];

function Assistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const sendMessage = async (message) => {
    const trimmed = message.trim();

    if (!trimmed || isSending) {
      return;
    }

    setMessages((current) => [...current, { role: 'user', content: trimmed }]);
    setInput('');
    setError('');
    setIsSending(true);

    try {
      const result = await api.assistantChat(trimmed);
      setMessages((current) => [
        ...current,
        { role: 'assistant', content: result.reply, source: result.source },
      ]);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSending(false);
    }
  };

  const onSubmit = (event) => {
    event.preventDefault();
    void sendMessage(input);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-sm font-semibold text-[#007a2a]">AI financial assistant</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#161d19] sm:text-4xl">
          Assistant
        </h1>
        <p className="mt-3 max-w-2xl text-[#536158]">
          Ask about your spending, savings, and habits. Finbit gives general guidance, not licensed
          financial advice.
        </p>
      </header>

      <section className="rounded-2xl border border-[#cbd7ce] bg-white p-5 shadow-soft sm:p-6">
        {messages.length === 0 ? (
          <div className="py-6">
            <p className="text-sm font-medium text-[#26352c]">Try asking</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => void sendMessage(question)}
                  className="rounded-full border border-[#b9c8bd] px-4 py-2 text-sm text-[#35443a] transition hover:bg-[#e8f0e9]"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4" aria-label="Conversation">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                    message.role === 'user'
                      ? 'bg-[#00bc44] text-[#003e14]'
                      : 'bg-[#f4fbf4] text-[#26352c]'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isSending && <p className="text-sm text-[#6c7a71]">Finbit is thinking…</p>}
          </div>
        )}

        {error && (
          <p
            className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-[#a43a3a]"
            role="alert"
          >
            {error}
          </p>
        )}

        <form onSubmit={onSubmit} className="mt-6 flex items-end gap-3">
          <label className="min-w-0 flex-1 text-sm font-medium text-[#26352c]">
            <span className="sr-only">Ask a question</span>
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about your finances…"
              maxLength={500}
              className="mt-2 w-full rounded-lg border border-[#b9c8bd] bg-[#f4fbf4] px-3 py-2.5 text-[#161d19] outline-none focus:border-emerald-500"
            />
          </label>
          <button
            type="submit"
            disabled={isSending || !input.trim()}
            className="primary-button text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            Send
          </button>
        </form>
      </section>

      <p className="text-center text-xs text-[#6c7a71]">
        Finbit provides general education, not personalized investment advice.
      </p>
    </div>
  );
}

export default Assistant;
