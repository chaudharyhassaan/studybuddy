import { Link } from 'react-router-dom';
import LogoMark from './LogoMark';

export default function Wordmark({ size = 'md', className = '' }) {
  const markClass = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';
  const nameClass = size === 'sm' ? 'text-lg' : 'text-h3';

  return (
    <Link
      to="/"
      aria-label="StudyBuddy, home"
      className={`inline-flex items-center gap-2.5 text-ink ${className}`}
    >
      <LogoMark className={`${markClass} shrink-0 text-accent`} />
      <span className={`font-display ${nameClass} font-semibold tracking-tight`}>StudyBuddy</span>
    </Link>
  );
}
