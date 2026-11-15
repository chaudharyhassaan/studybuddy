import { Link } from 'react-router-dom';

export default function Wordmark({ size = 'md', className = '' }) {
  const sizeClass = size === 'sm' ? 'text-lg' : 'text-h3';

  return (
    <Link
      to="/"
      className={`font-display ${sizeClass} font-semibold tracking-tight text-ink ${className}`}
    >
      StudyBuddy
    </Link>
  );
}
