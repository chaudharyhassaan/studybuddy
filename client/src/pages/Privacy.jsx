import { Link } from 'react-router-dom';

const linkClass =
  'text-accent underline underline-offset-2 transition-colors duration-150 hover:text-accent-hover';

export default function Privacy() {
  return (
    <article className="mx-auto max-w-reading">
      <h1 className="font-display text-h1 font-semibold tracking-tight text-ink">Privacy Policy</h1>
      <p className="mt-2 text-xs text-ink-muted">Last updated: 15 November 2026</p>

      <div className="mt-8 space-y-8">
        <section className="border-t border-border pt-6 first:border-t-0 first:pt-0">
          <h2 className="font-display text-h3 font-semibold text-ink">Data we collect</h2>
          <p className="mt-2 text-base leading-relaxed text-ink">
            When you create an account we store your name, email address and a bcrypt hash of your
            password. When you create a plan we store the subject, topics, exam date and hours per
            day you enter, the schedule generated from them, quizzes and flashcards, and your
            progress, including completed tasks, your streak and your last study date.
          </p>
        </section>

        <section className="border-t border-border pt-6">
          <h2 className="font-display text-h3 font-semibold text-ink">How it is stored</h2>
          <p className="mt-2 text-base leading-relaxed text-ink">
            Account and study data are stored in a MongoDB Atlas database. The API runs on a Node
            server. Passwords are hashed with bcrypt and are never stored or logged in plain text.
          </p>
        </section>

        <section className="border-t border-border pt-6">
          <h2 className="font-display text-h3 font-semibold text-ink">Sign-in and local storage</h2>
          <p className="mt-2 text-base leading-relaxed text-ink">
            After you sign in, the app stores your sign-in token in your browser's local storage
            under the key studybuddy.token. The token is sent to the API in the Authorization
            header, expires after 7 days, and is removed when you log out or when the API rejects
            it. The app does not set cookies.
          </p>
        </section>

        <section className="border-t border-border pt-6">
          <h2 className="font-display text-h3 font-semibold text-ink">AI processing</h2>
          <p className="mt-2 text-base leading-relaxed text-ink">
            When you generate a plan, the subject, topics, exam date, hours per day and start date
            are sent to Google Gemini. Generating a quiz or flashcard deck sends the topic and the
            number of questions or cards. Your email address and password are not sent. Generated
            text is validated before it is stored.
          </p>
        </section>

        <section className="border-t border-border pt-6">
          <h2 className="font-display text-h3 font-semibold text-ink">Retention and deletion</h2>
          <p className="mt-2 text-base leading-relaxed text-ink">
            Plans and their tasks, quizzes and flashcards stay until the plan is deleted or removal
            is requested. Deleting a plan removes its tasks, quizzes and flashcards. Account
            deletion is not available in the app yet.
          </p>
        </section>

        <section className="border-t border-border pt-6">
          <h2 className="font-display text-h3 font-semibold text-ink">Your choices</h2>
          <div className="mt-4 rounded-md border border-border bg-surface p-5">
            <p className="text-base leading-relaxed text-ink">
              You can ask for your account and study data to be removed through the{' '}
              <a
                href="https://github.com/chaudharyhassaan/studybuddy-planner"
                className={linkClass}
              >
                project repository
              </a>
              . You can stop using the service at any time, and logging out removes the token from
              this browser.
            </p>
          </div>
        </section>

        <section className="border-t border-border pt-6">
          <h2 className="font-display text-h3 font-semibold text-ink">Contact</h2>
          <p className="mt-2 text-base leading-relaxed text-ink">
            This is a hackathon project. Questions about this policy go to the project maintainer
            through the{' '}
            <a
              href="https://github.com/chaudharyhassaan/studybuddy-planner"
              className={linkClass}
            >
              project repository
            </a>
            . The{' '}
            <Link to="/terms" className={linkClass}>
              Terms of Service
            </Link>{' '}
            cover how the service may be used.
          </p>
        </section>
      </div>
    </article>
  );
}
