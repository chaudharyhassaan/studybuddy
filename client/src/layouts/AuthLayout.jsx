import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import Footer from '../components/Footer';
import RouteSkeleton from '../components/RouteSkeleton';
import Wordmark from '../components/Wordmark';

export default function AuthLayout() {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();

  if (loading) {
    return <RouteSkeleton />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const isLogin = pathname === '/login';

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="border-b border-border bg-paper">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between px-4 md:px-6 lg:px-10">
          <Wordmark size="sm" />
          <Link
            to={isLogin ? '/register' : '/login'}
            className="text-sm text-ink-muted transition-colors duration-150 hover:text-ink"
          >
            {isLogin ? 'Create an account' : 'Log in'}
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 py-12 md:px-6 md:py-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
