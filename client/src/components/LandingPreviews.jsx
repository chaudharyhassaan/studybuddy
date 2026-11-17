import ProgressBar from './ProgressBar';
import { examLine, formatDate, groupTasksByDate, plural, progressFor, todayIso } from '../lib/plans';

const checkboxClass = 'mt-1 h-[18px] w-[18px] shrink-0 rounded-xs accent-accent';

const fieldClass =
  'block h-10 w-full rounded-sm border border-border-strong bg-surface px-3 text-sm text-ink';

function TaskRows({ subject, tasks }) {
  return (
    <ul>
      {tasks.map((task) => (
        <li
          key={task.id}
          className="flex items-start gap-3 border-t border-border px-4 py-3 first:border-t-0"
        >
          <input
            type="checkbox"
            checked={task.completed}
            readOnly
            tabIndex={-1}
            aria-hidden="true"
            className={checkboxClass}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-ink">{task.description}</p>
            <p className="mt-1 text-xs text-ink-muted">
              {subject}, {task.topic}
            </p>
          </div>
          {task.completed ? (
            <span className="shrink-0 rounded-xs border border-success px-2 py-1 text-2xs font-semibold text-success">
              Complete
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function DashboardPreview({ plan }) {
  const today = todayIso();
  const todayTasks = plan.tasks.filter((task) => task.date === today);
  const progress = progressFor(plan.tasks);

  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border bg-sunken px-4 py-3 md:px-5">
        <p className="text-label font-semibold uppercase tracking-[0.14em] text-ink-muted">
          Today
        </p>
        <p className="text-xs text-ink-muted">{examLine(plan.examDate)}</p>
      </div>

      <div className="px-4 py-4 md:px-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="font-display text-h3 font-semibold text-ink">{plan.subject}</h2>
          <p className="text-xs text-ink-muted">
            {progress.completed} of {progress.total} tasks complete
          </p>
        </div>
        <ProgressBar
          value={progress.percentage}
          label={`${plan.subject} example plan progress`}
          className="mt-2"
        />

        <div className="mt-6 overflow-hidden rounded-md border border-border">
          <TaskRows subject={plan.subject} tasks={todayTasks} />
        </div>

        <p className="mt-4 border-t border-border pt-3 text-xs text-ink-muted">
          Sample plan. Your schedule is built from your own topics and dates.
        </p>
      </div>
    </div>
  );
}

export function SchedulePreview({ plan, maxDays = 1 }) {
  const today = todayIso();
  const groups = groupTasksByDate(plan.tasks)
    .filter((group) => group.date >= today)
    .slice(0, maxDays);

  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border px-4 py-3 md:px-5">
        <div>
          <p className="text-label font-semibold uppercase tracking-[0.14em] text-ink-muted">
            Schedule
          </p>
          <p className="mt-1 font-display text-h3 font-semibold text-ink">{plan.subject}</p>
        </div>
        <p className="text-xs text-ink-muted">{examLine(plan.examDate)}</p>
      </div>

      {groups.map((group) => (
        <section key={group.date} className="border-t border-border first:border-t-0">
          <div className="flex flex-wrap items-baseline justify-between gap-2 bg-sunken px-4 py-2.5">
            <p className="text-xs font-semibold text-ink">
              {formatDate(group.date, { weekday: true })}
            </p>
            <p className="text-2xs text-ink-muted">{plural(group.tasks.length, 'task')}</p>
          </div>
          <TaskRows subject={plan.subject} tasks={group.tasks} />
        </section>
      ))}
    </div>
  );
}

export function SetupPreview({ plan }) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-surface p-4 md:p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="example-subject" className="mb-2 block text-xs font-semibold text-ink">
            Subject
          </label>
          <input
            id="example-subject"
            name="example-subject"
            type="text"
            value={plan.subject}
            readOnly
            className={fieldClass}
          />
        </div>
        <div>
          <label
            htmlFor="example-exam-date"
            className="mb-2 block text-xs font-semibold text-ink"
          >
            Exam date
          </label>
          <input
            id="example-exam-date"
            name="example-exam-date"
            type="date"
            value={plan.examDate}
            readOnly
            className={fieldClass}
          />
        </div>
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <p className="mb-2 text-xs font-semibold text-ink">Topics</p>
        <ul className="flex flex-wrap gap-2">
          {['Cell structure', 'Enzymes', 'Respiration'].map((topic) => (
            <li
              key={topic}
              className="rounded-xs border border-border bg-sunken px-2 py-1 text-xs text-ink"
            >
              {topic}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 border-t border-border pt-4 sm:max-w-[50%]">
        <label htmlFor="example-hours" className="mb-2 block text-xs font-semibold text-ink">
          Hours per day
        </label>
        <input
          id="example-hours"
          name="example-hours"
          type="number"
          value="2"
          readOnly
          className={fieldClass}
        />
      </div>
    </div>
  );
}

export function ProgressPreview({ plan }) {
  const progress = progressFor(plan.tasks);
  const todayProgress = progressFor(plan.tasks.filter((task) => task.date === todayIso()));

  return (
    <div className="min-w-0 rounded-lg border border-border bg-surface p-4 md:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-label font-semibold uppercase tracking-[0.14em] text-ink-muted">
          Plan progress
        </p>
        <p className="font-display text-h2 font-semibold tabular-nums text-ink">
          {progress.percentage}%
        </p>
      </div>
      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2 text-xs text-ink-muted">
        <span>
          {progress.completed} of {progress.total} tasks complete
        </span>
      </div>
      <ProgressBar
        value={progress.percentage}
        label={`${plan.subject} example plan progress`}
        className="mt-3"
      />

      <dl className="mt-5 grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
        <div>
          <dt className="text-label font-semibold uppercase tracking-[0.14em] text-ink-muted">
            Today
          </dt>
          <dd className="mt-1 text-sm text-ink">
            {todayProgress.completed} of {todayProgress.total} tasks complete
          </dd>
        </div>
        <div>
          <dt className="text-label font-semibold uppercase tracking-[0.14em] text-ink-muted">
            Streak
          </dt>
          <dd className="mt-1 text-sm text-ink">A task was completed today.</dd>
          <dd className="mt-1 text-xs text-ink-muted">
            The streak counts days with completed work.
          </dd>
        </div>
      </dl>
    </div>
  );
}
