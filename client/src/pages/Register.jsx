import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { getErrorMessage } from '../lib/api';
import { validateEmail, validateName, validateNewPassword, validateRegister } from '../lib/validation';
import { usePageTitle } from '../lib/usePageTitle';
import FormErrorSummary from '../components/FormErrorSummary';
import PrimaryButton from '../components/PrimaryButton';
import TextField from '../components/TextField';

const fieldValidators = {
  name: validateName,
  email: validateEmail,
  password: validateNewPassword,
};

const noteItems = [
  'A daily schedule from today to exam day',
  'Quizzes and flashcards for your topics',
  'Progress and a streak based on completed tasks',
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const [focusRequest, setFocusRequest] = useState(0);
  const summaryRef = useRef(null);

  usePageTitle('Create your account');

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
    const nextErrors = validateRegister(values);
    setErrors(nextErrors);
    setSubmitCount((count) => count + 1);
    setFocusRequest((count) => count + 1);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      await register({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (error) {
      setFormError(getErrorMessage(error, 'Could not create your account. Try again.'));
      setFocusRequest((count) => count + 1);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid w-full max-w-auth overflow-hidden rounded-md border border-border lg:max-w-[780px] lg:grid-cols-[420px_360px]">
      <div className="bg-surface p-6 md:p-8">
        <h1 className="font-display text-h1 font-semibold tracking-tight text-ink">
          Create your account.
        </h1>
        <form noValidate onSubmit={handleSubmit} aria-busy={submitting} className="mt-6 space-y-5">
          <FormErrorSummary
            ref={summaryRef}
            message={
              formError ||
              (submitCount > 0 && Object.values(errors).some(Boolean) ? 'Check the fields below.' : '')
            }
            errors={submitCount > 0 ? errors : {}}
          />
          <TextField
            id="name"
            label="Name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.name}
            autoComplete="name"
            required
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
            helper="At least 8 characters."
            autoComplete="new-password"
            required
          />
          <PrimaryButton type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Creating account' : 'Create account'}
          </PrimaryButton>
        </form>
        <p className="mt-6 text-sm text-ink-muted">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-accent underline underline-offset-2 transition-colors duration-150 hover:text-accent-hover"
          >
            Log in
          </Link>
          .
        </p>
        <p className="mt-3 text-xs text-ink-muted">
          By creating an account you agree to the{' '}
          <Link
            to="/terms"
            className="text-accent underline underline-offset-2 transition-colors duration-150 hover:text-accent-hover"
          >
            Terms
          </Link>{' '}
          and{' '}
          <Link
            to="/privacy"
            className="text-accent underline underline-offset-2 transition-colors duration-150 hover:text-accent-hover"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
      <aside className="hidden border-l border-border bg-sunken p-8 lg:block">
        <h2 className="font-display text-h2 font-semibold tracking-tight text-ink">What you get.</h2>
        <ul className="mt-4">
          {noteItems.map((item) => (
            <li key={item} className="border-t border-border py-4 text-sm text-ink-muted first:border-t-0 first:pt-0">
              {item}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
