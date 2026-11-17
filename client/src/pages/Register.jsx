import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { getErrorMessage } from '../lib/api';
import { validateEmail, validateName, validateNewPassword, validateRegister } from '../lib/validation';
import { usePageTitle } from '../lib/usePageTitle';
import FormErrorSummary from '../components/FormErrorSummary';
import LogoMark from '../components/LogoMark';
import PrimaryButton, { accentLinkClass } from '../components/PrimaryButton';
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
    <div className="grid w-full max-w-auth overflow-hidden rounded-lg border border-border bg-surface lg:max-w-[820px] lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="h-0.5 bg-accent lg:col-span-2" />
      <div className="p-6 md:p-8">
        <p className="eyebrow">New account</p>
        <h1 className="mt-4 font-display text-title font-semibold text-ink">
          Create your account.
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Start with one subject and a date. The plan is built from there.
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

        <p className="mt-7 border-t border-border pt-5 text-sm text-ink-muted">
          Already have an account?{' '}
          <Link to="/login" className={accentLinkClass}>
            Log in
          </Link>
          .
        </p>
        <p className="mt-3 text-xs text-ink-muted">
          By creating an account you agree to the{' '}
          <Link to="/terms" className={accentLinkClass}>
            Terms
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className={accentLinkClass}>
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      <aside className="hidden border-l border-border bg-sunken p-8 lg:flex lg:flex-col">
        <LogoMark className="h-9 w-9 text-accent" />
        <h2 className="mt-6 font-display text-h2 font-semibold text-ink">What you get.</h2>
        <ol className="mt-5 divide-y divide-border border-t border-border">
          {noteItems.map((item, index) => (
            <li key={item} className="flex gap-4 py-4">
              <span className="font-display text-sm font-semibold tabular-nums text-accent">
                {String(index + 1).padStart(2, '0')}
              </span>
              <p className="text-sm text-ink-muted">{item}</p>
            </li>
          ))}
        </ol>
        <p className="mt-auto border-t border-border pt-5 text-xs text-ink-muted">
          You can delete your account at any time in Settings.
        </p>
      </aside>
    </div>
  );
}
