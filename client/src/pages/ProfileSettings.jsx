import { useState } from 'react';

import FormField from '../components/FormField.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { mapApiErrors } from '../utils/formErrors.js';

const currencies = ['USD', 'INR', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];

function ProfileSettings() {
  const { updateProfile, user } = useAuth();
  const [values, setValues] = useState({
    name: user.name,
    currency: user.financialProfile?.currency ?? 'USD',
    monthlyIncomeGoal: String(user.financialProfile?.monthlyIncomeGoal ?? 0),
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateValue = (event) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
    setErrors((current) => ({ ...current, [event.target.name]: undefined }));
    setStatus({ type: '', message: '' });
  };

  const validate = () => {
    const nextErrors = {};
    const incomeGoal = Number(values.monthlyIncomeGoal);

    if (values.name.trim().length < 2) nextErrors.name = 'Name must be at least 2 characters.';
    if (!Number.isFinite(incomeGoal) || incomeGoal < 0) {
      nextErrors.monthlyIncomeGoal = 'Enter an amount of zero or greater.';
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      await updateProfile({
        name: values.name.trim(),
        currency: values.currency,
        monthlyIncomeGoal: Number(values.monthlyIncomeGoal),
      });
      setStatus({ type: 'success', message: 'Your profile has been updated.' });
    } catch (error) {
      setErrors(mapApiErrors(error));
      setStatus({ type: 'error', message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/20 sm:p-8">
      <p className="text-sm font-medium text-emerald-400">Account settings</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Financial profile</h1>
      <p className="mt-3 text-slate-400">
        Keep your display name and the defaults used for future financial planning features up to
        date.
      </p>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
        {status.message && (
          <div
            role="status"
            className={`rounded-lg border px-3 py-2 text-sm ${
              status.type === 'success'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                : 'border-rose-500/40 bg-rose-500/10 text-rose-300'
            }`}
          >
            {status.message}
          </div>
        )}
        <FormField
          id="profile-name"
          name="name"
          label="Full name"
          autoComplete="name"
          value={values.name}
          onChange={updateValue}
          error={errors.name}
        />
        <div>
          <label
            className="mb-2 block text-sm font-medium text-slate-200"
            htmlFor="profile-currency"
          >
            Preferred currency
          </label>
          <select
            id="profile-currency"
            name="currency"
            value={values.currency}
            onChange={updateValue}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          >
            {currencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>
        <FormField
          id="profile-monthly-income-goal"
          name="monthlyIncomeGoal"
          type="number"
          min="0"
          step="0.01"
          label="Monthly income goal"
          value={values.monthlyIncomeGoal}
          onChange={updateValue}
          error={errors.monthlyIncomeGoal}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {isSubmitting ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </section>
  );
}

export default ProfileSettings;
