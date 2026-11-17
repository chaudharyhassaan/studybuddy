export const primaryButtonClass =
  'pressable inline-flex h-11 select-none items-center justify-center rounded-sm border border-accent bg-accent px-4 text-sm font-semibold text-on-accent hover:bg-accent-hover active:bg-accent-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:border-border disabled:bg-sunken disabled:text-ink-muted md:h-10';

export const secondaryButtonClass =
  'pressable inline-flex h-11 select-none items-center justify-center rounded-sm border border-border-strong bg-surface px-4 text-sm font-semibold text-ink hover:bg-sunken active:bg-sunken-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:border-border disabled:bg-sunken disabled:text-ink-muted md:h-10';

export const destructiveButtonClass =
  'pressable inline-flex h-11 select-none items-center justify-center rounded-sm border border-error bg-error px-4 text-sm font-semibold text-on-accent hover:bg-error-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:border-border disabled:bg-sunken disabled:text-ink-muted md:h-10';

export const quietButtonClass =
  'inline-flex h-11 items-center px-1 text-sm text-ink-muted transition-colors duration-150 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

export const textLinkClass =
  'text-ink-muted underline decoration-border-strong underline-offset-2 transition-colors duration-150 hover:text-ink hover:decoration-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

export const accentLinkClass =
  'text-accent underline decoration-border-strong underline-offset-2 transition-colors duration-150 hover:text-accent-hover hover:decoration-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

export default function PrimaryButton({ className = '', ...props }) {
  return <button className={`${primaryButtonClass} ${className}`} {...props} />;
}
