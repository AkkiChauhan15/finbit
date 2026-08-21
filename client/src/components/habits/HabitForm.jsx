import {
  frequencyLabels,
  habitFrequencies,
  habitTypeLabels,
  habitTypes,
} from '../../constants/habits.js';
import FormField from '../FormField.jsx';

function HabitForm({ errors, isSubmitting, onChange, onSubmit, values }) {
  return (
    <section className="rounded-2xl border border-[#cbd7ce] bg-white shadow-soft p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#007a2a]">
        Build consistency
      </p>
      <h2 className="mt-2 text-xl font-semibold text-[#161d19]">Create a financial habit</h2>
      <p className="mt-2 text-sm leading-6 text-[#6c7a71]">
        Choose a cadence that is realistic enough to repeat without friction.
      </p>

      <form
        className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        onSubmit={onSubmit}
        noValidate
      >
        {errors.form && (
          <p
            className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-[#a43a3a] sm:col-span-2 lg:col-span-4"
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
          <label className="mb-2 block text-sm font-medium text-[#26352c]" htmlFor="habit-type">
            Type
          </label>
          <select
            id="habit-type"
            name="type"
            value={values.type}
            onChange={onChange}
            className="w-full rounded-lg border border-[#b9c8bd] bg-[#f4fbf4] px-3 py-2.5 text-[#161d19] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          >
            {habitTypes.map((type) => (
              <option key={type} value={type}>
                {habitTypeLabels[type]}
              </option>
            ))}
          </select>
          {errors.type && <p className="mt-1.5 text-sm text-[#a43a3a]">{errors.type}</p>}
        </div>
        <div>
          <label
            className="mb-2 block text-sm font-medium text-[#26352c]"
            htmlFor="habit-frequency"
          >
            Frequency
          </label>
          <select
            id="habit-frequency"
            name="frequency"
            value={values.frequency}
            onChange={onChange}
            className="w-full rounded-lg border border-[#b9c8bd] bg-[#f4fbf4] px-3 py-2.5 text-[#161d19] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          >
            {habitFrequencies.map((frequency) => (
              <option key={frequency} value={frequency}>
                {frequencyLabels[frequency]}
              </option>
            ))}
          </select>
          {errors.frequency && <p className="mt-1.5 text-sm text-[#a43a3a]">{errors.frequency}</p>}
        </div>
        <div className="sm:col-span-2 lg:col-span-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-[#00bc44] px-4 py-2.5 font-semibold text-[#161d19] transition hover:bg-[#18c950] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isSubmitting ? 'Creating…' : 'Create habit'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default HabitForm;
