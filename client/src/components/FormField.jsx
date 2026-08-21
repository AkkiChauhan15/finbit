function FormField({ error, id, label, ...inputProps }) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#26352c]" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-[#161d19] outline-none transition placeholder:text-[#87938b] focus:ring-4 ${
          error
            ? 'border-[#ba1a1a] focus:border-[#ba1a1a] focus:ring-[#ba1a1a]/10'
            : 'border-[#b9c8bd] focus:border-[#4648d4] focus:ring-[#4648d4]/10'
        }`}
        {...inputProps}
      />
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-[#a43a3a]">
          {error}
        </p>
      )}
    </div>
  );
}

export default FormField;
