import { useCallback, useMemo, useState, useEffect } from 'react';

import { api } from '../api/client.js';
import CategoryBreakdownChart from '../components/transactions/CategoryBreakdownChart.jsx';
import ExpenseForm from '../components/transactions/ExpenseForm.jsx';
import IncomeForm from '../components/transactions/IncomeForm.jsx';
import MonthlyReportChart from '../components/transactions/MonthlyReportChart.jsx';
import TransactionList from '../components/transactions/TransactionList.jsx';
import PageSkeleton from '../components/PageSkeleton.jsx';
import { categoryLabels, expenseCategories } from '../constants/transactions.js';
import { useAuth } from '../hooks/useAuth.js';
import { mapApiErrors } from '../utils/formErrors.js';
import { formatCurrency, toDateInputValue } from '../utils/formatters.js';

const today = toDateInputValue(new Date());
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

const defaultFilters = {
  startDate: toDateInputValue(thirtyDaysAgo),
  endDate: today,
  category: '',
};

const emptyIncomeForm = { source: '', amount: '', date: today };
const emptyExpenseForm = { category: 'food', amount: '', date: today, notes: '' };

const validateAmount = (amount) => Number.isFinite(Number(amount)) && Number(amount) > 0;

function ExpenseTracker() {
  const { user } = useAuth();
  const currency = user.financialProfile?.currency ?? 'USD';
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({ summary: [], total: 0 });
  const [monthlyReport, setMonthlyReport] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const [filterError, setFilterError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const [incomeForm, setIncomeForm] = useState(emptyIncomeForm);
  const [incomeErrors, setIncomeErrors] = useState({});
  const [incomeEditId, setIncomeEditId] = useState('');
  const [isSavingIncome, setIsSavingIncome] = useState(false);

  const [expenseForm, setExpenseForm] = useState(emptyExpenseForm);
  const [expenseErrors, setExpenseErrors] = useState({});
  const [expenseEditId, setExpenseEditId] = useState('');
  const [isSavingExpense, setIsSavingExpense] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const dateFilters = {
        startDate: appliedFilters.startDate,
        endDate: appliedFilters.endDate,
        limit: 200,
      };
      const [incomeResult, expenseResult, summaryResult, reportResult] = await Promise.all([
        api.getIncome(dateFilters),
        api.getExpenses({ ...dateFilters, category: appliedFilters.category }),
        api.getExpenseSummary({
          startDate: appliedFilters.startDate,
          endDate: appliedFilters.endDate,
        }),
        api.getMonthlyReport(6),
      ]);

      setIncome(incomeResult.income);
      setExpenses(expenseResult.expenses);
      setSummary(summaryResult);
      setMonthlyReport(reportResult.months);
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const transactions = useMemo(() => {
    const expenseTransactions = expenses.map((expense) => ({ ...expense, type: 'expense' }));
    const records = appliedFilters.category
      ? expenseTransactions
      : [...income.map((record) => ({ ...record, type: 'income' })), ...expenseTransactions];

    return records.sort(
      (first, second) =>
        new Date(second.date).getTime() - new Date(first.date).getTime() ||
        new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
    );
  }, [appliedFilters.category, expenses, income]);

  const totalIncome = income.reduce((total, record) => total + record.amount, 0);
  const hasActiveFilters =
    appliedFilters.category ||
    appliedFilters.startDate !== defaultFilters.startDate ||
    appliedFilters.endDate !== defaultFilters.endDate;

  const updateIncomeForm = (event) => {
    setIncomeForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setIncomeErrors((current) => ({ ...current, [event.target.name]: undefined, form: undefined }));
  };

  const updateExpenseForm = (event) => {
    setExpenseForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setExpenseErrors((current) => ({
      ...current,
      [event.target.name]: undefined,
      form: undefined,
    }));
  };

  const cancelIncomeEdit = () => {
    setIncomeEditId('');
    setIncomeForm(emptyIncomeForm);
    setIncomeErrors({});
  };

  const cancelExpenseEdit = () => {
    setExpenseEditId('');
    setExpenseForm(emptyExpenseForm);
    setExpenseErrors({});
  };

  const submitIncome = async (event) => {
    event.preventDefault();
    const errors = {};

    if (incomeForm.source.trim().length < 2) errors.source = 'Enter an income source.';
    if (!validateAmount(incomeForm.amount)) errors.amount = 'Enter an amount greater than zero.';
    if (!incomeForm.date) errors.date = 'Choose a date.';

    if (Object.keys(errors).length) {
      setIncomeErrors(errors);
      return;
    }

    setIsSavingIncome(true);
    setIncomeErrors({});
    setActionError('');

    try {
      const values = {
        source: incomeForm.source.trim(),
        amount: Number(incomeForm.amount),
        date: incomeForm.date,
      };

      if (incomeEditId) {
        await api.updateIncome(incomeEditId, values);
      } else {
        await api.createIncome(values);
      }

      cancelIncomeEdit();
      await loadData();
    } catch (error) {
      setIncomeErrors({ ...mapApiErrors(error), form: error.message });
    } finally {
      setIsSavingIncome(false);
    }
  };

  const submitExpense = async (event) => {
    event.preventDefault();
    const errors = {};

    if (!expenseCategories.includes(expenseForm.category)) errors.category = 'Choose a category.';
    if (!validateAmount(expenseForm.amount)) errors.amount = 'Enter an amount greater than zero.';
    if (!expenseForm.date) errors.date = 'Choose a date.';
    if (expenseForm.notes.length > 500) errors.notes = 'Notes cannot exceed 500 characters.';

    if (Object.keys(errors).length) {
      setExpenseErrors(errors);
      return;
    }

    setIsSavingExpense(true);
    setExpenseErrors({});
    setActionError('');

    try {
      const values = {
        category: expenseForm.category,
        amount: Number(expenseForm.amount),
        date: expenseForm.date,
        notes: expenseForm.notes.trim(),
      };

      if (expenseEditId) {
        await api.updateExpense(expenseEditId, values);
      } else {
        await api.createExpense(values);
      }

      cancelExpenseEdit();
      await loadData();
    } catch (error) {
      setExpenseErrors({ ...mapApiErrors(error), form: error.message });
    } finally {
      setIsSavingExpense(false);
    }
  };

  const editTransaction = (transaction) => {
    setActionError('');

    if (transaction.type === 'income') {
      setIncomeEditId(transaction._id);
      setIncomeForm({
        source: transaction.source,
        amount: String(transaction.amount),
        date: transaction.date.slice(0, 10),
      });
      setIncomeErrors({});
    } else {
      setExpenseEditId(transaction._id);
      setExpenseForm({
        category: transaction.category,
        amount: String(transaction.amount),
        date: transaction.date.slice(0, 10),
        notes: transaction.notes ?? '',
      });
      setExpenseErrors({});
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteTransaction = async (transaction) => {
    const label =
      transaction.type === 'income' ? transaction.source : categoryLabels[transaction.category];

    if (!window.confirm(`Delete this ${label.toLowerCase()} transaction?`)) {
      return;
    }

    setDeletingId(transaction._id);
    setActionError('');

    try {
      if (transaction.type === 'income') {
        await api.deleteIncome(transaction._id);
        if (incomeEditId === transaction._id) cancelIncomeEdit();
      } else {
        await api.deleteExpense(transaction._id);
        if (expenseEditId === transaction._id) cancelExpenseEdit();
      }

      await loadData();
    } catch (error) {
      setActionError(error.message);
    } finally {
      setDeletingId('');
    }
  };

  const applyFilters = (event) => {
    event.preventDefault();

    if (!filters.startDate || !filters.endDate) {
      setFilterError('Choose both a start date and an end date.');
      return;
    }

    if (filters.startDate > filters.endDate) {
      setFilterError('End date must be on or after start date.');
      return;
    }

    setFilterError('');
    setAppliedFilters({ ...filters });
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setFilterError('');
  };

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium text-[#007a2a]">Cash flow workspace</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#161d19] sm:text-4xl">
          Expense Tracker
        </h1>
        <p className="mt-3 max-w-2xl text-[#536158]">
          Record money in and out, then use category and monthly trends to understand your cash
          flow.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <IncomeForm
          values={incomeForm}
          errors={incomeErrors}
          isEditing={Boolean(incomeEditId)}
          isSubmitting={isSavingIncome}
          onChange={updateIncomeForm}
          onSubmit={submitIncome}
          onCancel={cancelIncomeEdit}
        />
        <ExpenseForm
          values={expenseForm}
          errors={expenseErrors}
          isEditing={Boolean(expenseEditId)}
          isSubmitting={isSavingExpense}
          onChange={updateExpenseForm}
          onSubmit={submitExpense}
          onCancel={cancelExpenseEdit}
        />
      </div>

      <section className="rounded-2xl border border-[#cbd7ce] bg-white shadow-soft p-5 sm:p-6">
        <form onSubmit={applyFilters}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#161d19]">Filter activity</h2>
              <p className="mt-1 text-sm text-[#6c7a71]">
                Category applies to expenses; dates apply to all transactions.
              </p>
            </div>
            {filterError && <p className="text-sm text-[#a43a3a]">{filterError}</p>}
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm font-medium text-[#26352c]">
              Start date
              <input
                type="date"
                value={filters.startDate}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, startDate: event.target.value }))
                }
                className="mt-2 w-full rounded-lg border border-[#b9c8bd] bg-[#f4fbf4] px-3 py-2.5 text-[#161d19] outline-none focus:border-emerald-500"
              />
            </label>
            <label className="text-sm font-medium text-[#26352c]">
              End date
              <input
                type="date"
                value={filters.endDate}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, endDate: event.target.value }))
                }
                className="mt-2 w-full rounded-lg border border-[#b9c8bd] bg-[#f4fbf4] px-3 py-2.5 text-[#161d19] outline-none focus:border-emerald-500"
              />
            </label>
            <label className="text-sm font-medium text-[#26352c]">
              Expense category
              <select
                value={filters.category}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, category: event.target.value }))
                }
                className="mt-2 w-full rounded-lg border border-[#b9c8bd] bg-[#f4fbf4] px-3 py-2.5 text-[#161d19] outline-none focus:border-emerald-500"
              >
                <option value="">All categories</option>
                {expenseCategories.map((category) => (
                  <option key={category} value={category}>
                    {categoryLabels[category]}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex gap-2 sm:col-span-2 lg:col-span-1 lg:self-end">
              <button
                type="submit"
                className="flex-1 rounded-lg bg-[#eef6ee] px-4 py-2.5 font-semibold text-[#161d19] hover:bg-white"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-lg border border-[#b9c8bd] px-4 py-2.5 text-[#35443a] hover:bg-[#e8f0e9]"
              >
                Reset
              </button>
            </div>
          </div>
        </form>
      </section>

      {actionError && (
        <p
          className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-[#a43a3a]"
          role="alert"
        >
          {actionError}
        </p>
      )}

      {isLoading ? (
        <PageSkeleton label="Loading transactions and reports" cards={2} />
      ) : loadError ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-6 py-10 text-center">
          <p className="font-medium text-[#842225]">We couldn’t load your cash-flow data.</p>
          <p className="mt-2 text-sm text-[#9b4a4a]">{loadError}</p>
          <button
            type="button"
            onClick={() => void loadData()}
            className="mt-5 rounded-lg bg-rose-200 px-4 py-2 font-semibold text-[#161d19]"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-500/20 bg-[#00bc44]/10 p-5">
              <p className="text-sm text-[#497255]">Income in selected period</p>
              <p className="mt-2 text-2xl font-bold text-[#006e24]">
                {formatCurrency(totalIncome, currency)}
              </p>
            </div>
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5">
              <p className="text-sm text-[#925253]">Expenses in selected period</p>
              <p className="mt-2 text-2xl font-bold text-[#a43a3a]">
                {formatCurrency(summary.total, currency)}
              </p>
            </div>
          </div>

          <TransactionList
            transactions={transactions}
            currency={currency}
            formatCurrency={formatCurrency}
            deletingId={deletingId}
            hasActiveFilters={Boolean(hasActiveFilters)}
            onEdit={editTransaction}
            onDelete={deleteTransaction}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <CategoryBreakdownChart
              summary={summary.summary}
              total={summary.total}
              currency={currency}
              formatCurrency={formatCurrency}
            />
            <MonthlyReportChart
              months={monthlyReport}
              currency={currency}
              formatCurrency={formatCurrency}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default ExpenseTracker;
