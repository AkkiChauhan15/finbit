function FormField({ error, id, label, ...inputProps }) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-lg border bg-slate-950 px-3 py-2.5 text-white outline-none transition placeholder:text-slate-600 focus:ring-2 ${
          error
            ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
            : 'border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20'
        }`}
        {...inputProps}
      />
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}

export default FormField;
