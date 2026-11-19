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
  maxLength,
  step,
  required = false,
}) {
  const describedBy =
    [error ? `${id}-error` : null, helper && !error ? `${id}-helper` : null]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 flex items-baseline justify-between gap-3 text-xs font-semibold text-ink"
      >
        <span>{label}</span>
        {required ? (
          <span className="text-label font-semibold uppercase tracking-[0.12em] text-ink-muted">
            Required
          </span>
        ) : null}
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
        maxLength={maxLength}
        step={step}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        className={`block h-11 w-full rounded-sm border bg-surface px-3 text-base text-ink placeholder:text-ink-muted transition-colors duration-150 hover:border-ink-muted focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:border-border disabled:bg-sunken disabled:text-ink-muted md:h-10 ${
          error ? 'border-error' : 'border-border-strong'
        }`}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-xs text-error">
          {error}
        </p>
      ) : null}
      {helper && !error ? (
        <p id={`${id}-helper`} className="mt-2 text-xs text-ink-muted">
          {helper}
        </p>
      ) : null}
    </div>
  );
}
