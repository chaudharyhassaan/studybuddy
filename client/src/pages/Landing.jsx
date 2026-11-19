import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { primaryButtonClass, textLinkClass } from '../components/PrimaryButton';
import {
  DashboardPreview,
  ProgressPreview,
  SchedulePreview,
  SetupPreview,
} from '../components/LandingPreviews';
import QuizPlayer from '../components/QuizPlayer';
import FlashcardViewer from '../components/FlashcardViewer';
import { exampleFlashcards, examplePlan, exampleQuiz } from '../lib/examplePlan';
import { plural } from '../lib/plans';
import { usePageTitle } from '../lib/usePageTitle';

const topicCount = new Set(examplePlan.tasks.map((task) => task.topic)).size;

function SectionIntro({ label, title, id, children }) {
  return (
    <div className="max-w-form">
      <p className="eyebrow">{label}</p>
      <h2 id={id} className="mt-3 font-display text-title font-semibold text-ink">
        {title}
      </h2>
      {children ? <p className="mt-4 text-lg text-ink-muted">{children}</p> : null}
    </div>
  );
}

function StepCopy({ number, title, children }) {
  return (
    <div>
      <div className="flex items-baseline gap-4">
        <span className="font-display text-h2 italic text-accent">{number}</span>
        <h3 className="font-display text-h2 font-semibold text-ink">{title}</h3>
      </div>
      <p className="mt-4 max-w-form text-base text-ink-muted">{children}</p>
    </div>
  );
}

