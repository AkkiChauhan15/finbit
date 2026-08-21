import { assetTypeLabels, assetTypes } from '../../constants/assets.js';
import FormField from '../FormField.jsx';

function AssetForm({ errors, isEditing, isSubmitting, onCancel, onChange, onSubmit, values }) {
  return (
    <section className="rounded-2xl border border-[#cbd7ce] bg-white shadow-soft p-5 sm:p-6">
      <h2 className="text-xl font-semibold text-[#161d19]">
        {isEditing ? 'Update asset' : 'Add an asset or investment'}
      </h2>
      <form
        className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
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
        <div>
          <label className="mb-2 block text-sm font-medium text-[#26352c]" htmlFor="asset-type">
            Type
          </label>
          <select
            id="asset-type"
            name="type"
            value={values.type}
            onChange={onChange}
            className="w-full rounded-lg border border-[#b9c8bd] bg-[#f4fbf4] px-3 py-2.5 text-[#161d19] outline-none focus:border-emerald-500"
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
            className="rounded-lg bg-[#00bc44] px-4 py-2.5 font-semibold text-[#161d19] hover:bg-[#18c950] disabled:opacity-50"
          >
            {isSubmitting ? 'Saving…' : isEditing ? 'Update asset' : 'Add asset'}
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

export default AssetForm;
