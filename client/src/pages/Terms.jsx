import { Link } from 'react-router-dom';
import { usePageTitle } from '../lib/usePageTitle';
import { accentLinkClass as linkClass } from '../components/PrimaryButton';

const sectionClass = 'border-t border-border pt-8';

export default function Terms() {
  usePageTitle('Terms of Service');

  return (
    <article aria-labelledby="terms-heading" className="mx-auto max-w-reading">
      <header className="border-b border-border pb-8">
        <p className="eyebrow">Legal</p>
        <h1
          id="terms-heading"
          className="mt-3 font-display text-title font-semibold text-ink"
        >
          Terms of Service
        </h1>
        <p className="mt-2 text-xs text-ink-muted">Last updated: 16 November 2026</p>
      </header>

      <div className="mt-10 space-y-10">
        <section className={`${sectionClass} first:border-t-0 first:pt-0`}>
          <h2 className="font-display text-h3 font-semibold text-ink">What this service is</h2>
          <p className="mt-2 text-base leading-relaxed text-ink">
            StudyBuddy Planner turns a subject, its topics, an exam date and the hours you can study
            each day into a day-by-day schedule. It also makes quizzes and flashcards for those
            topics. It is a free project built for the STEM2Connect AI Hackathon, Education track.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className="font-display text-h3 font-semibold text-ink">Accounts</h2>
          <p className="mt-2 text-base leading-relaxed text-ink">
            You need an account to create a plan. You give a name, a valid email address and a
            password of at least 8 characters. Passwords are hashed with bcrypt before they are
            stored. Keep your sign-in details private, and do not create an account for someone
            else.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className="font-display text-h3 font-semibold text-ink">Acceptable use</h2>
          <p className="mt-2 text-base leading-relaxed text-ink">
            Use the service for your own study. Do not attempt to break, overload or gain
            unauthorised access to the service or its data. Do not enter unlawful content or
            another person's private information into plan fields.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className="font-display text-h3 font-semibold text-ink">
            Study content generated for you
          </h2>
          <p className="mt-2 text-base leading-relaxed text-ink">
            Schedules, quizzes and flashcards are produced by Groq from the details you enter. If
            Groq is unavailable, Google Gemini is used instead. AI output can be incomplete or
            wrong. Check it against your course material before you rely on it. You remain
            responsible for what you study and for decisions you make from the content.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className="font-display text-h3 font-semibold text-ink">Availability</h2>
          <p className="mt-2 text-base leading-relaxed text-ink">
            The service runs on free infrastructure and may be slow, rate limited or unavailable.
            It can change or stop without notice, and there is no uptime guarantee. Daily AI
            generation is capped.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className="font-display text-h3 font-semibold text-ink">Ending an account</h2>
          <p className="mt-2 text-base leading-relaxed text-ink">
            You can delete your account in{' '}
            <Link to="/settings" className={linkClass}>
              Settings
            </Link>
            . Deleting it removes your name, email and every plan, task, quiz and flashcard saved
            to the account. This cannot be undone. Deleting a single plan removes its tasks,
            quizzes and flashcards as well.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className="font-display text-h3 font-semibold text-ink">Contact</h2>
          <p className="mt-2 text-base leading-relaxed text-ink">
            This is a hackathon project. Questions about these terms go to{' '}
            <a href="mailto:support@studybuddy.example" className={linkClass}>
              support@studybuddy.example
            </a>
            . The{' '}
            <Link to="/privacy" className={linkClass}>
              Privacy Policy
            </Link>{' '}
            explains what data the service stores.
          </p>
        </section>
      </div>
    </article>
  );
}
