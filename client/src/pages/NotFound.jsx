import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { primaryButtonClass, quietButtonClass } from '../components/PrimaryButton';
import { usePageTitle } from '../lib/usePageTitle';

export default function NotFound() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  usePageTitle('Page not found');

  return (
    <div className="mx-auto max-w-[560px] px-4 py-20 md:px-6 md:py-28">
      <p className="eyebrow">Page not found</p>
      <p className="mt-6 font-display text-display italic text-ink-muted">404</p>
      <h1 className="mt-4 font-display text-title font-semibold text-ink">
        This page does not exist.
      </h1>
      <p className="mt-4 max-w-form text-base text-ink-muted">
        Check the address, or go back to the part of StudyBuddy you were using.
      </p>
      <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        {loading ? null : user ? (
          <Link to="/dashboard" className={primaryButtonClass}>
            Go to dashboard
          </Link>
        ) : (
          <Link to="/" className={primaryButtonClass}>
            Go to home
          </Link>
        )}
        <button type="button" onClick={() => navigate(-1)} className={quietButtonClass}>
          Back
        </button>
      </div>
    </div>
  );
}
