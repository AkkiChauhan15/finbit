import { useCallback, useEffect, useState } from 'react';

import { api } from '../api/client.js';
import PageSkeleton from '../components/PageSkeleton.jsx';
import { frequencyLabels, subscriptionFrequencies } from '../constants/subscriptions.js';
import { categoryLabels, expenseCategories } from '../constants/transactions.js';
import { useAuth } from '../hooks/useAuth.js';
import { mapApiErrors } from '../utils/formErrors.js';
import { formatCurrency, formatDate, toDateInputValue } from '../utils/formatters.js';

const emptyForm = {
  name: '',
  amount: '',
  category: 'other',
  frequency: 'monthly',
  nextDueDate: toDateInputValue(new Date()),
  notes: '',
};

const validateAmount = (amount) => Number.isFinite(Number(amount)) && Number(amount) > 0;

function Subscriptions() {
  const { user } = useAuth();
  const currency = user.financialProfile?.currency ?? 'USD';
  const [subscriptions, setSubscriptions] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [editId, setEditId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [paidId, setPaidId] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);

  const loadSubscriptions = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const result = await api.getSubscriptions();
      setSubscriptions(result.subscriptions ?? []);
    } catch (requestError) {
      setLoadError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSubscriptions();
  }, [loadSubscriptions]);

  const updateForm = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setFormErrors((current) => ({ ...current, [event.target.name]: undefined, form: undefined }));
  };

  const resetForm = () => {
    setEditId('');
    setForm(emptyForm);
    setFormErrors({});
  };

  const submit = async (event) => {
    event.preventDefault();
    const errors = {};

    if (form.name.trim().length < 2) errors.name = 'Enter a subscription name.';
    if (!validateAmount(form.amount)) errors.amount = 'Enter an amount greater than zero.';
    if (!subscriptionFrequencies.includes(form.frequency)) errors.frequency = 'Choose a frequency.';
    if (!form.nextDueDate) errors.nextDueDate = 'Choose a due date.';
    if (form.notes.length > 500) errors.notes = 'Notes cannot exceed 500 characters.';

    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    setIsSaving(true);
    setFormErrors({});
    setActionError('');

    try {
      const values = {
        name: form.name.trim(),
        amount: Number(form.amount),
        category: form.category,
        frequency: form.frequency,
        nextDueDate: form.nextDueDate,
        notes: form.notes.trim(),
      };

      if (editId) {
        await api.updateSubscription(editId, values);
      } else {
        await api.createSubscription(values);
      }

      resetForm();
      await loadSubscriptions();
    } catch (requestError) {
      setFormErrors({ ...mapApiErrors(requestError), form: requestError.message });
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (subscription) => {
    setEditId(subscription._id);
    setForm({
      name: subscription.name,
      amount: String(subscription.amount),
      category: subscription.category,
      frequency: subscription.frequency,
      nextDueDate: subscription.nextDueDate.slice(0, 10),
      notes: subscription.notes ?? '',
    });
    setFormErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (subscription) => {
    if (!window.confirm(`Delete ${subscription.name}?`)) {
      return;
    }

    setActionError('');

    try {
      await api.deleteSubscription(subscription._id);
      if (editId === subscription._id) resetForm();
      await loadSubscriptions();
    } catch (requestError) {
      setActionError(requestError.message);
    }
  };

  const markPaid = async (subscription) => {
    setPaidId(subscription._id);
    setActionError('');

    try {
      await api.markSubscriptionPaid(subscription._id);
      await loadSubscriptions();
    } catch (requestError) {
      setActionError(requestError.message);
    } finally {
      setPaidId('');
    }
  };

  const detect = async () => {
    setIsDetecting(true);
    setActionError('');

    try {
      const result = await api.detectSubscriptions();
      setSuggestions(result.suggestions ?? []);
    } catch (requestError) {
      setActionError(requestError.message);
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-semibold text-[#007a2a]">Recurring bills</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#161d19] sm:text-4xl">
          Subscriptions
        </h1>
        <p className="mt-3 max-w-2xl text-[#536158]">
          Track recurring bills and subscriptions, mark them paid, and detect forgotten ones.
        </p>
      </header>

      <section className="rounded-2xl border border-[#cbd7ce] bg-white p-5 shadow-soft sm:p-6">
        <h2 className="text-xl font-semibold text-[#161d19]">
          {editId ? 'Edit subscription' : 'Add subscription'}
        </h2>
        <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm font-medium text-[#26352c]">
            Name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={updateForm}
              className="mt-2 w-full rounded-lg border border-[#b9c8bd] bg-[#f4fbf4] px-3 py-2.5 text-[#161d19] outline-none focus:border-emerald-500"
            />
            {formErrors.name && <p className="mt-1 text-xs text-[#a43a3a]">{formErrors.name}</p>}
          </label>
          <label className="text-sm font-medium text-[#26352c]">
            Amount
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={updateForm}
              step="0.01"
              min="0"
              className="mt-2 w-full rounded-lg border border-[#b9c8bd] bg-[#f4fbf4] px-3 py-2.5 text-[#161d19] outline-none focus:border-emerald-500"
            />
            {formErrors.amount && (
              <p className="mt-1 text-xs text-[#a43a3a]">{formErrors.amount}</p>
            )}
          </label>
          <label className="text-sm font-medium text-[#26352c]">
            Category
            <select
              name="category"
              value={form.category}
              onChange={updateForm}
              className="mt-2 w-full rounded-lg border border-[#b9c8bd] bg-[#f4fbf4] px-3 py-2.5 text-[#161d19] outline-none focus:border-emerald-500"
            >
              {expenseCategories.map((category) => (
                <option key={category} value={category}>
                  {categoryLabels[category]}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-[#26352c]">
            Frequency
            <select
              name="frequency"
              value={form.frequency}
              onChange={updateForm}
              className="mt-2 w-full rounded-lg border border-[#b9c8bd] bg-[#f4fbf4] px-3 py-2.5 text-[#161d19] outline-none focus:border-emerald-500"
            >
              {subscriptionFrequencies.map((frequency) => (
                <option key={frequency} value={frequency}>
                  {frequencyLabels[frequency]}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-[#26352c]">
            Next due date
            <input
              type="date"
              name="nextDueDate"
              value={form.nextDueDate}
              onChange={updateForm}
              className="mt-2 w-full rounded-lg border border-[#b9c8bd] bg-[#f4fbf4] px-3 py-2.5 text-[#161d19] outline-none focus:border-emerald-500"
            />
            {formErrors.nextDueDate && (
              <p className="mt-1 text-xs text-[#a43a3a]">{formErrors.nextDueDate}</p>
            )}
          </label>
          <label className="text-sm font-medium text-[#26352c] sm:col-span-2 lg:col-span-3">
            Notes
            <input
              type="text"
              name="notes"
              value={form.notes}
              onChange={updateForm}
              className="mt-2 w-full rounded-lg border border-[#b9c8bd] bg-[#f4fbf4] px-3 py-2.5 text-[#161d19] outline-none focus:border-emerald-500"
            />
            {formErrors.notes && <p className="mt-1 text-xs text-[#a43a3a]">{formErrors.notes}</p>}
          </label>
          <div className="flex gap-2 sm:col-span-2 lg:col-span-3">
            <button type="submit" disabled={isSaving} className="primary-button text-sm">
              {isSaving ? 'Saving…' : editId ? 'Update subscription' : 'Add subscription'}
            </button>
            {editId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-[#b9c8bd] px-4 py-2.5 text-[#35443a] hover:bg-[#e8f0e9]"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-[#cbd7ce] bg-white p-5 shadow-soft sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-[#161d19]">Your subscriptions</h2>
          <button
            type="button"
            onClick={() => void detect()}
            disabled={isDetecting}
            className="rounded-lg bg-[#eef6ee] px-4 py-2.5 font-semibold text-[#161d19] hover:bg-white"
          >
            {isDetecting ? 'Detecting…' : 'Detect recurring'}
          </button>
        </div>

        {actionError && (
          <p
            className="mt-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-[#a43a3a]"
            role="alert"
          >
            {actionError}
          </p>
        )}

        {suggestions.length > 0 && (
          <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <p className="text-sm font-semibold text-[#805600]">Suggested recurring payments</p>
            <ul className="mt-3 space-y-2">
              {suggestions.map((suggestion) => (
                <li
                  key={`${suggestion.category}-${suggestion.name}`}
                  className="flex flex-wrap items-center justify-between gap-2 text-sm text-[#26352c]"
                >
                  <span>
                    {suggestion.name} · {categoryLabels[suggestion.category]} ·{' '}
                    {formatCurrency(suggestion.amount, currency)}/month
                  </span>
                  <span className="text-xs text-[#6c7a71]">
                    {suggestion.occurrences} occurrences
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {isLoading ? (
          <PageSkeleton label="Loading subscriptions" cards={1} />
        ) : loadError ? (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-6 py-10 text-center">
            <p className="font-medium text-[#842225]">We couldn’t load your subscriptions.</p>
            <p className="mt-2 text-sm text-[#9b4a4a]">{loadError}</p>
            <button
              type="button"
              onClick={() => void loadSubscriptions()}
              className="mt-5 rounded-lg bg-rose-200 px-4 py-2 font-semibold text-[#161d19]"
            >
              Try again
            </button>
          </div>
        ) : subscriptions.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#6c7a71]">
            No subscriptions yet. Add your first recurring bill above.
          </p>
        ) : (
          <div className="mt-5 divide-y divide-[#e0e8e2]">
            {subscriptions.map((subscription) => (
              <div
                key={subscription._id}
                className="flex flex-wrap items-center justify-between gap-3 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-[#26352c]">{subscription.name}</p>
                  <p className="mt-1 text-xs text-[#6c7a71]">
                    {formatCurrency(subscription.amount, currency)} ·{' '}
                    {frequencyLabels[subscription.frequency]} · due{' '}
                    {formatDate(subscription.nextDueDate)}
                    {subscription.daysUntil !== undefined &&
                      (subscription.daysUntil < 0
                        ? ` (${Math.abs(subscription.daysUntil)}d overdue)`
                        : subscription.daysUntil === 0
                          ? ' (due today)'
                          : ` (in ${subscription.daysUntil}d)`)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={paidId === subscription._id}
                    onClick={() => void markPaid(subscription)}
                    className="rounded-lg bg-[#dff3e4] px-3 py-2 text-sm font-semibold text-[#006e24] hover:bg-[#c8ecd1]"
                  >
                    Mark paid
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(subscription)}
                    className="rounded-lg border border-[#b9c8bd] px-3 py-2 text-sm text-[#35443a] hover:bg-[#e8f0e9]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(subscription)}
                    className="rounded-lg border border-rose-300 px-3 py-2 text-sm text-[#a43a3a] hover:bg-[#fff0ef]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Subscriptions;
