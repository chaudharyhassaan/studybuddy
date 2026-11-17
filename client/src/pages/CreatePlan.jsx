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
import PrimaryButton, { secondaryButtonClass } from '../components/PrimaryButton';
import TextField from '../components/TextField';

const topicInputClass =
  'block h-11 w-full min-w-0 rounded-sm border bg-surface px-3 text-base text-ink placeholder:text-ink-muted transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:bg-sunken disabled:text-ink-muted md:h-10';

const fieldValidators = {
  subject: validateSubject,
  examDate: validateExamDate,
  hoursPerDay: validateHoursPerDay,
};

function formatHours(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
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
      <Link
        to="/dashboard"
        className="text-sm text-ink-muted transition-colors duration-150 hover:text-ink"
      >
        Back to dashboard
      </Link>
      <h1 className="mt-4 font-display text-h1 font-semibold tracking-tight text-ink">
        Create a plan
      </h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <form
          noValidate
          onSubmit={generatePlan}
          aria-busy={generating}
          className="rounded-md border border-border bg-surface p-6 lg:col-span-7"
        >
          <FormErrorSummary ref={summaryRef} message={summaryMessage} errors={summaryErrors} />

          <fieldset disabled={generating} className="space-y-6">
            <div className="border-t border-border pt-6 first:border-t-0 first:pt-0">
              <TextField
                id="subject"
                label="Subject"
                value={subject}
                onChange={handleSubjectChange}
                onBlur={handleFieldBlur}
                error={activeErrors.subject}
                helper="Use the subject name from your exam timetable."
                placeholder="Biology"
                required
              />
            </div>

            <div className="border-t border-border pt-6">
              <label htmlFor="topic-draft" className="mb-2 block text-xs font-semibold text-ink">
                Topics
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
                    topicError ? 'topic-error' : activeErrors.topics ? 'topics-error' : 'topic-helper'
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
                <p id="topic-helper" className="mt-2 text-2xs text-ink-muted">
                  Press Enter or Add topic. At least one topic is required.
                </p>
              )}
              {topics.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {topics.map((topic, index) => (
                    <li
                      key={topic}
                      className="inline-flex items-center gap-2 rounded-xs border border-border bg-sunken px-2 py-1 text-xs text-ink"
                    >
                      <span>{topic}</span>
                      <button
                        type="button"
                        onClick={() => removeTopic(index)}
                        aria-label={`Remove ${topic}`}
                        className="text-ink-muted underline underline-offset-2 transition-colors duration-150 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
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
            </div>

            <div className="border-t border-border pt-6">
              <TextField
                id="examDate"
                label="Exam date"
                type="date"
                value={examDate}
                onChange={handleExamDateChange}
                onBlur={handleFieldBlur}
                error={activeErrors.examDate}
                helper="Choose a date after today."
                min={tomorrowIso()}
                required
              />
            </div>

            <div className="border-t border-border pt-6">
              <TextField
                id="hoursPerDay"
                label="Hours per day"
                type="number"
                value={hoursPerDay}
                onChange={handleHoursChange}
                onBlur={handleFieldBlur}
                error={activeErrors.hoursPerDay}
                helper="Between 0.5 and 12 hours."
                min={0.5}
                max={12}
                step={0.5}
                required
              />
            </div>
          </fieldset>

          <div className="mt-6 border-t border-border pt-6">
            <PrimaryButton type="submit" className="w-full" disabled={generating}>
              {generating ? 'Generating plan' : 'Generate schedule'}
            </PrimaryButton>
          </div>
        </form>

        <aside className="h-fit rounded-md border border-border bg-sunken p-5 lg:sticky lg:top-[88px] lg:col-span-5 lg:self-start">
          {generating ? (
            <div aria-busy="true" aria-live="polite">
              <p className="text-sm text-ink-muted">Generating your plan.</p>
              <div aria-hidden="true" className="mt-4 space-y-3">
                {[0, 1, 2, 3, 4].map((row) => (
                  <div key={row} className="h-4 rounded-sm bg-paper motion-safe:animate-pulse" />
                ))}
              </div>
            </div>
          ) : (
            <>
              <h2 className="font-display text-h3 font-semibold text-ink">Plan summary</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-ink-muted">Subject</dt>
                  <dd className="text-right font-semibold text-ink">{subject.trim() || 'Not set'}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-ink-muted">Topics</dt>
                  <dd className="font-semibold tabular-nums text-ink">
                    {topics.length}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-ink-muted">Days until exam</dt>
                  <dd className="text-right font-semibold tabular-nums text-ink">
                    {days === null ? 'Not set' : days > 0 ? days : 'Choose a future date'}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-ink-muted">Hours per day</dt>
                  <dd className="font-semibold tabular-nums text-ink">
                    {hoursPerDay || 'Not set'}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-ink-muted">Estimated total hours</dt>
                  <dd className="font-semibold tabular-nums text-ink">
                    {totalHours === null ? 'Not set' : formatHours(totalHours)}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 border-t border-border pt-4 text-sm text-ink-muted">
                StudyBuddy will generate a daily schedule, topic quizzes and flashcards from these
                details. The exam day is kept for revision.
              </p>
            </>
          )}
        </aside>
      </div>

      {generateError ? (
        <div
          role="alert"
          className="mt-6 rounded-md border border-border border-l-2 border-l-error bg-sunken px-4 py-3 text-sm text-error"
        >
          <p>{generateError}</p>
          <button
            type="button"
            onClick={generatePlan}
            disabled={generating}
            className="mt-2 text-sm font-semibold underline underline-offset-2 transition-colors duration-150 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
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
            className="mt-4 overflow-hidden rounded-md border border-border bg-surface"
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
