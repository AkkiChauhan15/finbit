import { env } from '../config/env.js';

const LLM_TIMEOUT_MS = 30000;

export const isLlmConfigured = () => Boolean(env.llmBaseUrl && env.llmApiKey && env.llmModel);

export const callLlm = async (system, userMessage) => {
  const baseUrl = env.llmBaseUrl.replace(/\/$/, '');
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.llmApiKey}`,
    },
    body: JSON.stringify({
      model: env.llmModel,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.4,
    }),
    signal: AbortSignal.timeout(LLM_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`LLM request failed with status ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('LLM response missing content');
  }

  return content.trim();
};
