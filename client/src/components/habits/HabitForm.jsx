import {
  frequencyLabels,
  habitFrequencies,
  habitTypeLabels,
  habitTypes,
} from '../../constants/habits.js';
import FormField from '../FormField.jsx';

function HabitForm({ errors, isSubmitting, onChange, onSubmit, values }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
        Build consistency
      </p>
      <h2 className="mt-2 text-xl font-semibold text-white">Create a financial habit</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Choose a cadence that is realistic enough to repeat without friction.
      </p>

      <form
        className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        onSubmit={onSubmit}
        noValidate
      >
        {errors.form && (
          <p
            className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300 sm:col-span-2 lg:col-span-4"
            role="alert"
          >
            {errors.form}
          </p>
        )}
        <div className="sm:col-span-2 lg:col-span-2">
          <FormField
            id="habit-name"
            name="name"
            label="Habit name"
            placeholder="Review spending before bed"
            value={values.name}
            onChange={onChange}
            error={errors.name}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="habit-type">
            Type
          </label>
          <select
            id="habit-type"
            name="type"
            value={values.type}
            onChange={onChange}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          >
            {habitTypes.map((type) => (
              <option key={type} value={type}>
                {habitTypeLabels[type]}
              </option>
            ))}
          </select>
          {errors.type && <p className="mt-1.5 text-sm text-rose-400">{errors.type}</p>}
        </div>
        <div>
          <label
            className="mb-2 block text-sm font-medium text-slate-200"
            htmlFor="habit-frequency"
          >
            Frequency
          </label>
          <select
            id="habit-frequency"
            name="frequency"
            value={values.frequency}
            onChange={onChange}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          >
            {habitFrequencies.map((frequency) => (
              <option key={frequency} value={frequency}>
                {frequencyLabels[frequency]}
              </option>
            ))}
          </select>
          {errors.frequency && <p className="mt-1.5 text-sm text-rose-400">{errors.frequency}</p>}
        </div>
        <div className="sm:col-span-2 lg:col-span-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isSubmitting ? 'Creating…' : 'Create habit'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default HabitForm;
