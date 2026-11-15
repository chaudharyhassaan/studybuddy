export const primaryButtonClass =
  'inline-flex h-11 items-center justify-center rounded-sm border border-accent bg-accent px-4 text-sm font-semibold text-on-accent transition-colors duration-150 hover:bg-accent-hover active:bg-accent-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:border-border disabled:bg-sunken disabled:text-ink-muted md:h-10';

export default function PrimaryButton({ className = '', ...props }) {
  return <button className={`${primaryButtonClass} ${className}`} {...props} />;
}
