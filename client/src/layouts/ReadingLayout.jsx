import { Link, Outlet } from 'react-router-dom';
import Footer from '../components/Footer';
import Wordmark from '../components/Wordmark';

export default function ReadingLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="border-b border-border bg-paper">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between px-4 md:px-6 lg:px-10">
          <Wordmark size="sm" />
          <Link
            to="/"
            className="text-sm text-ink-muted transition-colors duration-150 hover:text-ink"
          >
            Back to home
          </Link>
        </div>
      </header>
      <main className="flex-1 px-4 py-12 md:px-6 md:py-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
