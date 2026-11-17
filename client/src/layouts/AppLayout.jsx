import { useState } from 'react';
import { GearSix, List, PlusSquare, SignOut, SquaresFour } from '@phosphor-icons/react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import Footer from '../components/Footer';
import Wordmark from '../components/Wordmark';
import { secondaryButtonClass } from '../components/PrimaryButton';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: SquaresFour },
  { to: '/plans/new', label: 'Create plan', icon: PlusSquare },
  { to: '/settings', label: 'Settings', icon: GearSix },
];

const navLinkClass = ({ isActive }) =>
  `flex h-10 items-center gap-2.5 rounded-sm border-l-2 px-2.5 text-sm transition-colors duration-150 ${
    isActive
      ? 'border-accent bg-accent-wash font-semibold text-ink'
      : 'border-transparent text-ink-muted hover:bg-sunken hover:text-ink'
  }`;

function headerTitle(pathname) {
  if (pathname === '/plans/new') {
    return 'Create plan';
  }

  if (pathname === '/settings') {
    return 'Settings';
  }

  if (pathname.startsWith('/plans/')) {
    return 'Plan';
  }

  return 'Dashboard';
}

function initials(name) {
  return name?.trim()?.charAt(0)?.toUpperCase() || 'S';
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const pageTitle = headerTitle(pathname);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <div className="flex flex-1">
        <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
          <div className="flex h-16 items-center border-b border-border px-4">
            <Wordmark size="sm" />
          </div>
          <nav aria-label="Main" className="flex-1 space-y-1 p-3">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={navLinkClass}>
                <Icon size={18} aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-border bg-accent-soft font-display text-sm font-semibold text-accent"
              >
                {initials(user?.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{user?.name}</p>
                <p className="mt-0.5 truncate text-xs text-ink-muted">{user?.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className={`${secondaryButtonClass} mt-4 w-full`}
            >
              <SignOut size={16} aria-hidden="true" className="mr-2" />
              Log out
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-border bg-paper px-4 md:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <Wordmark size="sm" className="md:hidden" />
              <div className="hidden min-w-0 md:block">
                <p className="text-label font-semibold uppercase tracking-[0.14em] text-ink-muted">
                  StudyBuddy Planner
                </p>
                <p className="truncate font-display text-h3 font-semibold text-ink">{pageTitle}</p>
              </div>
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
                className="pressable inline-flex h-11 w-11 items-center justify-center rounded-sm border border-border-strong bg-surface text-ink hover:bg-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:hidden"
              >
                <List size={20} aria-hidden="true" />
              </button>
            </div>
          </header>

          {menuOpen ? (
            <div
              id="mobile-nav"
              className="border-b border-border bg-surface px-4 py-4 md:hidden"
            >
              <nav aria-label="Mobile" className="space-y-1">
                {navItems.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={navLinkClass}
                    onClick={() => setMenuOpen(false)}
                  >
                    <Icon size={18} aria-hidden="true" />
                    {label}
                  </NavLink>
                ))}
              </nav>
              <div className="mt-4 border-t border-border pt-4">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-border bg-accent-soft font-display text-sm font-semibold text-accent"
                  >
                    {initials(user?.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{user?.name}</p>
                    <p className="mt-0.5 truncate text-xs text-ink-muted">{user?.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={`${secondaryButtonClass} mt-4 w-full`}
                >
                  <SignOut size={16} aria-hidden="true" className="mr-2" />
                  Log out
                </button>
              </div>
            </div>
          ) : null}

          <main className="flex-1 px-4 py-8 md:px-6 md:py-10 lg:px-10">
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
