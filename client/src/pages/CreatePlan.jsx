import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getErrorMessage } from '../lib/api';
import { daysUntil, tomorrowIso } from '../lib/plans';
import {
  validateExamDate,
  validateHoursPerDay,
  validatePlan,
  validateSubject,
  validateTopic,
} from '../lib/validation';
import FormErrorSummary from '../components/FormErrorSummary';
import PrimaryButton, { secondaryButtonClass, textLinkClass } from '../components/PrimaryButton';
import TextField from '../components/TextField';
import { usePageTitle } from '../lib/usePageTitle';

const topicInputClass =
  'block h-11 w-full min-w-0 rounded-sm border bg-surface px-3 text-base text-ink placeholder:text-ink-muted transition-colors duration-150 hover:border-ink-muted focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:border-border disabled:bg-sunken disabled:text-ink-muted md:h-10';

const fieldValidators = {
  subject: validateSubject,
  examDate: validateExamDate,
  hoursPerDay: validateHoursPerDay,
};

function formatHours(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function FormSection({ step, title, description, children }) {
  return (
    <section className="border-t border-border pt-7 first:border-t-0 first:pt-0">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-sm font-semibold tabular-nums text-accent">{step}</span>
        <h2 className="font-sans text-sm font-semibold text-ink">{title}</h2>
      </div>
      {description ? <p className="mt-1 text-xs text-ink-muted">{description}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function CreatePlan() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [topics, setTopics] = useState([]);
  const [topicDraft, setTopicDraft] = useState('');
  const [examDate, setExamDate] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState('2');
  const [errors, setErrors] = useState({});
  const [topicError, setTopicError] = useState('');
  const [generateError, setGenerateError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const [focusRequest, setFocusRequest] = useState(0);
  const summaryRef = useRef(null);

  usePageTitle('Create a plan');

  useEffect(() => {
    if (focusRequest > 0 && summaryRef.current) {
      summaryRef.current.focus();
    }
  }, [focusRequest]);

  function clearError(name) {
    setErrors((current) => {
      if (!(name in current)) {
        return current;
      }

      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function handleSubjectChange(event) {
    setSubject(event.target.value);
    clearError('subject');
  }

  function handleExamDateChange(event) {
    setExamDate(event.target.value);
    clearError('examDate');
  }

  function handleHoursChange(event) {
    setHoursPerDay(event.target.value);
    clearError('hoursPerDay');
  }

  function handleFieldBlur(event) {
    const { name, value } = event.target;
    const message = fieldValidators[name] ? fieldValidators[name](value) : null;

    setErrors((current) => {
      const next = { ...current };

      if (message) {
        next[name] = message;
      } else {
        delete next[name];
      }

      return next;
    });
  }

  function addTopic() {
    const value = topicDraft.trim();

    if (topics.length >= 20) {
      setTopicError('Add 20 topics or fewer.');
      return;
    }

    const message = validateTopic(value);
    if (message) {
      setTopicError(message);
      return;
    }

    if (topics.some((topic) => topic.toLowerCase() === value.toLowerCase())) {
      setTopicError('That topic is already added.');
      return;
    }

    setTopics([...topics, value]);
    setTopicDraft('');
    setTopicError('');
    clearError('topics');
  }

  function removeTopic(index) {
    setTopics((current) => current.filter((_, item) => item !== index));
    clearError('topics');
  }

  function handleTopicKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      addTopic();
    }
  }

  async function generatePlan(event) {
    event?.preventDefault();

    let nextTopics = topics;
    const draft = topicDraft.trim();

    if (draft) {
      const duplicate = topics.some((topic) => topic.toLowerCase() === draft.toLowerCase());
      const draftMessage =
        validateTopic(draft) ||
        (duplicate ? 'That topic is already added.' : null) ||
        (topics.length >= 20 ? 'Add 20 topics or fewer.' : null);

      if (draftMessage) {
        setTopicError(draftMessage);
        setSubmitCount((count) => count + 1);
        setFocusRequest((count) => count + 1);
        return;
      }

      nextTopics = [...topics, draft];
      setTopics(nextTopics);
      setTopicDraft('');
      setTopicError('');
    }

    const nextErrors = validatePlan({ subject, examDate, hoursPerDay, topics: nextTopics });
    setErrors(nextErrors);
    setSubmitCount((count) => count + 1);
    setGenerateError('');

    if (Object.keys(nextErrors).length > 0) {
      setFocusRequest((count) => count + 1);
      return;
    }

    setGenerating(true);

    try {
      const { data } = await api.post('/plans', {
        subject: subject.trim(),
        examDate,
        hoursPerDay: Number(hoursPerDay),
        topics: nextTopics,
      });

      navigate(`/plans/${data.plan.id}`);
    } catch (requestError) {
      setGenerateError(
        getErrorMessage(requestError, 'Plan generation failed. Check your details and try again.')
      );
      setFocusRequest((count) => count + 1);
    } finally {
      setGenerating(false);
    }
  }

  const activeErrors = Object.fromEntries(
    Object.entries(errors).filter(([, message]) => Boolean(message))
  );
  const summaryErrors =
    submitCount > 0
      ? {
          ...(activeErrors.subject ? { subject: activeErrors.subject } : {}),
          ...(activeErrors.examDate ? { examDate: activeErrors.examDate } : {}),
          ...(activeErrors.hoursPerDay ? { hoursPerDay: activeErrors.hoursPerDay } : {}),
          ...(activeErrors.topics || topicError
            ? { 'topic-draft': activeErrors.topics || topicError }
            : {}),
        }
      : {};
  const days = daysUntil(examDate);
  const hours = Number(hoursPerDay);
  const totalHours =
    days !== null && days > 0 && Number.isFinite(hours) && hours > 0 ? days * hours : null;
  const summaryMessage =
    generateError ||
    (submitCount > 0 && Object.keys(summaryErrors).length > 0 ? 'Check the fields below.' : '');

  return (
    <div>
      <Link to="/dashboard" className={`${textLinkClass} text-sm`}>
        Back to dashboard
      </Link>

      <div className="mt-5">
        <p className="eyebrow">New plan</p>
        <h1 className="mt-3 font-display text-h1 font-semibold text-ink">Create a plan</h1>
        <p className="mt-2 max-w-form text-sm text-ink-muted">
          Add the exam details. StudyBuddy builds the daily schedule from them.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        <form
          noValidate
          onSubmit={generatePlan}
          aria-busy={generating}
          className="rounded-lg border border-border bg-surface p-6 lg:col-span-7"
        >
          <FormErrorSummary ref={summaryRef} message={summaryMessage} errors={summaryErrors} />

          <fieldset disabled={generating} className="space-y-8">
            <FormSection
              step="01"
              title="Subject"
              description="Use the subject name from your exam timetable."
            >
              <TextField
                id="subject"
                label="Subject"
                value={subject}
                onChange={handleSubjectChange}
                onBlur={handleFieldBlur}
                error={activeErrors.subject}
                helper="Keep it short, for example Biology or Algebra II."
                placeholder="Biology"
                required
              />
            </FormSection>

            <FormSection
              step="02"
              title="Topics"
              description="Add at least one topic. Press Enter or use Add topic."
            >
              <label htmlFor="topic-draft" className="mb-2 block text-xs font-semibold text-ink">
                Topic
              </label>
              <div className="flex gap-2">
                <input
                  id="topic-draft"
                  name="topic-draft"
                  type="text"
                  value={topicDraft}
                  onChange={(event) => {
                    setTopicDraft(event.target.value);
                    setTopicError('');
                  }}
                  onKeyDown={handleTopicKeyDown}
                  placeholder="Cell structure"
                  aria-invalid={topicError || activeErrors.topics ? 'true' : undefined}
                  aria-describedby={
                    topicError
                      ? 'topic-error'
                      : activeErrors.topics
                        ? 'topics-error'
                        : 'topic-helper'
                  }
                  className={`${topicInputClass} ${
                    topicError ? 'border-error' : 'border-border-strong'
                  }`}
                />
                <button
                  type="button"
                  onClick={addTopic}
                  className={`${secondaryButtonClass} shrink-0`}
                >
                  Add topic
                </button>
              </div>
              {topicError ? (
                <p id="topic-error" className="mt-2 text-xs text-error">
                  {topicError}
                </p>
              ) : (
                <p id="topic-helper" className="mt-2 text-xs text-ink-muted">
                  Each topic can be up to 80 characters.
                </p>
              )}
              {topics.length > 0 ? (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {topics.map((topic, index) => (
                    <li
                      key={topic}
                      className="inline-flex items-center gap-2 rounded-xs border border-border bg-sunken px-2.5 py-1.5 text-xs text-ink"
                    >
                      <span>{topic}</span>
                      <button
                        type="button"
                        onClick={() => removeTopic(index)}
                        aria-label={`Remove ${topic}`}
                        className="text-ink-muted underline decoration-border-strong underline-offset-2 transition-colors duration-150 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              {activeErrors.topics ? (
                <p id="topics-error" className="mt-2 text-xs text-error">
                  {activeErrors.topics}
                </p>
              ) : null}
            </FormSection>

            <FormSection
              step="03"
              title="Exam date"
              description="Choose a date after today. The exam day is kept for revision."
            >
              <TextField
                id="examDate"
                label="Exam date"
                type="date"
                value={examDate}
                onChange={handleExamDateChange}
                onBlur={handleFieldBlur}
                error={activeErrors.examDate}
                helper="The schedule runs from today to the day before."
                min={tomorrowIso()}
                required
              />
            </FormSection>

            <FormSection
              step="04"
              title="Study time"
              description="Set the hours you can realistically study each day."
            >
              <TextField
                id="hoursPerDay"
                label="Hours per day"
                type="number"
                value={hoursPerDay}
                onChange={handleHoursChange}
                onBlur={handleFieldBlur}
                error={activeErrors.hoursPerDay}
                helper="Between 0.5 and 12 hours, in steps of 0.5."
                min={0.5}
                max={12}
                step={0.5}
                required
              />
            </FormSection>
          </fieldset>

          <div className="mt-8 border-t border-border pt-6">
            <PrimaryButton type="submit" className="w-full" disabled={generating}>
              {generating ? 'Generating plan' : 'Generate schedule'}
            </PrimaryButton>
            <p className="mt-3 text-center text-xs text-ink-muted">
              The schedule, quizzes and flashcards are generated from these details.
            </p>
          </div>
        </form>

        <aside className="h-fit rounded-lg border border-border border-t-2 border-t-accent bg-sunken p-5 lg:sticky lg:top-[88px] lg:col-span-5 lg:self-start">
          {generating ? (
            <div aria-busy="true" aria-live="polite">
              <p className="text-label font-semibold uppercase tracking-[0.14em] text-ink-muted">
                Plan summary
              </p>
              <p className="mt-2 text-sm text-ink-muted">Generating your plan.</p>
              <div aria-hidden="true" className="mt-5 space-y-3">
                {[0, 1, 2, 3, 4].map((row) => (
                  <div
                    key={row}
                    className="h-4 rounded-sm bg-paper motion-safe:animate-pulse"
                  />
                ))}
              </div>
            </div>
          ) : (
            <>
              <p className="text-label font-semibold uppercase tracking-[0.14em] text-ink-muted">
                Plan summary
              </p>
              <h2 className="mt-2 font-display text-h2 font-semibold text-ink">
                Review before generating.
              </h2>

              <dl className="mt-5 divide-y divide-border border-t border-border">
                <div className="flex items-baseline justify-between gap-4 py-3">
                  <dt className="text-sm text-ink-muted">Subject</dt>
                  <dd className="text-right text-sm font-semibold text-ink">
                    {subject.trim() || 'Not set'}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-3">
                  <dt className="text-sm text-ink-muted">Topics</dt>
                  <dd className="text-sm font-semibold tabular-nums text-ink">{topics.length}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-3">
                  <dt className="text-sm text-ink-muted">Days until exam</dt>
                  <dd className="text-right text-sm font-semibold tabular-nums text-ink">
                    {days === null ? 'Not set' : days > 0 ? days : 'Choose a future date'}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-3">
                  <dt className="text-sm text-ink-muted">Hours per day</dt>
                  <dd className="text-sm font-semibold tabular-nums text-ink">
                    {hoursPerDay || 'Not set'}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-3">
                  <dt className="text-sm text-ink-muted">Estimated total hours</dt>
                  <dd className="text-sm font-semibold tabular-nums text-ink">
                    {totalHours === null ? 'Not set' : formatHours(totalHours)}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 border-t border-border pt-4">
                <p className="text-label font-semibold uppercase tracking-[0.14em] text-ink-muted">
                  What happens next
                </p>
                <ol className="mt-3 space-y-2.5 text-sm text-ink-muted">
                  <li className="flex gap-3">
                    <span className="font-display text-xs font-semibold tabular-nums text-accent">
                      01
                    </span>
                    A task is scheduled for each study day.
                  </li>
                  <li className="flex gap-3">
                    <span className="font-display text-xs font-semibold tabular-nums text-accent">
                      02
                    </span>
                    Quizzes and flashcards are built from your topics.
                  </li>
                  <li className="flex gap-3">
                    <span className="font-display text-xs font-semibold tabular-nums text-accent">
                      03
                    </span>
                    Progress and your streak update as you finish tasks.
                  </li>
                </ol>
              </div>
            </>
          )}
        </aside>
      </div>

      {generateError ? (
        <div
          role="alert"
          className="mt-6 rounded-md border border-border border-l-2 border-l-error bg-sunken px-5 py-4 text-sm text-error"
        >
          <p className="font-semibold">Plan generation failed.</p>
          <p className="mt-1">{generateError}</p>
          <button
            type="button"
            onClick={generatePlan}
            disabled={generating}
            className="mt-2 text-sm font-semibold underline decoration-border-strong underline-offset-2 transition-colors duration-150 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Try again
          </button>
        </div>
      ) : null}

      {generating ? (
        <section aria-busy="true" aria-live="polite" className="mt-8">
          <p className="text-sm text-ink-muted">Generating your plan.</p>
          <div
            aria-hidden="true"
            className="mt-4 overflow-hidden rounded-lg border border-border bg-surface"
          >
            {[0, 1, 2, 3, 4].map((row) => (
              <div key={row} className="border-t border-border px-4 py-4 first:border-t-0">
                <div className="h-4 w-40 rounded-sm bg-sunken motion-safe:animate-pulse" />
                <div className="mt-3 h-3 w-2/3 rounded-sm bg-sunken motion-safe:animate-pulse" />
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
