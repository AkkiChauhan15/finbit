import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import HabitTracker from '../pages/HabitTracker.jsx';

const apiMocks = vi.hoisted(() => ({
  completeHabit: vi.fn(),
  createHabit: vi.fn(),
  deleteHabit: vi.fn(),
  getHabitSummary: vi.fn(),
  updateHabit: vi.fn(),
}));

vi.mock('../api/client.js', () => ({ api: apiMocks }));

const history = Array.from({ length: 30 }, (_, index) => ({
  date: new Date(Date.UTC(2026, 6, 21 + index)).toISOString().slice(0, 10),
  status: index === 29 ? 'pending' : 'missed',
}));

const pendingHabit = {
  _id: 'habit-1',
  name: 'Review daily spending',
  type: 'budgeting',
  frequency: 'daily',
  currentStreak: 2,
  longestStreak: 5,
  completionRate: 40,
  isCurrentPeriodComplete: false,
  history,
};

describe('Habit Tracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.getHabitSummary.mockResolvedValueOnce({ habits: [pendingHabit] }).mockResolvedValue({
      habits: [
        {
          ...pendingHabit,
          currentStreak: 3,
          isCurrentPeriodComplete: true,
          history: history.map((day, index) =>
            index === 29 ? { ...day, status: 'completed' } : day,
          ),
        },
      ],
    });
    apiMocks.completeHabit.mockResolvedValue({ alreadyCompleted: false });
  });

  test('marks the current habit period complete and refreshes its status', async () => {
    const user = userEvent.setup();
    render(<HabitTracker />);

    expect(await screen.findByText('Review daily spending')).toBeInTheDocument();
    expect(screen.getByText('Reminder: due today')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Mark done today' }));

    expect(apiMocks.completeHabit).toHaveBeenCalledWith('habit-1');
    expect(await screen.findByText('Completed today')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Done today' })).toBeDisabled();
  });
});
