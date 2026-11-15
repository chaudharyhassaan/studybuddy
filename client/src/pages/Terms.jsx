import { Link } from 'react-router-dom';

const linkClass =
  'text-accent underline underline-offset-2 transition-colors duration-150 hover:text-accent-hover';

export default function Terms() {
  return (
    <article className="mx-auto max-w-reading">
      <h1 className="font-display text-h1 font-semibold tracking-tight text-ink">
        Terms of Service
      </h1>
      <p className="mt-2 text-xs text-ink-muted">Last updated: 15 November 2026</p>

      <div className="mt-8 space-y-8">
        <section className="border-t border-border pt-6 first:border-t-0 first:pt-0">
          <h2 className="font-display text-h3 font-semibold text-ink">What this service is</h2>
          <p className="mt-2 text-base leading-relaxed text-ink">
            StudyBuddy Planner turns an exam date, its subject and topics, and the hours you can
            study each day into a day-by-day schedule. It also generates quizzes and flashcards for
            those topics. It is a free project built for the STEM2Connect AI Hackathon, Education
            track.
          </p>
        </section>

        <section className="border-t border-border pt-6">
          <h2 className="font-display text-h3 font-semibold text-ink">Accounts</h2>
          <p className="mt-2 text-base leading-relaxed text-ink">
            You need an account to create a plan. Provide a name, a valid email address and a
            password of at least 8 characters. Keep your password private. You are responsible for
            activity that happens under your account. Do not create an account for someone else or
            share your sign-in details.
          </p>
        </section>

        <section className="border-t border-border pt-6">
          <h2 className="font-display text-h3 font-semibold text-ink">Acceptable use</h2>
          <p className="mt-2 text-base leading-relaxed text-ink">
            Use the service for your own study. Do not attempt to break, overload or gain
            unauthorised access to the service or its data. Do not enter unlawful content or
            another person's private information into plan fields.
          </p>
        </section>

        <section className="border-t border-border pt-6">
          <h2 className="font-display text-h3 font-semibold text-ink">Study content generated for you</h2>
          <p className="mt-2 text-base leading-relaxed text-ink">
            Schedules, quizzes and flashcards are produced by Google Gemini from the details you
            enter. AI output can be incomplete or wrong. Check it against your course material
            before you rely on it. You remain responsible for what you study and for decisions you
            make from the content.
          </p>
        </section>

        <section className="border-t border-border pt-6">
          <h2 className="font-display text-h3 font-semibold text-ink">Availability</h2>
          <p className="mt-2 text-base leading-relaxed text-ink">
            The service runs on free infrastructure and may be slow, rate limited or unavailable.
            It can change or stop without notice, and there is no uptime guarantee. Daily AI
            generation is capped.
          </p>
        </section>

        <section className="border-t border-border pt-6">
          <h2 className="font-display text-h3 font-semibold text-ink">Ending an account</h2>
          <p className="mt-2 text-base leading-relaxed text-ink">
            There is no in-app account deletion yet. To ask for an account and its study data to be
            removed, contact the maintainer through the{' '}
            <a
              href="https://github.com/chaudharyhassaan/studybuddy-planner"
              className={linkClass}
            >
              project repository
            </a>
            .
          </p>
        </section>

        <section className="border-t border-border pt-6">
          <h2 className="font-display text-h3 font-semibold text-ink">Contact</h2>
          <p className="mt-2 text-base leading-relaxed text-ink">
            This is a hackathon project. Questions about these terms go to the project maintainer
            through the{' '}
            <a
              href="https://github.com/chaudharyhassaan/studybuddy-planner"
              className={linkClass}
            >
              project repository
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
