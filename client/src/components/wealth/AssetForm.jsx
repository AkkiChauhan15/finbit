import { assetTypeLabels, assetTypes } from '../../constants/assets.js';
import FormField from '../FormField.jsx';

function AssetForm({ errors, isEditing, isSubmitting, onCancel, onChange, onSubmit, values }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
      <h2 className="text-xl font-semibold text-white">
        {isEditing ? 'Update asset' : 'Add an asset or investment'}
      </h2>
      <form
        className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
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
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="asset-type">
            Type
          </label>
          <select
            id="asset-type"
            name="type"
            value={values.type}
            onChange={onChange}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-emerald-500"
          >
            {assetTypes.map((type) => (
              <option key={type} value={type}>
                {assetTypeLabels[type]}
              </option>
            ))}
          </select>
        </div>
        <FormField
          id="asset-name"
          name="name"
          label="Name"
          placeholder="Index fund portfolio"
          value={values.name}
          onChange={onChange}
          error={errors.name}
        />
        <FormField
          id="asset-current-value"
          name="currentValue"
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          label="Current value"
          value={values.currentValue}
          onChange={onChange}
          error={errors.currentValue}
        />
        <FormField
          id="asset-updated-date"
          name="dateUpdated"
          type="date"
          label="Valuation date"
          value={values.dateUpdated}
          onChange={onChange}
          error={errors.dateUpdated}
        />
        <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row lg:col-span-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-emerald-500 px-4 py-2.5 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving…' : isEditing ? 'Update asset' : 'Add asset'}
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

export default AssetForm;
