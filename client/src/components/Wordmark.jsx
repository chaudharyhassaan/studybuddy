import { Link } from 'react-router-dom';
import LogoMark from './LogoMark';

export default function Wordmark({ size = 'md', className = '' }) {
  const markClass = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';
  const nameClass = size === 'sm' ? 'text-lg' : 'text-h3';

  return (
    <Link
      to="/"
      aria-label="StudyBuddy Planner, home"
      className={`inline-flex items-center gap-2.5 text-ink ${className}`}
    >
      <LogoMark className={`${markClass} shrink-0 text-accent`} />
      <span className="flex flex-col leading-none">
        <span className={`font-display ${nameClass} font-semibold tracking-tight`}>StudyBuddy</span>
        <span className="mt-1 text-label font-semibold uppercase tracking-[0.16em] text-ink-muted">
          Planner
        </span>
      </span>
    </Link>
  );
}
