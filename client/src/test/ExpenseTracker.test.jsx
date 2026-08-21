import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { AuthContext } from '../auth/AuthContext.js';
import ExpenseTracker from '../pages/ExpenseTracker.jsx';

const apiMocks = vi.hoisted(() => ({
  createExpense: vi.fn(),
  createIncome: vi.fn(),
  deleteExpense: vi.fn(),
  deleteIncome: vi.fn(),
  getExpenseSummary: vi.fn(),
  getExpenses: vi.fn(),
  getIncome: vi.fn(),
  getMonthlyReport: vi.fn(),
  updateExpense: vi.fn(),
  updateIncome: vi.fn(),
}));

vi.mock('../api/client.js', () => ({ api: apiMocks }));
vi.mock('../components/transactions/CategoryBreakdownChart.jsx', () => ({
  default: () => <div>Category chart</div>,
}));
vi.mock('../components/transactions/MonthlyReportChart.jsx', () => ({
  default: () => <div>Monthly chart</div>,
}));

const expenseRecord = {
  _id: 'expense-1',
  category: 'food',
  amount: 45,
  date: '2026-08-19T00:00:00.000Z',
  notes: 'Groceries',
  createdAt: '2026-08-19T10:00:00.000Z',
};

describe('Expense Tracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.getIncome.mockResolvedValue({ income: [] });
    apiMocks.getExpenses
      .mockResolvedValueOnce({ expenses: [] })
      .mockResolvedValue({ expenses: [expenseRecord] });
    apiMocks.getExpenseSummary.mockResolvedValue({ summary: [], total: 0 });
    apiMocks.getMonthlyReport.mockResolvedValue({ months: [] });
    apiMocks.createExpense.mockResolvedValue({ expense: expenseRecord });
    apiMocks.updateExpense.mockResolvedValue({
      expense: { ...expenseRecord, amount: 60, notes: 'Weekly groceries' },
    });
  });

  test('adds an expense and opens the same transaction in edit mode', async () => {
    const user = userEvent.setup();
    render(
      <AuthContext.Provider value={{ user: { financialProfile: { currency: 'USD' } } }}>
        <ExpenseTracker />
      </AuthContext.Provider>,
    );

    expect(await screen.findByText('No transactions yet.')).toBeInTheDocument();
    const addExpenseSection = screen
      .getByRole('heading', { name: 'Add expense' })
      .closest('section');
    const addForm = within(addExpenseSection);

    await user.selectOptions(addForm.getByLabelText('Category'), 'food');
    await user.type(addForm.getByLabelText('Amount'), '45');
    await user.type(addForm.getByLabelText(/Notes/), 'Groceries');
    await user.click(addForm.getByRole('button', { name: 'Add expense' }));

    expect(apiMocks.createExpense).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'food', amount: 45, notes: 'Groceries' }),
    );
    expect(await screen.findByText('Groceries')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    const editExpenseSection = screen
      .getByRole('heading', { name: 'Edit expense' })
      .closest('section');
    const editForm = within(editExpenseSection);
    await user.clear(editForm.getByLabelText('Amount'));
    await user.type(editForm.getByLabelText('Amount'), '60');
    await user.clear(editForm.getByLabelText(/Notes/));
    await user.type(editForm.getByLabelText(/Notes/), 'Weekly groceries');
    await user.click(editForm.getByRole('button', { name: 'Update expense' }));

    expect(apiMocks.updateExpense).toHaveBeenCalledWith(
      'expense-1',
      expect.objectContaining({ amount: 60, notes: 'Weekly groceries' }),
    );
  });
});
