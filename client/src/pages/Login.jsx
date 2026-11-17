import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { getErrorMessage } from '../lib/api';
import { validateEmail, validateLogin, validateLoginPassword } from '../lib/validation';
import { usePageTitle } from '../lib/usePageTitle';
import FormErrorSummary from '../components/FormErrorSummary';
import LogoMark from '../components/LogoMark';
import PrimaryButton, { accentLinkClass } from '../components/PrimaryButton';
import TextField from '../components/TextField';

const fieldValidators = {
  email: validateEmail,
  password: validateLoginPassword,
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const [focusRequest, setFocusRequest] = useState(0);
  const summaryRef = useRef(null);

  usePageTitle('Log in');

  useEffect(() => {
    if (focusRequest > 0 && summaryRef.current) {
      summaryRef.current.focus();
    }
  }, [focusRequest]);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    setFormError('');

    if (errors[name]) {
      setErrors((previous) => ({ ...previous, [name]: fieldValidators[name](value) }));
    }
  }

  function handleBlur(event) {
    const { name, value } = event.target;
    setErrors((previous) => ({ ...previous, [name]: fieldValidators[name](value) }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    setSubmitCount((count) => count + 1);
    setFocusRequest((count) => count + 1);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      await login({ email: values.email.trim(), password: values.password });
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (error) {
      setFormError(getErrorMessage(error, 'Could not log you in. Try again.'));
      setFocusRequest((count) => count + 1);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-auth overflow-hidden rounded-lg border border-border bg-surface">
      <div className="h-0.5 bg-accent" />
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-3">
          <LogoMark className="h-8 w-8 text-accent" />
          <p className="text-label font-semibold uppercase tracking-[0.14em] text-ink-muted">
            Welcome back
          </p>
        </div>
        <h1 className="mt-4 font-display text-title font-semibold text-ink">Log in.</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Open your schedule and pick up where you left off.
        </p>

        <form noValidate onSubmit={handleSubmit} aria-busy={submitting} className="mt-7 space-y-5">
          <FormErrorSummary
            ref={summaryRef}
            message={
              formError ||
              (submitCount > 0 && Object.values(errors).some(Boolean)
                ? 'Check the fields below.'
                : '')
            }
            errors={submitCount > 0 ? errors : {}}
          />
          <TextField
            id="email"
            label="Email"
            type="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email}
            autoComplete="email"
            required
          />
          <TextField
            id="password"
            label="Password"
            type="password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.password}
            autoComplete="current-password"
            required
          />
          <PrimaryButton type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Logging in' : 'Log in'}
          </PrimaryButton>
        </form>

        <p className="mt-7 border-t border-border pt-5 text-sm text-ink-muted">
          New here?{' '}
          <Link to="/register" className={accentLinkClass}>
            Create an account
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
