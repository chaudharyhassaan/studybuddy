import { Link } from 'react-router-dom';
import Wordmark from './Wordmark';
import { textLinkClass } from './PrimaryButton';

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-content px-4 py-10 md:px-6 lg:px-10">
        <div className="flex flex-col gap-9 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Wordmark size="sm" />
            <p className="mt-4 text-sm text-ink-muted">
              A study planner for the weeks before an exam.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-col gap-3 text-sm">
            <p className="text-label font-semibold uppercase tracking-[0.14em] text-ink-muted">
              Read
            </p>
            <a href="/#how-it-works" className={textLinkClass}>
              How it works
            </a>
            <Link to="/terms" className={textLinkClass}>
              Terms
            </Link>
            <Link to="/privacy" className={textLinkClass}>
              Privacy
            </Link>
          </nav>

          <div className="max-w-xs">
            <p className="text-label font-semibold uppercase tracking-[0.14em] text-ink-muted">
              Project
            </p>
            <p className="mt-3 text-sm text-ink-muted">
              Built for the STEM2Connect AI Hackathon, Education track.
            </p>
          </div>
        </div>

        <div className="mt-9 flex flex-col gap-2 border-t border-border pt-5 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {currentYear} StudyBuddy Planner</p>
          <p>Plans, tasks and study tools stay on your account.</p>
        </div>
      </div>
    </footer>
  );
}
