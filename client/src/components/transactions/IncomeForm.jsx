import FormField from '../FormField.jsx';

function IncomeForm({ errors, isEditing, isSubmitting, onCancel, onChange, onSubmit, values }) {
  return (
    <section className="rounded-2xl border border-[#cbd7ce] bg-white shadow-soft p-5 sm:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#007a2a]">Money in</p>
        <h2 className="mt-2 text-xl font-semibold text-[#161d19]">
          {isEditing ? 'Edit income' : 'Add income'}
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
            className="rounded-lg bg-[#00bc44] px-4 py-2.5 font-semibold text-[#161d19] transition hover:bg-[#18c950] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Saving…' : isEditing ? 'Update income' : 'Add income'}
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

export default IncomeForm;
