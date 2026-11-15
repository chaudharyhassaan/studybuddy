import { Link } from 'react-router-dom';

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="border-t border-border bg-paper">
      <div className="mx-auto flex max-w-content flex-col gap-6 px-4 py-8 md:flex-row md:items-start md:justify-between md:px-6 lg:px-10">
        <div>
          <p className="font-display text-lg font-semibold tracking-tight text-ink">StudyBuddy</p>
          <p className="mt-1 text-sm text-ink-muted">
            A study planner for the weeks before an exam.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <a
            href="/#how-it-works"
            className="text-ink-muted transition-colors duration-150 hover:text-ink"
          >
            How it works
          </a>
          <Link
            to="/terms"
            className="text-ink-muted transition-colors duration-150 hover:text-ink"
          >
            Terms
          </Link>
          <Link
            to="/privacy"
            className="text-ink-muted transition-colors duration-150 hover:text-ink"
          >
            Privacy
          </Link>
        </nav>
        <p className="text-xs text-ink-muted">&copy; {currentYear} StudyBuddy Planner</p>
      </div>
    </footer>
  );
}
