import FormField from '../FormField.jsx';

function IncomeForm({ errors, isEditing, isSubmitting, onCancel, onChange, onSubmit, values }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Money in
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          {isEditing ? 'Edit income' : 'Add income'}
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
        <FormField
          id="income-source"
          name="source"
          label="Source"
          placeholder="Salary, freelance, dividends…"
          value={values.source}
          onChange={onChange}
          error={errors.source}
        />
        <FormField
          id="income-amount"
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
          id="income-date"
          name="date"
          type="date"
          label="Date"
          value={values.date}
          onChange={onChange}
          error={errors.date}
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-emerald-500 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Saving…' : isEditing ? 'Update income' : 'Add income'}
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

export default IncomeForm;
