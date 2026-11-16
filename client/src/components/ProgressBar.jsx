export default function ProgressBar({ value, label, tone = 'accent', className = '' }) {
  const percentage = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percentage}
      aria-label={label}
      className={`h-2 overflow-hidden rounded-sm border border-border bg-sunken ${className}`}
    >
      <div
        className={`h-full ${tone === 'success' ? 'bg-success' : 'bg-accent'}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
