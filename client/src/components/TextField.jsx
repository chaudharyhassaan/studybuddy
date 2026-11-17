export default function TextField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  helper,
  autoComplete,
  placeholder,
  min,
  max,
  step,
  required = false,
}) {
  const describedBy =
    [error ? `${id}-error` : null, helper && !error ? `${id}-helper` : null]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-xs font-semibold text-ink">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        autoComplete={autoComplete}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        className={`block h-11 w-full rounded-sm border bg-surface px-3 text-base text-ink placeholder:text-ink-muted transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:h-10 ${
          error ? 'border-error' : 'border-border-strong'
        }`}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-xs text-error">
          {error}
        </p>
      ) : null}
      {helper && !error ? (
        <p id={`${id}-helper`} className="mt-2 text-2xs text-ink-muted">
          {helper}
        </p>
      ) : null}
    </div>
  );
}
