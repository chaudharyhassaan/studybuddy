import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api, getErrorMessage } from '../lib/api';
import { useAuth } from '../context/useAuth';
import PrimaryButton, {
  destructiveButtonClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../components/PrimaryButton';
import ProgressBar from '../components/ProgressBar';
import {
  chartDataFor,
  countdownLabel,
  daysUntil,
  formatDate,
  groupTasksByDate,
  isToday,
  plural,
  progressFor,
  todayIso,
} from '../lib/plans';

const checkboxClass =
  'mt-1 h-[18px] w-[18px] shrink-0 cursor-pointer rounded-xs accent-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60';

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div className="rounded-sm border border-border bg-surface px-3 py-2 text-xs text-ink">
      <p className="font-semibold">{point.label}</p>
      <p className="mt-1 text-ink-muted">
        {point.completed} of {point.total} tasks complete
      </p>
    </div>
  );
}

function PlanSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite">
      <div aria-hidden="true" className="h-4 w-32 rounded-sm bg-sunken motion-safe:animate-pulse" />
      <div aria-hidden="true" className="mt-5 h-8 w-64 max-w-full rounded-sm bg-sunken motion-safe:animate-pulse" />
      <div aria-hidden="true" className="mt-2 h-4 w-80 max-w-full rounded-sm bg-sunken motion-safe:animate-pulse" />
      <div className="mt-6 grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <div className="h-40 rounded-md border border-border bg-surface" aria-hidden="true" />
          <div className="h-64 rounded-md border border-border bg-surface" aria-hidden="true" />
          <div className="h-56 rounded-md border border-border bg-surface" aria-hidden="true" />
        </div>
        <div className="h-32 rounded-md border border-border bg-surface xl:col-span-4" aria-hidden="true" />
      </div>
    </div>
  );
}

