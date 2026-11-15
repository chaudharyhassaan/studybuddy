import { useState } from 'react';
import { List } from '@phosphor-icons/react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import Footer from '../components/Footer';
import Wordmark from '../components/Wordmark';

const navLinkClass = ({ isActive }) =>
  `flex h-10 items-center rounded-sm border-l-2 px-2 text-sm transition-colors duration-150 ${
    isActive
      ? 'border-accent bg-sunken font-semibold text-ink'
      : 'border-transparent text-ink-muted hover:bg-sunken hover:text-ink'
  }`;

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <div className="flex flex-1">
        <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
          <div className="flex h-16 items-center border-b border-border px-4">
            <Wordmark />
          </div>
          <nav aria-label="Main" className="flex-1 p-3">
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
          </nav>
          <div className="border-t border-border p-4">
            <p className="truncate text-sm font-semibold text-ink">{user?.name}</p>
            <p className="mt-1 truncate text-xs text-ink-muted">{user?.email}</p>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-sm border border-border-strong px-4 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:h-10"
            >
              Log out
            </button>
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-border bg-paper px-4 md:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Wordmark size="sm" className="md:hidden" />
              <span className="hidden text-sm font-semibold text-ink md:inline">Dashboard</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden max-w-40 truncate text-xs text-ink-muted sm:inline">
                {user?.name}
              </span>
              <button
                type="button"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
                aria-controls="mobile-nav"
                onClick={() => setMenuOpen((open) => !open)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-border-strong text-ink transition-colors duration-150 hover:bg-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:hidden"
              >
                <List size={20} aria-hidden="true" />
              </button>
            </div>
          </header>
          {menuOpen ? (
            <div id="mobile-nav" className="border-b border-border bg-surface px-4 py-4 md:hidden">
              <nav aria-label="Mobile" className="space-y-1">
                <NavLink
                  to="/dashboard"
                  className={navLinkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </NavLink>
              </nav>
              <div className="mt-4 border-t border-border pt-4">
                <p className="truncate text-sm font-semibold text-ink">{user?.name}</p>
                <p className="mt-1 truncate text-xs text-ink-muted">{user?.email}</p>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-sm border border-border-strong px-4 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Log out
                </button>
              </div>
            </div>
          ) : null}
          <main className="flex-1 px-4 py-8 md:px-6 lg:px-8">
            <div className="mx-auto max-w-content">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
