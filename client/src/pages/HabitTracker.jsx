import { useCallback, useEffect, useState } from 'react';

import { api } from '../api/client.js';
import HabitCard from '../components/habits/HabitCard.jsx';
import HabitForm from '../components/habits/HabitForm.jsx';
import PageSkeleton from '../components/PageSkeleton.jsx';
import { habitFrequencies, habitTypes } from '../constants/habits.js';
import { mapApiErrors } from '../utils/formErrors.js';

const emptyForm = { name: '', type: 'saving', frequency: 'daily' };

function HabitTracker() {
  const [habits, setHabits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [action, setAction] = useState({ id: '', type: '' });
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadHabits = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const result = await api.getHabitSummary();
      setHabits(result.habits);
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHabits();
  }, [loadHabits]);

  const updateForm = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setFormErrors((current) => ({ ...current, [event.target.name]: undefined, form: undefined }));
  };

  const submitHabit = async (event) => {
    event.preventDefault();
    const errors = {};

    if (form.name.trim().length < 2) errors.name = 'Name must be at least 2 characters.';
    if (!habitTypes.includes(form.type)) errors.type = 'Choose a valid habit type.';
    if (!habitFrequencies.includes(form.frequency)) errors.frequency = 'Choose a frequency.';

    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});
    setActionError('');

    try {
      await api.createHabit({ ...form, name: form.name.trim() });
      setForm(emptyForm);
      await loadHabits();
    } catch (error) {
      setFormErrors({ ...mapApiErrors(error), form: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeHabit = async (habit) => {
    setAction({ id: habit._id, type: 'complete' });
    setActionError('');

    try {
      await api.completeHabit(habit._id);
      await loadHabits();
    } catch (error) {
      setActionError(error.message);
    } finally {
      setAction({ id: '', type: '' });
    }
  };

  const deactivateHabit = async (habit) => {
    setAction({ id: habit._id, type: 'deactivate' });
    setActionError('');

    try {
      await api.updateHabit(habit._id, { active: false });
      await loadHabits();
    } catch (error) {
      setActionError(error.message);
    } finally {
      setAction({ id: '', type: '' });
    }
  };

  const deleteHabit = async (habit) => {
    if (!window.confirm(`Delete “${habit.name}” and all of its completion history?`)) {
      return;
    }

    setAction({ id: habit._id, type: 'delete' });
    setActionError('');

    try {
      await api.deleteHabit(habit._id);
      await loadHabits();
    } catch (error) {
      setActionError(error.message);
    } finally {
      setAction({ id: '', type: '' });
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium text-emerald-400">Consistency compounds</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Habit Tracker
        </h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Turn useful financial actions into repeatable routines and keep an eye on habits that are
          due.
        </p>
      </header>

      <HabitForm
        values={form}
        errors={formErrors}
        isSubmitting={isSubmitting}
        onChange={updateForm}
        onSubmit={submitHabit}
      />

      {actionError && (
        <p
          className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
          role="alert"
        >
          {actionError}
        </p>
      )}

      {isLoading ? (
        <PageSkeleton label="Loading your habits" cards={2} sections={1} />
      ) : loadError ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-6 py-10 text-center">
          <p className="font-medium text-rose-200">We couldn’t load your habits.</p>
          <p className="mt-2 text-sm text-rose-300/80">{loadError}</p>
          <button
            type="button"
            onClick={() => void loadHabits()}
            className="mt-5 rounded-lg bg-rose-200 px-4 py-2 font-semibold text-slate-950"
          >
            Try again
          </button>
        </div>
      ) : habits.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-16 text-center">
          <p className="text-lg font-semibold text-slate-200">No active habits yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Start with one small action you can repeat. Your streak and 30-day history will appear
            here.
          </p>
        </section>
      ) : (
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">Active habits</h2>
              <p className="mt-1 text-sm text-slate-500">
                Amber indicators are in-app reminders for the current period.
              </p>
            </div>
            <p className="text-sm text-slate-500">
              {habits.length} {habits.length === 1 ? 'habit' : 'habits'}
            </p>
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            {habits.map((habit) => (
              <HabitCard
                key={habit._id}
                habit={habit}
                action={action}
                onComplete={completeHabit}
                onDeactivate={deactivateHabit}
                onDelete={deleteHabit}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default HabitTracker;
