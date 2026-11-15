import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { getErrorMessage } from '../lib/api';
import { validateEmail, validateLogin, validateLoginPassword } from '../lib/validation';
import FormErrorSummary from '../components/FormErrorSummary';
import PrimaryButton from '../components/PrimaryButton';
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
    <div className="w-full max-w-auth rounded-md border border-border bg-surface p-6 md:p-8">
      <h1 className="font-display text-h1 font-semibold tracking-tight text-ink">Log in.</h1>
      <form noValidate onSubmit={handleSubmit} aria-busy={submitting} className="mt-6 space-y-5">
        <FormErrorSummary
          ref={summaryRef}
          message={formError || (submitCount > 0 && Object.keys(errors).length > 0 ? 'Check the fields below.' : '')}
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
      <p className="mt-6 text-sm text-ink-muted">
        New here?{' '}
        <Link
          to="/register"
          className="text-accent underline underline-offset-2 transition-colors duration-150 hover:text-accent-hover"
        >
          Create an account
        </Link>
        .
      </p>
    </div>
  );
}
