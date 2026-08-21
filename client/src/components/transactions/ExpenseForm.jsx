import { categoryLabels, expenseCategories } from '../../constants/transactions.js';
import FormField from '../FormField.jsx';

function ExpenseForm({ errors, isEditing, isSubmitting, onCancel, onChange, onSubmit, values }) {
  return (
    <section className="rounded-2xl border border-[#cbd7ce] bg-white shadow-soft p-5 sm:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a43a3a]">Money out</p>
        <h2 className="mt-2 text-xl font-semibold text-[#161d19]">
          {isEditing ? 'Edit expense' : 'Add expense'}
        </h2>
      </div>
      <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
        {errors.form && (
          <p
            className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-[#a43a3a]"
            role="alert"
          >
            {errors.form}
          </p>
        )}
        <div>
          <label
            className="mb-2 block text-sm font-medium text-[#26352c]"
            htmlFor="expense-category"
          >
            Category
          </label>
          <select
            id="expense-category"
            name="category"
            value={values.category}
            onChange={onChange}
            className="w-full rounded-lg border border-[#b9c8bd] bg-[#f4fbf4] px-3 py-2.5 text-[#161d19] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          >
            {expenseCategories.map((category) => (
              <option key={category} value={category}>
                {categoryLabels[category]}
              </option>
            ))}
          </select>
          {errors.category && <p className="mt-1.5 text-sm text-[#a43a3a]">{errors.category}</p>}
        </div>
        <FormField
          id="expense-amount"
          name="amount"
          type="number"
          min="0.01"
          step="0.01"
          inputMode="decimal"
          label="Amount"
          placeholder="0.00"
          value={values.amount}
          onChange={onChange}
          error={errors.amount}
        />
        <FormField
          id="expense-date"
          name="date"
          type="date"
          label="Date"
          value={values.date}
          onChange={onChange}
          error={errors.date}
        />
        <div>
          <label className="mb-2 block text-sm font-medium text-[#26352c]" htmlFor="expense-notes">
            Notes <span className="font-normal text-[#6c7a71]">(optional)</span>
          </label>
          <textarea
            id="expense-notes"
            name="notes"
            rows="3"
            maxLength="500"
            value={values.notes}
            onChange={onChange}
            placeholder="Add context for this expense"
            className="w-full resize-y rounded-lg border border-[#b9c8bd] bg-[#f4fbf4] px-3 py-2.5 text-[#161d19] outline-none placeholder:text-[#87938b] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
          <div className="mt-1 flex justify-between gap-3 text-xs">
            <span className="text-[#a43a3a]">{errors.notes}</span>
            <span className="ml-auto text-[#6c7a71]">{values.notes.length}/500</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-[#e56b6f] px-4 py-2.5 font-semibold text-white transition hover:bg-[#d95b60] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Saving…' : isEditing ? 'Update expense' : 'Add expense'}
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

export default ExpenseForm;
