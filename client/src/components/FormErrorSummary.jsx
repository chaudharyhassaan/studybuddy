import { forwardRef } from 'react';

const FormErrorSummary = forwardRef(function FormErrorSummary({ message, errors = {} }, ref) {
  const entries = Object.entries(errors).filter(([, text]) => Boolean(text));

  if (!message && entries.length === 0) {
    return null;
  }

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      className="mb-6 rounded-md border border-border border-l-2 border-l-error bg-sunken px-4 py-3 text-sm text-error"
    >
      <p className="font-semibold">{message || 'Check the fields below.'}</p>
      {entries.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {entries.map(([field, text]) => (
            <li key={field}>
              <a href={`#${field}`} className="underline underline-offset-2">
                {text}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
});

export default FormErrorSummary;
