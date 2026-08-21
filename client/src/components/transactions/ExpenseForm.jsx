import { categoryLabels, expenseCategories } from '../../constants/transactions.js';
import FormField from '../FormField.jsx';

function ExpenseForm({ errors, isEditing, isSubmitting, onCancel, onChange, onSubmit, values }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-400">Money out</p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          {isEditing ? 'Edit expense' : 'Add expense'}
        </h2>
      </div>
      <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
        {errors.form && (
          <p
            className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300"
            role="alert"
          >
            {errors.form}
          </p>
        )}
        <div>
          <label
            className="mb-2 block text-sm font-medium text-slate-200"
            htmlFor="expense-category"
          >
            Category
          </label>
          <select
            id="expense-category"
            name="category"
            value={values.category}
            onChange={onChange}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          >
            {expenseCategories.map((category) => (
              <option key={category} value={category}>
                {categoryLabels[category]}
              </option>
            ))}
          </select>
          {errors.category && <p className="mt-1.5 text-sm text-rose-400">{errors.category}</p>}
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
          <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="expense-notes">
            Notes <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <textarea
            id="expense-notes"
            name="notes"
            rows="3"
            maxLength="500"
            value={values.notes}
            onChange={onChange}
            placeholder="Add context for this expense"
            className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none placeholder:text-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
          <div className="mt-1 flex justify-between gap-3 text-xs">
            <span className="text-rose-400">{errors.notes}</span>
            <span className="ml-auto text-slate-500">{values.notes.length}/500</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-rose-400 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Saving…' : isEditing ? 'Update expense' : 'Add expense'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-700 px-4 py-2.5 text-slate-300 hover:bg-slate-800"
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
