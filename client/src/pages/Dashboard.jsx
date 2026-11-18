import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getErrorMessage } from '../lib/api';
import ProgressBar from '../components/ProgressBar';
import { primaryButtonClass, textLinkClass } from '../components/PrimaryButton';
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

function SummaryStat({ label, value, context, emphasis = false, className = '' }) {
  return (
    <div
      className={`border-t border-border p-5 first:border-t-0 sm:border-t-0 sm:border-l sm:first:border-l-0 ${
        emphasis ? 'bg-accent-wash' : ''
      } ${className}`}
    >
      <p className="text-label font-semibold uppercase tracking-[0.14em] text-ink-muted">{label}</p>
      <p className="mt-2 font-display text-stat font-semibold tabular-nums text-ink">{value}</p>
      <p className="mt-2 text-xs text-ink-muted">{context}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite">
      <div aria-hidden="true" className="h-3 w-24 rounded-sm bg-sunken motion-safe:animate-pulse" />
      <div
        aria-hidden="true"
        className="mt-3 h-8 w-56 rounded-sm bg-sunken motion-safe:animate-pulse"
      />
      <div
        aria-hidden="true"
        className="mt-2 h-3 w-44 rounded-sm bg-sunken motion-safe:animate-pulse"
      />
      <div
        aria-hidden="true"
        className="mt-8 grid overflow-hidden rounded-lg border border-border bg-surface sm:grid-cols-3"
      >
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="border-t border-border p-5 first:border-t-0 sm:border-t-0 sm:border-l sm:first:border-l-0"
          >
            <div className="h-3 w-20 rounded-sm bg-sunken motion-safe:animate-pulse" />
            <div className="mt-3 h-8 w-24 rounded-sm bg-sunken motion-safe:animate-pulse" />
            <div className="mt-2 h-3 w-32 rounded-sm bg-sunken motion-safe:animate-pulse" />
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          {[0, 1].map((section) => (
            <div key={section}>
              <div className="h-6 w-28 rounded-sm bg-sunken motion-safe:animate-pulse" />
              <div className="mt-3 overflow-hidden rounded-lg border border-border bg-surface">
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
          <div className="h-40 rounded-lg border border-border bg-surface" aria-hidden="true" />
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
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 className="mt-3 font-display text-h1 font-semibold text-ink">Your study</h1>
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
          className="mt-8 rounded-md border border-border border-l-2 border-l-error bg-sunken px-5 py-4 text-sm text-error"
        >
          <p className="font-semibold">Could not load your dashboard.</p>
          <p className="mt-1">{error}</p>
          <button
            type="button"
            onClick={handleRetry}
            className="mt-2 text-sm font-semibold underline decoration-border-strong underline-offset-2 transition-colors duration-150 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Try again
          </button>
        </div>
      ) : plans.length === 0 ? (
        <div className="mt-8 rounded-lg border border-border border-l-2 border-l-accent bg-sunken p-6 md:p-8">
          <p className="text-label font-semibold uppercase tracking-[0.14em] text-ink-muted">
            No plans
          </p>
          <h2 className="mt-3 font-display text-title font-semibold text-ink">No plans yet.</h2>
          <p className="mt-3 max-w-form text-base text-ink-muted">
            Create a plan for your next exam and your schedule will appear here.
          </p>
          <Link to="/plans/new" className={`${primaryButtonClass} mt-6`}>
            Create plan
          </Link>
        </div>
      ) : (
        <>
          <section
            aria-label="Summary"
            className="mt-8 grid overflow-hidden rounded-lg border border-border bg-surface sm:grid-cols-3"
          >
            <SummaryStat
              label="Streak"
              value={plural(streak, 'day')}
              emphasis
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

          <div className="mt-8 grid gap-8 xl:grid-cols-12">
            <div className="space-y-8 xl:col-span-8">
              <section aria-labelledby="today-heading">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="eyebrow">Today</p>
                    <h2
                      id="today-heading"
                      className="mt-2 font-display text-h2 font-semibold text-ink"
                    >
                      What is due
                    </h2>
                  </div>
                  {todayTasks.length > 0 ? (
                    <p className="text-xs text-ink-muted">
                      {todayProgress.percentage}% of today complete
                    </p>
                  ) : null}
                </div>

                {todayTasks.length === 0 ? (
                  <div className="mt-3 rounded-lg border border-border bg-sunken p-5">
                    <p className="text-sm font-semibold text-ink">No tasks due today.</p>
                    {activePlan ? (
                      <Link to={`/plans/${activePlan.id}`} className={`${textLinkClass} mt-2 inline-block text-sm`}>
                        Open {activePlan.subject}
                      </Link>
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-3 overflow-hidden rounded-lg border border-border bg-surface">
                    <div className="border-b border-border bg-sunken px-4 py-3">
                      <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs text-ink-muted">
                        <span>
                          {todayProgress.completed} of {todayTasks.length} tasks complete
                        </span>
                        <span className="font-semibold text-ink">
                          {todayProgress.percentage}%
                        </span>
                      </div>
                      <ProgressBar
                        value={todayProgress.percentage}
                        label="Today progress"
                        className="mt-2"
                      />
                    </div>
                    <ul>
                      {todayTasks.map((task) => (
                        <li
                          key={task.id}
                          className="flex items-start gap-3 border-t border-border px-4 py-3.5 transition-colors duration-150 first:border-t-0 hover:bg-sunken"
                        >
                          <input
                            id={`today-task-${task.id}`}
                            type="checkbox"
                            checked={task.completed}
                            disabled={pendingTaskId === task.id}
                            onChange={() => toggleTask(task.id)}
                            className={checkboxClass}
                          />
                          <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                            <div className="min-w-0">
                              <label
                                htmlFor={`today-task-${task.id}`}
                                className={`block text-sm ${task.completed ? 'text-ink-muted' : 'text-ink'}`}
                              >
                                {task.description}
                              </label>
                              <p className="mt-1 text-xs text-ink-muted">
                                {task.subject}, {task.topic}
                              </p>
                            </div>
                            <div className="flex shrink-0 flex-wrap items-center gap-3">
                              {task.completed ? (
                                <span className="rounded-xs border border-success px-2 py-1 text-2xs font-semibold text-success">
                                  Complete
                                </span>
                              ) : null}
                              <Link
                                to={`/plans/${task.planId}`}
                                className="text-xs text-ink-muted underline decoration-border-strong underline-offset-2 transition-colors duration-150 hover:text-ink"
                              >
                                Open plan
                              </Link>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>

              <section aria-labelledby="plans-heading">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="eyebrow">Plans</p>
                    <h2
                      id="plans-heading"
                      className="mt-2 font-display text-h2 font-semibold text-ink"
                    >
                      Your plans
                    </h2>
                  </div>
                  <p className="text-xs text-ink-muted">
                    {plural(plans.length, 'plan')} saved
                  </p>
                </div>

                <ul className="mt-3 overflow-hidden rounded-lg border border-border bg-surface">
                  {plans.map(({ plan, tasks }) => {
                    const progress = progressFor(tasks);

                    return (
                      <li
                        key={plan.id}
                        className="border-t border-border px-4 py-4 transition-colors duration-150 first:border-t-0 hover:bg-sunken"
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
                          <div className="flex shrink-0 items-center gap-3">
                            <span className="rounded-xs border border-border bg-paper px-2 py-1 text-2xs font-semibold tabular-nums text-ink-muted">
                              {progress.percentage}%
                            </span>
                            <Link
                              to={`/plans/${plan.id}`}
                              className={`${textLinkClass} text-sm`}
                            >
                              Open plan
                            </Link>
                          </div>
                        </div>
                        <div className="mt-3">
                          <ProgressBar
                            value={progress.percentage}
                            label={`${plan.subject} progress`}
                          />
                          <p className="mt-2 text-xs text-ink-muted">
                            {progress.completed} of {progress.total} tasks complete
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </div>

            <aside className="xl:col-span-4">
              <div className="rounded-lg border border-border border-l-2 border-l-accent bg-sunken p-5 xl:sticky xl:top-8">
                <p className="text-label font-semibold uppercase tracking-[0.14em] text-ink-muted">
                  This week
                </p>
                <h2 className="mt-2 font-display text-h2 font-semibold text-ink">
                  The week ahead
                </h2>
                {weekProgress.total === 0 ? (
                  <p className="mt-3 text-sm text-ink-muted">No tasks scheduled this week.</p>
                ) : (
                  <>
                    <p className="mt-3 text-sm text-ink">
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
                    className={`${textLinkClass} mt-4 inline-block text-sm`}
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