export default function PlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plan, setPlan] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [streak, setStreak] = useState(user?.streak ?? 0);
  const [lastStudyDate, setLastStudyDate] = useState(user?.lastStudyDate ?? null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [pendingTaskId, setPendingTaskId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const dialogRef = useRef(null);
  const deleteTriggerRef = useRef(null);

  const loadPlan = useCallback(() => {
    return api
      .get(`/plans/${id}`)
      .then(({ data }) => {
        setPlan(data.plan);
        setTasks(data.tasks);
        setNotFound(false);
        setError('');
      })
      .catch((requestError) => {
        if (requestError.response?.status === 404) {
          setNotFound(true);
          setError('Plan not found.');
          return;
        }

        setError(getErrorMessage(requestError, 'Could not load this plan. Try again.'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  function handleRetry() {
    setLoading(true);
    setError('');
    setNotFound(false);
    loadPlan();
  }

  async function toggleTask(taskId) {
    setPendingTaskId(taskId);
    setActionError('');

    try {
      const { data } = await api.patch(`/tasks/${taskId}/toggle`);

      setTasks((current) =>
        current.map((task) => (task.id === data.task.id ? data.task : task))
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

  function goToNextTask() {
    const nextTask = tasks.find((task) => !task.completed);

    if (!nextTask) {
      return;
    }

    const row = document.getElementById(`task-${nextTask.id}`);
    row?.scrollIntoView({ block: 'center' });
    row?.querySelector('input[type="checkbox"]')?.focus({ preventScroll: true });
  }

  function openDialog() {
    setDeleteError('');
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
    deleteTriggerRef.current?.focus();
  }

  async function confirmDelete() {
    setDeleting(true);
    setDeleteError('');

    try {
      await api.delete(`/plans/${plan.id}`);
      dialogRef.current?.close();
      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      setDeleteError(getErrorMessage(requestError, 'Could not delete this plan. Try again.'));
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <PlanSkeleton />;
  }

  if (notFound) {
    return (
      <div>
        <Link
          to="/dashboard"
          className="text-sm text-ink-muted transition-colors duration-150 hover:text-ink"
        >
          Back to dashboard
        </Link>
        <h1 className="mt-4 font-display text-h1 font-semibold tracking-tight text-ink">
          Plan not found.
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          This plan does not exist or was deleted.
        </p>
        <Link to="/dashboard" className={`${primaryButtonClass} mt-6`}>
          Go to dashboard
        </Link>
      </div>
    );
  }

  if (!plan) {
    return (
      <div>
        <Link
          to="/dashboard"
          className="text-sm text-ink-muted transition-colors duration-150 hover:text-ink"
        >
          Back to dashboard
        </Link>
        <div
          role="alert"
          className="mt-6 rounded-md border border-border border-l-2 border-l-error bg-sunken px-4 py-3 text-sm text-error"
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
      </div>
    );
  }

  const today = todayIso();
  const progress = progressFor(tasks);
  const allComplete = tasks.length > 0 && tasks.every((task) => task.completed);
  const groups = groupTasksByDate(tasks);
  const chartData = chartDataFor(tasks);
  const todayProgress = progressFor(tasks.filter((task) => task.date === today));
  const daysRemaining = daysUntil(plan.examDate);
  const studiedToday =
    typeof lastStudyDate === 'string' && lastStudyDate.slice(0, 10) === today;

  return (
    <div>
      <Link
        to="/dashboard"
        className="text-sm text-ink-muted transition-colors duration-150 hover:text-ink"
      >
        Back to dashboard
      </Link>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-h1 font-semibold tracking-tight text-ink">
            {plan.subject}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">{countdownLabel(plan.examDate)}, {formatDate(plan.examDate, { year: true })}</p>
          <p className="mt-1 text-xs text-ink-muted">
            {plural(plan.topics.length, 'topic')}, {plural(plan.hoursPerDay, 'hour')} per day
          </p>
        </div>
        <button
          ref={deleteTriggerRef}
          type="button"
          onClick={openDialog}
          className="inline-flex h-11 shrink-0 items-center px-2 text-sm text-error underline underline-offset-2 transition-colors duration-150 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Delete plan
        </button>
      </div>

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
          <section
            aria-labelledby="progress-heading"
            className="rounded-md border border-border bg-surface p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <h2
                  id="progress-heading"
                  className="font-display text-h2 font-semibold tracking-tight text-ink"
                >
                  Progress
                </h2>
                <p className="mt-2 text-sm text-ink">
                  {progress.completed} of {progress.total} tasks complete
                </p>
                <ProgressBar
                  value={progress.percentage}
                  label={`${plan.subject} progress`}
                  className="mt-3"
                />
                <p className="mt-2 text-xs text-ink-muted">{progress.percentage}% complete.</p>
              </div>
              <div className="shrink-0">
                {allComplete ? (
                  <p className="text-sm font-semibold text-success">All tasks complete.</p>
                ) : (
                  <PrimaryButton type="button" onClick={goToNextTask}>
                    Continue next task
                  </PrimaryButton>
                )}
              </div>
            </div>
            <p className="mt-4 border-t border-border pt-3 text-xs text-ink-muted">
              {plural(streak, 'day')} streak.{' '}
              {studiedToday
                ? 'Completed a task today.'
                : 'Complete a task today to extend it.'}
            </p>
          </section>

          <section
            aria-labelledby="chart-heading"
            className="rounded-md border border-border bg-surface p-5"
          >
            <h2
              id="chart-heading"
              className="font-display text-h2 font-semibold tracking-tight text-ink"
            >
              Progress by day
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              The share of tasks completed on each study day.
            </p>
            {chartData.length === 0 ? (
              <p className="mt-4 text-sm text-ink-muted">No schedule tasks to chart yet.</p>
            ) : (
              <div className="mt-4 h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                    accessibilityLayer
                  >
                    <CartesianGrid vertical={false} stroke="var(--color-border)" />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={{ stroke: 'var(--color-border)' }}
                      tick={{ fill: 'var(--color-ink-muted)', fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      domain={[0, 100]}
                      ticks={[0, 50, 100]}
                      tickFormatter={(value) => `${value}%`}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: 'var(--color-ink-muted)', fontSize: 12 }}
                      width={44}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--color-sunken)' }} />
                    <Bar
                      dataKey="percentage"
                      fill="var(--color-accent)"
                      radius={[3, 3, 0, 0]}
                      maxBarSize={32}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          <section aria-labelledby="schedule-heading">
            <h2
              id="schedule-heading"
              className="font-display text-h2 font-semibold tracking-tight text-ink"
            >
              Schedule
            </h2>
            {groups.length === 0 ? (
              <div className="mt-3 rounded-md border border-border bg-sunken p-5">
                <p className="text-sm font-semibold text-ink">No tasks in this plan yet.</p>
              </div>
            ) : (
              <div className="mt-3 space-y-4">
                {groups.map((group) => (
                  <div
                    key={group.date}
                    className="overflow-hidden rounded-md border border-border bg-surface"
                  >
                    <div className="flex items-center justify-between gap-4 border-b border-border bg-sunken px-4 py-2.5">
                      <h3 className="font-display text-h3 font-semibold text-ink">
                        {formatDate(group.date, { weekday: true })}
                      </h3>
                      <p className="text-xs text-ink-muted">
                        {plural(group.tasks.length, 'task')}
                        {isToday(group.date) ? ', Today' : ''}
                      </p>
                    </div>
                    <ul>
                      {group.tasks.map((task) => (
                        <li
                          key={task.id}
                          id={`task-${task.id}`}
                          className="flex items-start gap-3 border-t border-border px-4 py-3 first:border-t-0"
                        >
                          <input
                            id={`task-checkbox-${task.id}`}
                            type="checkbox"
                            checked={task.completed}
                            disabled={pendingTaskId === task.id}
                            onChange={() => toggleTask(task.id)}
                            className={checkboxClass}
                          />
                          <div className="min-w-0 flex-1">
                            <label
                              htmlFor={`task-checkbox-${task.id}`}
                              className="block text-sm text-ink"
                            >
                              {task.description}
                            </label>
                            <p className="mt-1 text-xs text-ink-muted">{task.topic}</p>
                          </div>
                          {task.completed ? (
                            <span className="shrink-0 rounded-xs border border-success px-2 py-1 text-2xs font-semibold text-success">
                              Complete
                            </span>
                          ) : isToday(task.date) ? (
                            <span className="shrink-0 rounded-xs border border-warning px-2 py-1 text-2xs font-semibold text-warning">
                              Due today
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4 xl:col-span-4">
          <div className="rounded-md border border-border bg-sunken p-4">
            <p className="text-2xs font-semibold uppercase text-ink-muted">Exam countdown</p>
            <p className="mt-1 font-display text-h1 font-semibold tabular-nums text-ink">
              {daysRemaining === null
                ? 'Not set'
                : daysRemaining < 0
                  ? 'Passed'
                  : daysRemaining === 0
                    ? 'Today'
                    : plural(daysRemaining, 'day')}
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              {plan.examDate
                ? `Exam on ${formatDate(plan.examDate, { year: true })}`
                : 'No exam date set'}
            </p>
          </div>
          <div className="rounded-md border border-border bg-surface p-4">
            <p className="text-2xs font-semibold uppercase text-ink-muted">Today</p>
            {todayProgress.total === 0 ? (
              <p className="mt-2 text-sm text-ink-muted">No tasks due today.</p>
            ) : (
              <>
                <p className="mt-1 font-display text-h1 font-semibold tabular-nums text-ink">
                  {todayProgress.completed} of {todayProgress.total}
                </p>
                <p className="mt-1 text-xs text-ink-muted">tasks complete</p>
              </>
            )}
          </div>
        </aside>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="delete-plan-title"
        aria-describedby="delete-plan-details"
        className="m-auto max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-[480px] overflow-y-auto rounded-md border border-border bg-surface p-6 text-ink backdrop:bg-ink/40"
      >
        <h2
          id="delete-plan-title"
          className="font-display text-h2 font-semibold tracking-tight text-ink"
        >
          Delete this plan?
        </h2>
        <p id="delete-plan-details" className="mt-2 text-sm text-ink-muted">
          The schedule, quizzes and flashcards will be removed.
        </p>
        {deleteError ? (
          <div
            role="alert"
            className="mt-4 rounded-md border border-border border-l-2 border-l-error bg-sunken px-4 py-3 text-sm text-error"
          >
            {deleteError}
          </div>
        ) : null}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={closeDialog} className={secondaryButtonClass}>
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmDelete}
            disabled={deleting}
            className={destructiveButtonClass}
          >
            {deleting ? 'Deleting plan' : 'Delete plan'}
          </button>
        </div>
      </dialog>
    </div>
  );
}
