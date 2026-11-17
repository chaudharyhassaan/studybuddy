import { useState } from 'react';
import { List } from '@phosphor-icons/react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import Footer from '../components/Footer';
import Wordmark from '../components/Wordmark';

const navLinkClass =
  'inline-flex h-11 items-center text-sm text-ink-muted transition-colors duration-150 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

export default function MarketingLayout() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const accountHref = user ? '/dashboard' : '/login';
  const accountLabel = user ? 'Dashboard' : 'Log in';

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="border-b border-border bg-paper">
        <div className="h-0.5 bg-accent" />
        <div className="mx-auto flex h-16 max-w-content items-center justify-between px-4 md:px-6 lg:px-10">
          <Wordmark size="sm" />
          <nav aria-label="Main" className="hidden items-center gap-7 md:flex">
            <a href="/#how-it-works" className={navLinkClass}>
              How it works
            </a>
            <Link to={accountHref} className={navLinkClass}>
              {accountLabel}
            </Link>
          </nav>
          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="marketing-nav"
            onClick={() => setMenuOpen((open) => !open)}
            className="pressable inline-flex h-11 w-11 items-center justify-center rounded-sm border border-border-strong bg-surface text-ink hover:bg-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:hidden"
          >
            <List size={20} aria-hidden="true" />
          </button>
        </div>
        {menuOpen ? (
          <div
            id="marketing-nav"
            className="border-t border-border bg-surface px-4 py-2 md:hidden"
          >
            <nav aria-label="Mobile" className="divide-y divide-border">
              <a
                href="/#how-it-works"
                onClick={() => setMenuOpen(false)}
                className="flex h-12 items-center text-sm text-ink-muted transition-colors duration-150 hover:text-ink"
              >
                How it works
              </a>
              <Link
                to={accountHref}
                onClick={() => setMenuOpen(false)}
                className="flex h-12 items-center text-sm text-ink-muted transition-colors duration-150 hover:text-ink"
              >
                {accountLabel}
              </Link>
            </nav>
          </div>
        ) : null}
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
