import { goalCategories, goalCategoryLabels } from '../../constants/goals.js';
import FormField from '../FormField.jsx';

function GoalForm({
  errors,
  isEditing,
  isSubmitting,
  minTargetDate,
  onCancel,
  onChange,
  onSubmit,
  values,
}) {
  return (
    <section className="rounded-2xl border border-[#cbd7ce] bg-white shadow-soft p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#007a2a]">
        Plan with purpose
      </p>
      <h2 className="mt-2 text-xl font-semibold text-[#161d19]">
        {isEditing ? 'Edit savings goal' : 'Create a savings goal'}
      </h2>
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
        <div className="sm:col-span-2 lg:col-span-1">
          <FormField
            id="goal-name"
            name="name"
            label="Goal name"
            placeholder="Six-month emergency fund"
            value={values.name}
            onChange={onChange}
            error={errors.name}
          />
        </div>
        <FormField
          id="goal-target-amount"
          name="targetAmount"
          type="number"
          min="0.01"
          step="0.01"
          inputMode="decimal"
          label="Target amount"
          placeholder="0.00"
          value={values.targetAmount}
          onChange={onChange}
          error={errors.targetAmount}
        />
        <FormField
          id="goal-target-date"
          name="targetDate"
          type="date"
          min={isEditing ? undefined : minTargetDate}
          label="Target date"
          value={values.targetDate}
          onChange={onChange}
          error={errors.targetDate}
        />
        <div>
          <label className="mb-2 block text-sm font-medium text-[#26352c]" htmlFor="goal-category">
            Category
          </label>
          <select
            id="goal-category"
            name="category"
            value={values.category}
            onChange={onChange}
            className="w-full rounded-lg border border-[#b9c8bd] bg-[#f4fbf4] px-3 py-2.5 text-[#161d19] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          >
            {goalCategories.map((category) => (
              <option key={category} value={category}>
                {goalCategoryLabels[category]}
              </option>
            ))}
          </select>
          {errors.category && <p className="mt-1.5 text-sm text-[#a43a3a]">{errors.category}</p>}
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row lg:col-span-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-[#00bc44] px-4 py-2.5 font-semibold text-[#161d19] transition hover:bg-[#18c950] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Saving…' : isEditing ? 'Update goal' : 'Create goal'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-[#b9c8bd] px-4 py-2.5 text-[#35443a] hover:bg-[#e8f0e9]"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

export default GoalForm;
