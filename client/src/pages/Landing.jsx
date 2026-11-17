import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { primaryButtonClass } from '../components/PrimaryButton';
import {
  DashboardPreview,
  ProgressPreview,
  SchedulePreview,
  SetupPreview,
} from '../components/LandingPreviews';
import QuizPlayer from '../components/QuizPlayer';
import FlashcardViewer from '../components/FlashcardViewer';
import { exampleFlashcards, examplePlan, exampleQuiz } from '../lib/examplePlan';
import { usePageTitle } from '../lib/usePageTitle';

const quotedLinkClass =
  'text-sm text-ink-muted underline underline-offset-2 transition-colors duration-150 hover:text-ink';

function StepCopy({ number, title, children }) {
  return (
    <div>
      <p className="font-display text-display font-semibold tabular-nums text-ink-muted">{number}</p>
      <h3 className="mt-2 font-display text-h2 font-semibold tracking-tight text-ink">{title}</h3>
      <p className="mt-2 max-w-form text-base text-ink-muted">{children}</p>
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
        <div className="mx-auto max-w-content px-4 py-12 md:px-6 md:py-16 lg:px-10 lg:py-20">
          <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5 lg:pt-4">
              <p className="text-2xs font-semibold uppercase text-ink-muted">Study planner</p>
              <h1
                id="hero-heading"
                className="mt-3 font-display text-title font-semibold tracking-tight text-ink lg:text-display"
              >
                Know what to study each day until the exam.
              </h1>
              <p className="mt-5 max-w-form text-lg text-ink-muted">
                Enter the subject, its topics, the exam date and the hours you can study each day.
                You get a daily schedule, with quizzes and flashcards for your topics.
              </p>
              <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <Link to={planHref} className={primaryButtonClass}>
                  Create your plan
                </Link>
                <a href="#how-it-works" className={quotedLinkClass}>
                  See how it works
                </a>
              </div>
            </div>

            <div className="lg:col-span-7">
              <DashboardPreview plan={examplePlan} />
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" aria-labelledby="how-heading" className="border-b border-border">
        <div className="mx-auto max-w-content px-4 py-14 md:px-6 md:py-20 lg:px-10">
          <div className="max-w-form">
            <p className="text-2xs font-semibold uppercase text-ink-muted">How it works</p>
            <h2
              id="how-heading"
              className="mt-2 font-display text-title font-semibold tracking-tight text-ink"
            >
              From exam date to daily tasks.
            </h2>
            <p className="mt-3 text-base text-ink-muted">
              The plan covers each study day between today and the exam.
            </p>
          </div>

          <div className="mt-12 space-y-14 md:space-y-20">
            <div className="grid gap-6 lg:grid-cols-12 lg:items-center lg:gap-12">
              <div className="lg:order-1 lg:col-span-5">
                <StepCopy number="1" title="Enter the exam.">
                  Add the subject, its topics, the exam date and the hours you can study each day.
                  That is the whole setup.
                </StepCopy>
              </div>
              <div className="lg:order-2 lg:col-span-7">
                <SetupPreview plan={examplePlan} />
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-12 lg:items-center lg:gap-12">
              <div className="lg:order-2 lg:col-span-5">
                <StepCopy number="2" title="Get the plan.">
                  The app builds a daily schedule from those details, with a task for each study
                  day. It can also make quizzes and flashcards for each topic.
                </StepCopy>
              </div>
              <div className="lg:order-1 lg:col-span-7">
                <SchedulePreview plan={examplePlan} maxDays={1} />
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-12 lg:items-center lg:gap-12">
              <div className="lg:order-1 lg:col-span-5">
                <StepCopy number="3" title="Finish the day.">
                  Check off the tasks you complete. The progress bar and streak update from the work
                  you finish.
                </StepCopy>
              </div>
              <div className="lg:order-2 lg:col-span-7">
                <ProgressPreview plan={examplePlan} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="detail-heading" className="border-b border-border">
        <div className="mx-auto max-w-content px-4 py-14 md:px-6 md:py-20 lg:px-10">
          <div className="max-w-form">
            <p className="text-2xs font-semibold uppercase text-ink-muted">Inside the plan</p>
            <h2
              id="detail-heading"
              className="mt-2 font-display text-title font-semibold tracking-tight text-ink"
            >
              A schedule, a quiz and a deck.
            </h2>
            <p className="mt-3 text-base text-ink-muted">
              Every plan holds the same three things: the day-by-day schedule, topic quizzes and
              flashcard decks.
            </p>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
            <div className="lg:order-2 lg:col-span-5">
              <h3 className="font-display text-h2 font-semibold tracking-tight text-ink">
                A schedule you can work through.
              </h3>
              <p className="mt-3 text-base text-ink-muted">
                Tasks are grouped by day and stay in date order. The bar shows how much of the plan
                is complete, and each row keeps the topic it came from.
              </p>
              <p className="mt-3 text-base text-ink-muted">
                Open the plan from your dashboard and check off work as you finish it.
              </p>
            </div>
            <div className="lg:order-1 lg:col-span-7">
              <SchedulePreview plan={examplePlan} maxDays={2} />
            </div>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
            <div className="lg:col-span-5">
              <h3 className="font-display text-h2 font-semibold tracking-tight text-ink">
                Practice before the exam.
              </h3>
              <p className="mt-3 text-base text-ink-muted">
                Open a quiz for a topic and get an answer checked on the spot, with a short
                explanation. Flashcard decks let you reveal the answer and mark a card known.
              </p>
              <p className="mt-3 text-base text-ink-muted">
                The tools are built from the topics in your plan, and you can make a new one when
                you need it.
              </p>
            </div>

            <div className="space-y-6 lg:col-span-7">
              <div className="rounded-lg border border-border bg-surface p-4 md:p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h4 className="font-display text-h3 font-semibold text-ink">Quiz</h4>
                  <p className="text-2xs font-semibold uppercase text-ink-muted">Example</p>
                </div>
                <p className="mt-1 text-xs text-ink-muted">
                  Biology, {exampleQuiz.topic}
                </p>
                <div className="mt-4">
                  <QuizPlayer questions={exampleQuiz.questions} autoFocus={false} />
                </div>
              </div>

              <div className="rounded-lg border border-border bg-surface p-4 md:p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h4 className="font-display text-h3 font-semibold text-ink">Flashcards</h4>
                  <p className="text-2xs font-semibold uppercase text-ink-muted">Example</p>
                </div>
                <p className="mt-1 text-xs text-ink-muted">
                  Biology, {exampleFlashcards.topic}
                </p>
                <div className="mt-4">
                  <FlashcardViewer cards={exampleFlashcards.cards} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="closing-heading" className="border-y border-border bg-sunken">
        <div className="mx-auto flex max-w-content flex-col gap-6 px-4 py-12 md:flex-row md:items-center md:justify-between md:px-6 md:py-16 lg:px-10">
          <div>
            <h2
              id="closing-heading"
              className="font-display text-title font-semibold tracking-tight text-ink"
            >
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
