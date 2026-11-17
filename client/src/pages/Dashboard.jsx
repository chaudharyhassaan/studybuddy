import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getErrorMessage } from '../lib/api';
import ProgressBar from '../components/ProgressBar';
import { primaryButtonClass } from '../components/PrimaryButton';
import { usePageTitle } from '../lib/usePageTitle';
import {
  currentWeekTasks,
  examLine,
  formatToday,
  plural,
  progressFor,
  todayIso,
} from '../lib/plans';

const checkboxClass =
  'mt-1 h-[18px] w-[18px] shrink-0 cursor-pointer rounded-xs accent-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60';

function SummaryStat({ label, value, context, className = '' }) {
  return (
    <div
      className={`border-t border-border p-4 first:border-t-0 sm:border-t-0 sm:border-l sm:first:border-l-0 ${className}`}
    >
      <p className="text-2xs font-semibold uppercase text-ink-muted">{label}</p>
      <p className="mt-1 font-display text-h1 font-semibold tabular-nums text-ink">{value}</p>
      <p className="mt-1 text-xs text-ink-muted">{context}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite">
      <div aria-hidden="true" className="h-8 w-56 rounded-sm bg-sunken motion-safe:animate-pulse" />
      <div
        aria-hidden="true"
        className="mt-2 h-3 w-44 rounded-sm bg-sunken motion-safe:animate-pulse"
      />
      <div
        aria-hidden="true"
        className="mt-8 grid overflow-hidden rounded-md border border-border bg-surface sm:grid-cols-3"
      >
        {[0, 1, 2].map((item) => (
          <div key={item} className="border-t border-border p-4 first:border-t-0 sm:border-t-0 sm:border-l sm:first:border-l-0">
            <div className="h-3 w-20 rounded-sm bg-sunken motion-safe:animate-pulse" />
            <div className="mt-3 h-7 w-24 rounded-sm bg-sunken motion-safe:animate-pulse" />
            <div className="mt-2 h-3 w-32 rounded-sm bg-sunken motion-safe:animate-pulse" />
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          {[0, 1].map((section) => (
            <div key={section}>
              <div className="h-6 w-28 rounded-sm bg-sunken motion-safe:animate-pulse" />
              <div className="mt-3 overflow-hidden rounded-md border border-border bg-surface">
                {[0, 1, 2].map((row) => (
                  <div key={row} className="border-t border-border px-4 py-4 first:border-t-0">
                    <div className="h-4 w-2/3 rounded-sm bg-sunken motion-safe:animate-pulse" />
                    <div className="mt-2 h-3 w-1/3 rounded-sm bg-sunken motion-safe:animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="xl:col-span-4">
          <div className="h-40 rounded-md border border-border bg-surface" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [plans, setPlans] = useState([]);
  const [streak, setStreak] = useState(0);
  const [lastStudyDate, setLastStudyDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [pendingTaskId, setPendingTaskId] = useState(null);

  usePageTitle('Your study');

  const loadDashboard = useCallback(async () => {
    try {
      const [plansResponse, meResponse] = await Promise.all([
        api.get('/plans'),
        api.get('/auth/me'),
      ]);

      const details = await Promise.all(
        plansResponse.data.plans.map((plan) => api.get(`/plans/${plan.id}`))
      );

      setPlans(
        details.map(({ data }) => ({
          plan: data.plan,
          tasks: data.tasks,
        }))
      );
      setStreak(meResponse.data.user.streak);
      setLastStudyDate(meResponse.data.user.lastStudyDate);
      setError('');
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Could not load your dashboard. Try again.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // State is only set after the requests resolve, not during this render.
    // oxlint-disable-next-line react/set-state-in-effect
    loadDashboard();
  }, [loadDashboard]);

  function handleRetry() {
    setLoading(true);
    setError('');
    loadDashboard();
  }

  async function toggleTask(taskId) {
    setPendingTaskId(taskId);
    setActionError('');

    try {
      const { data } = await api.patch(`/tasks/${taskId}/toggle`);

      setPlans((current) =>
        current.map(({ plan, tasks }) => ({
          plan,
          tasks: tasks.map((task) => (task.id === data.task.id ? data.task : task)),
        }))
      );
      setStreak(data.streak);

      if (data.task.completed) {
        setLastStudyDate(todayIso());
      }
    } catch (requestError) {
      setActionError(getErrorMessage(requestError, 'Could not update that task. Try again.'));
    } finally {
      setPendingTaskId(null);
    }
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  const today = todayIso();
  const allTasks = plans.flatMap(({ plan, tasks }) =>
    tasks.map((task) => ({ ...task, subject: plan.subject, planId: plan.id }))
  );
  const todayTasks = allTasks.filter((task) => task.date === today);
  const todayProgress = progressFor(todayTasks);
  const weekProgress = progressFor(currentWeekTasks(allTasks));
  const activePlan = plans[0]?.plan || null;
  const studiedToday =
    typeof lastStudyDate === 'string' && lastStudyDate.slice(0, 10) === today;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-h1 font-semibold tracking-tight text-ink">Your study</h1>
          <p className="mt-1 text-xs text-ink-muted">{formatToday()}</p>
        </div>
        {plans.length > 0 ? (
          <Link to="/plans/new" className={primaryButtonClass}>
            Create plan
          </Link>
        ) : null}
      </div>

      {error ? (
        <div
          role="alert"
          className="mt-8 rounded-md border border-border border-l-2 border-l-error bg-sunken px-4 py-3 text-sm text-error"
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
        <div className="mt-8 rounded-md border border-border bg-sunken p-6">
          <h2 className="font-display text-h2 font-semibold tracking-tight text-ink">
            No plans yet.
          </h2>
          <p className="mt-2 max-w-form text-sm text-ink-muted">
            Create a plan for your next exam and your schedule will appear here.
          </p>
          <Link to="/plans/new" className={`${primaryButtonClass} mt-6`}>
            Create plan
          </Link>
        </div>
      ) : (
        <>
          <section aria-label="Summary" className="mt-8 grid overflow-hidden rounded-md border border-border bg-surface sm:grid-cols-3">
            <SummaryStat
              label="Streak"
              value={plural(streak, 'day')}
              context={
                streak === 0
                  ? 'Complete a task to start a streak.'
                  : studiedToday
                    ? 'Completed a task today.'
                    : 'Complete a task today to extend it.'
              }
            />
            <SummaryStat
              label="Due today"
              value={todayTasks.length}
              context={
                todayTasks.length === 0
                  ? 'Nothing due today.'
                  : `${todayProgress.completed} of ${todayTasks.length} complete`
              }
            />
            <SummaryStat
              label="Active plans"
              value={plans.length}
              context="Study plans saved to your account."
            />
          </section>

          {actionError ? (
            <div
              role="alert"
              className="mt-6 rounded-md border border-border border-l-2 border-l-error bg-sunken px-4 py-3 text-sm text-error"
            >
              {actionError}
            </div>
          ) : null}

          <div className="mt-6 grid gap-6 xl:grid-cols-12">
            <div className="space-y-6 xl:col-span-8">
              <section aria-labelledby="today-heading">
                <h2
                  id="today-heading"
                  className="font-display text-h2 font-semibold tracking-tight text-ink"
                >
                  Today
                </h2>
                {todayTasks.length === 0 ? (
                  <div className="mt-3 rounded-md border border-border bg-sunken p-5">
                    <p className="text-sm font-semibold text-ink">No tasks due today.</p>
                    {activePlan ? (
                      <Link
                        to={`/plans/${activePlan.id}`}
                        className="mt-2 inline-block text-sm text-ink-muted underline underline-offset-2 transition-colors duration-150 hover:text-ink"
                      >
                        Open {activePlan.subject}
                      </Link>
                    ) : null}
                  </div>
                ) : (
                  <ul className="mt-3 overflow-hidden rounded-md border border-border bg-surface">
                    {todayTasks.map((task) => (
                      <li
                        key={task.id}
                        className="flex items-start gap-3 border-t border-border px-4 py-3 first:border-t-0"
                      >
                        <input
                          id={`today-task-${task.id}`}
                          type="checkbox"
                          checked={task.completed}
                          disabled={pendingTaskId === task.id}
                          onChange={() => toggleTask(task.id)}
                          className={checkboxClass}
                        />
                        <div className="min-w-0 flex-1">
                          <label
                            htmlFor={`today-task-${task.id}`}
                            className="block text-sm text-ink"
                          >
                            {task.description}
                          </label>
                          <p className="mt-1 text-xs text-ink-muted">
                            {task.subject}, {task.topic}
                          </p>
                        </div>
                        {task.completed ? (
                          <span className="shrink-0 rounded-xs border border-success px-2 py-1 text-2xs font-semibold text-success">
                            Complete
                          </span>
                        ) : null}
                        <Link
                          to={`/plans/${task.planId}`}
                          className="shrink-0 text-xs text-ink-muted underline underline-offset-2 transition-colors duration-150 hover:text-ink"
                        >
                          Open plan
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section aria-labelledby="plans-heading">
                <h2
                  id="plans-heading"
                  className="font-display text-h2 font-semibold tracking-tight text-ink"
                >
                  Your plans
                </h2>
                <ul className="mt-3 overflow-hidden rounded-md border border-border bg-surface">
                  {plans.map(({ plan, tasks }) => {
                    const progress = progressFor(tasks);

                    return (
                      <li
                        key={plan.id}
                        className="border-t border-border px-4 py-4 first:border-t-0"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="font-display text-h3 font-semibold text-ink">
                              {plan.subject}
                            </h3>
                            <p className="mt-1 text-xs text-ink-muted">
                              {examLine(plan.examDate)}
                            </p>
                          </div>
                          <Link
                            to={`/plans/${plan.id}`}
                            className="shrink-0 text-sm text-ink-muted underline underline-offset-2 transition-colors duration-150 hover:text-ink"
                          >
                            Open plan
                          </Link>
                        </div>
                        <div className="mt-3">
                          <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs text-ink-muted">
                            <span>
                              {progress.completed} of {progress.total} tasks complete
                            </span>
                            <span className="font-semibold text-ink">{progress.percentage}%</span>
                          </div>
                          <ProgressBar
                            value={progress.percentage}
                            label={`${plan.subject} progress`}
                            className="mt-2"
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </div>

            <aside className="xl:col-span-4">
              <div className="rounded-md border border-border bg-surface p-5">
                <h2 className="font-display text-h2 font-semibold tracking-tight text-ink">
                  This week
                </h2>
                {weekProgress.total === 0 ? (
                  <p className="mt-2 text-sm text-ink-muted">No tasks scheduled this week.</p>
                ) : (
                  <>
                    <p className="mt-2 text-sm text-ink">
                      {weekProgress.completed} of {weekProgress.total} tasks complete
                    </p>
                    <ProgressBar
                      value={weekProgress.percentage}
                      label="This week progress"
                      className="mt-3"
                    />
                    <p className="mt-2 text-xs text-ink-muted">
                      {weekProgress.percentage}% of this week's work.
                    </p>
                  </>
                )}
                {activePlan ? (
                  <Link
                    to={`/plans/${activePlan.id}`}
                    className="mt-4 inline-block text-sm text-ink-muted underline underline-offset-2 transition-colors duration-150 hover:text-ink"
                  >
                    Open {activePlan.subject}
                  </Link>
                ) : null}
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
