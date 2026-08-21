import { useCallback, useEffect, useState } from 'react';

import { api } from '../api/client.js';
import GoalCard from '../components/goals/GoalCard.jsx';
import GoalForm from '../components/goals/GoalForm.jsx';
import PageSkeleton from '../components/PageSkeleton.jsx';
import { goalCategories } from '../constants/goals.js';
import { useAuth } from '../hooks/useAuth.js';
import { mapApiErrors } from '../utils/formErrors.js';
import { formatCurrency, toDateInputValue } from '../utils/formatters.js';

const today = toDateInputValue(new Date());
const defaultTargetDate = new Date();
defaultTargetDate.setMonth(defaultTargetDate.getMonth() + 6);

const emptyForm = {
  name: '',
  targetAmount: '',
  targetDate: toDateInputValue(defaultTargetDate),
  category: 'emergency_fund',
};

function SavingsGoals() {
  const { user } = useAuth();
  const currency = user.financialProfile?.currency ?? 'USD';
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [action, setAction] = useState({ id: '', type: '' });
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [editingId, setEditingId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadGoals = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setLoadError('');

    try {
      const result = await api.getGoals();
      setGoals(result.goals);
    } catch (error) {
      setLoadError(error.message);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadGoals();
  }, [loadGoals]);

  const updateForm = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setFormErrors((current) => ({ ...current, [event.target.name]: undefined, form: undefined }));
  };

  const cancelEdit = () => {
    setEditingId('');
    setForm(emptyForm);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    const targetAmount = Number(form.targetAmount);

    if (form.name.trim().length < 2) errors.name = 'Name must be at least 2 characters.';
    if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
      errors.targetAmount = 'Enter an amount greater than zero.';
    }
    if (!form.targetDate) errors.targetDate = 'Choose a target date.';
    if (!editingId && form.targetDate < today) errors.targetDate = 'Choose today or a future date.';
    if (!goalCategories.includes(form.category)) errors.category = 'Choose a valid category.';

    return errors;
  };

  const submitGoal = async (event) => {
    event.preventDefault();
    const errors = validateForm();

    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    const values = {
      name: form.name.trim(),
      targetAmount: Number(form.targetAmount),
      targetDate: form.targetDate,
      category: form.category,
    };
    const snapshot = goals;

    setIsSubmitting(true);
    setFormErrors({});
    setActionError('');

    try {
      if (editingId) {
        setGoals((current) =>
          current.map((goal) => (goal._id === editingId ? { ...goal, ...values } : goal)),
        );
        await api.updateGoal(editingId, values);
      } else {
        await api.createGoal(values);
      }

      cancelEdit();
      await loadGoals(false);
    } catch (error) {
      if (editingId) setGoals(snapshot);
      setFormErrors({ ...mapApiErrors(error), form: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const editGoal = (goal) => {
    setEditingId(goal._id);
    setForm({
      name: goal.name,
      targetAmount: String(goal.targetAmount),
      targetDate: goal.targetDate.slice(0, 10),
      category: goal.category,
    });
    setFormErrors({});
    setActionError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const contribute = async (goal, amount) => {
    const snapshot = goals;
    const optimisticCurrentAmount = Math.round((goal.currentAmount + amount) * 100) / 100;
    const optimisticRemaining = Math.max(goal.targetAmount - optimisticCurrentAmount, 0);

    setAction({ id: goal._id, type: 'contribute' });
    setActionError('');
    setGoals((current) =>
      current.map((item) =>
        item._id === goal._id
          ? {
              ...item,
              currentAmount: optimisticCurrentAmount,
              progress: {
                ...item.progress,
                amountRemaining: optimisticRemaining,
                percentageComplete:
                  Math.round((optimisticCurrentAmount / item.targetAmount) * 1000) / 10,
                ...(optimisticRemaining === 0 && { status: 'completed' }),
              },
            }
          : item,
      ),
    );

    let result;

    try {
      result = await api.contributeToGoal(goal._id, { amount });
    } catch (error) {
      setGoals(snapshot);
      setAction({ id: '', type: '' });
      throw error;
    }

    setGoals((current) =>
      current.map((item) =>
        item._id === goal._id ? { ...item, ...result.goal, progress: result.progress } : item,
      ),
    );
    setAction({ id: '', type: '' });
  };

  const deleteGoal = async (goal) => {
    if (!window.confirm(`Delete “${goal.name}” and its contribution history?`)) {
      return;
    }

    const snapshot = goals;
    setAction({ id: goal._id, type: 'delete' });
    setActionError('');
    setGoals((current) => current.filter((item) => item._id !== goal._id));

    try {
      await api.deleteGoal(goal._id);
      if (editingId === goal._id) cancelEdit();
    } catch (error) {
      setGoals(snapshot);
      setActionError(error.message);
    } finally {
      setAction({ id: '', type: '' });
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium text-emerald-400">Make progress visible</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Savings Goals
        </h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Give every major purchase or safety net a target, a timeline, and a contribution rhythm.
        </p>
      </header>

      <GoalForm
        values={form}
        errors={formErrors}
        isEditing={Boolean(editingId)}
        isSubmitting={isSubmitting}
        minTargetDate={today}
        onChange={updateForm}
        onSubmit={submitGoal}
        onCancel={cancelEdit}
      />

      {actionError && (
        <p
          className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
          role="alert"
        >
          {actionError}
        </p>
      )}

      {isLoading ? (
        <PageSkeleton label="Loading savings goals" cards={2} sections={1} />
      ) : loadError ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-6 py-10 text-center">
          <p className="font-medium text-rose-200">We couldn’t load your savings goals.</p>
          <p className="mt-2 text-sm text-rose-300/80">{loadError}</p>
          <button
            type="button"
            onClick={() => void loadGoals()}
            className="mt-5 rounded-lg bg-rose-200 px-4 py-2 font-semibold text-slate-950"
          >
            Try again
          </button>
        </div>
      ) : goals.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-16 text-center">
          <p className="text-lg font-semibold text-slate-200">No savings goals yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Create your first goal above, then use quick contributions to build momentum.
          </p>
        </section>
      ) : (
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">Your goals</h2>
              <p className="mt-1 text-sm text-slate-500">
                Projections use your contribution pace over the last 90 days.
              </p>
            </div>
            <p className="text-sm text-slate-500">
              {goals.length} {goals.length === 1 ? 'goal' : 'goals'}
            </p>
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            {goals.map((goal) => (
              <GoalCard
                key={goal._id}
                goal={goal}
                action={action}
                currency={currency}
                formatCurrency={formatCurrency}
                onContribute={contribute}
                onEdit={editGoal}
                onDelete={deleteGoal}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default SavingsGoals;