export default function Landing() {
  const { user } = useAuth();
  const planHref = user ? '/plans/new' : '/register';

  usePageTitle();

  return (
    <div>
      <section aria-labelledby="hero-heading" className="border-b border-border">
        <div className="mx-auto grid max-w-content gap-12 px-4 py-14 md:px-6 md:py-20 lg:grid-cols-12 lg:items-start lg:gap-10 lg:px-10 lg:py-24">
          <div className="min-w-0 lg:col-span-6 lg:pr-4">
            <p className="eyebrow">Study schedule</p>
            <h1
              id="hero-heading"
              className="mt-5 font-display text-display font-semibold text-ink"
            >
              Know what to study <span className="italic text-accent">each day</span> until the
              exam.
            </h1>
            <p className="mt-6 max-w-[35rem] text-lg text-ink-muted">
              Enter the subject, its topics, the exam date and the hours you can study each day. You
              get a daily schedule, with quizzes and flashcards for your topics.
            </p>
            <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Link to={planHref} className={primaryButtonClass}>
                Create your plan
              </Link>
              <a href="#how-it-works" className={`${textLinkClass} text-sm font-semibold`}>
                See how it works
              </a>
            </div>

            <dl className="mt-12 grid gap-4 border-t border-border pt-5 sm:grid-cols-3">
              <div>
                <dt className="text-label font-semibold uppercase tracking-[0.14em] text-ink-muted">
                  Schedule
                </dt>
                <dd className="mt-1 text-sm text-ink">Day by day</dd>
              </div>
              <div>
                <dt className="text-label font-semibold uppercase tracking-[0.14em] text-ink-muted">
                  Practice
                </dt>
                <dd className="mt-1 text-sm text-ink">Quiz and cards</dd>
              </div>
              <div>
                <dt className="text-label font-semibold uppercase tracking-[0.14em] text-ink-muted">
                  Progress
                </dt>
                <dd className="mt-1 text-sm text-ink">Task by task</dd>
              </div>
            </dl>
          </div>

          <div className="min-w-0 lg:col-span-6">
            <div className="min-w-0 rounded-lg border border-border bg-sunken p-2.5 md:p-3">
              <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-2 px-1.5">
                <p className="text-label font-semibold uppercase tracking-[0.14em] text-ink-muted">
                  Example plan
                </p>
                <p className="text-xs text-ink-muted">
                  Biology, {plural(topicCount, 'topic')}
                </p>
              </div>
              <DashboardPreview plan={examplePlan} />
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" aria-labelledby="how-heading" className="border-b border-border">
        <div className="mx-auto max-w-content px-4 py-14 md:px-6 md:py-20 lg:px-10">
          <SectionIntro label="How it works" title="From exam date to daily tasks." id="how-heading">
            The plan covers each study day between today and the exam.
          </SectionIntro>

          <div className="mt-12">
            <div className="grid gap-6 border-t border-border py-12 first:border-t-0 first:pt-0 lg:grid-cols-12 lg:items-center lg:gap-12">
              <div className="lg:col-span-5">
                <StepCopy number="01" title="Enter the exam.">
                  Add the subject, its topics, the exam date and the hours you can study each day.
                  That is the whole setup.
                </StepCopy>
              </div>
              <div className="min-w-0 lg:col-span-7">
                <SetupPreview plan={examplePlan} />
              </div>
            </div>

            <div className="grid gap-6 border-t border-border py-12 lg:grid-cols-12 lg:items-center lg:gap-12">
              <div className="lg:order-2 lg:col-span-5">
                <StepCopy number="02" title="Get the plan.">
                  The app builds a daily schedule from those details, with a task for each study
                  day. It can also make quizzes and flashcards for each topic.
                </StepCopy>
              </div>
              <div className="min-w-0 lg:order-1 lg:col-span-7">
                <SchedulePreview plan={examplePlan} maxDays={1} />
              </div>
            </div>

            <div className="grid gap-6 border-t border-border py-12 lg:grid-cols-12 lg:items-center lg:gap-12">
              <div className="lg:col-span-5">
                <StepCopy number="03" title="Finish the day.">
                  Check off the tasks you complete. The progress bar and streak update from the work
                  you finish.
                </StepCopy>
              </div>
              <div className="min-w-0 lg:col-span-7">
                <ProgressPreview plan={examplePlan} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="detail-heading" className="border-b border-border bg-surface">
        <div className="mx-auto max-w-content px-4 py-14 md:px-6 md:py-20 lg:px-10">
          <SectionIntro label="Inside the plan" title="A schedule, a quiz and a deck." id="detail-heading">
            Every plan holds the same three things: the day-by-day schedule, topic quizzes and
            flashcard decks.
          </SectionIntro>

          <div className="mt-12 grid gap-8 border-t border-border pt-12 lg:grid-cols-12 lg:items-start lg:gap-12">
            <div className="lg:col-span-5">
              <h3 className="font-display text-h2 font-semibold text-ink">
                A schedule you can work through.
              </h3>
              <p className="mt-4 text-base text-ink-muted">
                Tasks are grouped by day and stay in date order. The bar shows how much of the plan
                is complete, and each row keeps the topic it came from.
              </p>
              <p className="mt-4 text-base text-ink-muted">
                Open the plan from your dashboard and check off work as you finish it.
              </p>
            </div>
            <div className="min-w-0 lg:col-span-7">
              <SchedulePreview plan={examplePlan} maxDays={2} />
            </div>
          </div>

          <div className="mt-12 grid gap-8 border-t border-border pt-12 lg:grid-cols-12 lg:items-start lg:gap-12">
            <div className="lg:order-2 lg:col-span-5">
              <h3 className="font-display text-h2 font-semibold text-ink">
                Practice before the exam.
              </h3>
              <p className="mt-4 text-base text-ink-muted">
                Open a quiz for a topic and get an answer checked on the spot, with a short
                explanation. Flashcard decks let you reveal the answer and mark a card known.
              </p>
              <p className="mt-4 text-base text-ink-muted">
                The tools are built from the topics in your plan, and you can make a new one when
                you need it.
              </p>
            </div>

            <div className="min-w-0 space-y-6 lg:order-1 lg:col-span-7">
              <div className="rounded-lg border border-border bg-paper p-4 md:p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-3">
                  <h4 className="font-display text-h3 font-semibold text-ink">Quiz</h4>
                  <p className="text-label font-semibold uppercase tracking-[0.14em] text-ink-muted">
                    Example
                  </p>
                </div>
                <p className="mt-3 text-xs text-ink-muted">Biology, {exampleQuiz.topic}</p>
                <div className="mt-4">
                  <QuizPlayer questions={exampleQuiz.questions} autoFocus={false} />
                </div>
              </div>

              <div className="rounded-lg border border-border bg-paper p-4 md:p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-3">
                  <h4 className="font-display text-h3 font-semibold text-ink">Flashcards</h4>
                  <p className="text-label font-semibold uppercase tracking-[0.14em] text-ink-muted">
                    Example
                  </p>
                </div>
                <p className="mt-3 text-xs text-ink-muted">Biology, {exampleFlashcards.topic}</p>
                <div className="mt-4">
                  <FlashcardViewer cards={exampleFlashcards.cards} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="closing-heading" className="border-b border-border bg-sunken">
        <div className="mx-auto flex max-w-content flex-col gap-6 px-4 py-12 md:flex-row md:items-center md:justify-between md:px-6 md:py-16 lg:px-10">
          <div className="border-l-2 border-l-accent pl-5">
            <h2 id="closing-heading" className="font-display text-title font-semibold text-ink">
              Start with one subject.
            </h2>
            <p className="mt-2 max-w-form text-base text-ink-muted">
              Add the subject, topics and exam date. The plan starts today.
            </p>
          </div>
          <Link to={planHref} className={`${primaryButtonClass} shrink-0`}>
            Create your plan
          </Link>
        </div>
      </section>
    </div>
  );
}
