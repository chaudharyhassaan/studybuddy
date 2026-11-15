import { useCallback, useEffect, useState } from 'react';
import { api, getErrorMessage } from '../lib/api';

function formatToday() {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatExamDate(value) {
  const date = new Date(`${value}T00:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function formatCount(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export default function Dashboard() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPlans = useCallback(() => {
    return api
      .get('/plans')
      .then(({ data }) => {
        setPlans(Array.isArray(data.plans) ? data.plans : []);
        setError('');
      })
      .catch((requestError) => {
        setError(getErrorMessage(requestError, 'Could not load your plans. Try again.'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  function handleRetry() {
    setLoading(true);
    setError('');
    fetchPlans();
  }

  return (
    <div>
      <div>
        <h1 className="font-display text-h1 font-semibold tracking-tight text-ink">Your study</h1>
        <p className="mt-1 text-xs text-ink-muted">{formatToday()}</p>
      </div>
      <section className="mt-8" aria-labelledby="plans-heading">
        <h2 id="plans-heading" className="font-display text-h2 font-semibold tracking-tight text-ink">
          Your plans
        </h2>
        {loading ? (
          <div
            aria-busy="true"
            aria-live="polite"
            className="mt-4 overflow-hidden rounded-md border border-border bg-surface"
          >
            {[0, 1, 2].map((row) => (
              <div key={row} className="border-t border-border px-5 py-4 first:border-t-0">
                <div
                  aria-hidden="true"
                  className="h-5 w-40 rounded-sm bg-sunken motion-safe:animate-pulse"
                />
                <div
                  aria-hidden="true"
                  className="mt-3 h-4 w-64 max-w-full rounded-sm bg-sunken motion-safe:animate-pulse"
                />
              </div>
            ))}
          </div>
        ) : error ? (
          <div
            role="alert"
            className="mt-4 rounded-md border border-border border-l-2 border-l-error bg-sunken px-4 py-3 text-sm text-error"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="mt-2 text-sm font-semibold underline underline-offset-2 transition-colors duration-150 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Try again
            </button>
          </div>
        ) : plans.length === 0 ? (
          <div className="mt-4 rounded-md border border-border bg-sunken p-6">
            <h3 className="font-display text-h3 font-semibold text-ink">No plans yet.</h3>
            <p className="mt-2 max-w-form text-sm text-ink-muted">
              Create a plan for your next exam and your schedule will appear here.
            </p>
          </div>
        ) : (
          <ul className="mt-4 overflow-hidden rounded-md border border-border bg-surface">
            {plans.map((plan) => (
              <li key={plan.id} className="border-t border-border px-5 py-4 first:border-t-0">
                <h3 className="font-display text-h3 font-semibold text-ink">{plan.subject}</h3>
                <p className="mt-1 text-sm text-ink-muted">
                  Exam on {formatExamDate(plan.examDate)},{' '}
                  {formatCount(plan.topics.length, 'topic')},{' '}
                  {formatCount(plan.hoursPerDay, 'hour')} per day
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
