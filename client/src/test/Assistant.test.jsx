import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import Assistant from '../pages/Assistant.jsx';

const apiMocks = vi.hoisted(() => ({ assistantChat: vi.fn() }));

vi.mock('../api/client.js', () => ({ api: apiMocks }));

describe('Assistant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('sends a typed message and renders the reply', async () => {
    apiMocks.assistantChat.mockResolvedValue({
      reply: 'Save 20% of your income.',
      source: 'rules',
    });
    const user = userEvent.setup();
    render(<Assistant />);

    await user.type(screen.getByLabelText('Ask a question'), 'How can I save more?');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(apiMocks.assistantChat).toHaveBeenCalledWith('How can I save more?');
    expect(await screen.findByText('Save 20% of your income.')).toBeInTheDocument();
  });

  test('sends a suggested question when clicked', async () => {
    apiMocks.assistantChat.mockResolvedValue({ reply: 'Good job.', source: 'rules' });
    const user = userEvent.setup();
    render(<Assistant />);

    await user.click(screen.getByRole('button', { name: 'How can I save more this month?' }));

    expect(apiMocks.assistantChat).toHaveBeenCalledWith('How can I save more this month?');
    expect(await screen.findByText('Good job.')).toBeInTheDocument();
  });
});
