import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import RouteSkeleton from './components/RouteSkeleton';
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';
import MarketingLayout from './layouts/MarketingLayout';
import ReadingLayout from './layouts/ReadingLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Privacy from './pages/Privacy';
import Register from './pages/Register';
import Terms from './pages/Terms';

function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <RouteSkeleton />;
  }

  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Route>
      <Route element={<ReadingLayout />}>
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
      </Route>
      <Route element={<MarketingLayout />}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
