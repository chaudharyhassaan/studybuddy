import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';
import MarketingLayout from './layouts/MarketingLayout';
import ReadingLayout from './layouts/ReadingLayout';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Privacy from './pages/Privacy';
import Register from './pages/Register';
import Settings from './pages/Settings';
import Terms from './pages/Terms';

const CreatePlan = lazy(() => import('./pages/CreatePlan'));
const PlanDetail = lazy(() => import('./pages/PlanDetail'));

function PageFallback() {
  return (
    <div aria-busy="true" aria-live="polite">
      <div aria-hidden="true" className="h-8 w-56 rounded-sm bg-sunken motion-safe:animate-pulse" />
      <div
        aria-hidden="true"
        className="mt-3 h-4 w-72 max-w-full rounded-sm bg-sunken motion-safe:animate-pulse"
      />
      <div
        aria-hidden="true"
        className="mt-8 h-64 w-full rounded-md border border-border bg-surface"
      />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route
            path="/plans/new"
            element={
              <Suspense fallback={<PageFallback />}>
                <CreatePlan />
              </Suspense>
            }
          />
          <Route
            path="/plans/:id"
            element={
              <Suspense fallback={<PageFallback />}>
                <PlanDetail />
              </Suspense>
            }
          />
        </Route>
      </Route>
      <Route element={<ReadingLayout />}>
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
      </Route>
    </Routes>
  );
}
