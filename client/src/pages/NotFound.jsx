import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { primaryButtonClass } from '../components/PrimaryButton';
import { usePageTitle } from '../lib/usePageTitle';

export default function NotFound() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  usePageTitle('Page not found');

  return (
    <div className="mx-auto flex max-w-[480px] flex-col items-center px-4 py-24 text-center">
      <p className="font-display text-display font-semibold text-ink-muted">404</p>
      <h1 className="mt-4 font-display text-h1 font-semibold tracking-tight text-ink">
        Page not found.
      </h1>
      <p className="mt-3 text-base text-ink-muted">
        This page does not exist. Check the address or go back to your dashboard.
      </p>
      <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
        {loading ? null : user ? (
          <Link to="/dashboard" className={primaryButtonClass}>
            Go to dashboard
          </Link>
        ) : (
          <Link to="/" className={primaryButtonClass}>
            Go to home
          </Link>
        )}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="h-11 px-2 text-sm text-ink-muted underline underline-offset-2 transition-colors duration-150 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Back
        </button>
      </div>
    </div>
  );
}
