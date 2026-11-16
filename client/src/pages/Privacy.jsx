import { Link } from 'react-router-dom';

const linkClass =
  'text-accent underline underline-offset-2 transition-colors duration-150 hover:text-accent-hover';

const sectionClass = 'border-t border-border pt-6';

export default function Privacy() {
  return (
    <article className="mx-auto max-w-reading">
      <h1 className="font-display text-h1 font-semibold tracking-tight text-ink">Privacy Policy</h1>
      <p className="mt-2 text-xs text-ink-muted">Last updated: 16 November 2026</p>

      <div className="mt-8 space-y-8">
        <section>
          <h2 className="font-display text-h3 font-semibold text-ink">Data we collect</h2>
          <p className="mt-2 text-base leading-relaxed text-ink">
            When you create an account we store your name, email address and a bcrypt hash of your
            password. When you create a plan we store the subject, topics, exam date and hours per
            day you enter, the schedule generated from them, the quizzes and flashcards, and your
            progress, including completed tasks, your streak and your last study date.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className="font-display text-h3 font-semibold text-ink">How it is stored</h2>
          <p className="mt-2 text-base leading-relaxed text-ink">
            Account and study data are stored in a MongoDB Atlas database. The API runs on a Node
            server. Passwords are hashed with bcrypt and are never stored or logged in plain text.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className="font-display text-h3 font-semibold text-ink">Sign-in and local storage</h2>
          <p className="mt-2 text-base leading-relaxed text-ink">
            After you sign in, the app stores your sign-in token in your browser's local storage
            under the key studybuddy.token. The token is sent to the API in the Authorization
            header, expires after 7 days, and is removed when you log out or when the API rejects
            it. The app does not set cookies.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className="font-display text-h3 font-semibold text-ink">
            Third-party AI processing
          </h2>
          <p className="mt-2 text-base leading-relaxed text-ink">
            Plan generation uses Google Gemini. When you generate a plan, the subject, topics, exam
            date, hours per day and start date are sent to Google Gemini. Generating a quiz or a
            flashcard deck sends the topic and the number of questions or cards. Your name, email
            address and password are not sent. Generated text is validated before it is stored.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className="font-display text-h3 font-semibold text-ink">Retention and deletion</h2>
          <p className="mt-2 text-base leading-relaxed text-ink">
            Plans and their tasks, quizzes and flashcards stay until you delete the plan or your
            account. Deleting a plan removes its tasks, quizzes and flashcards. You can delete your
            account in{' '}
            <Link to="/settings" className={linkClass}>
              Settings
            </Link>
            , which removes your name, email and every plan, task, quiz and flashcard saved to the
            account. Deletion cannot be undone.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className="font-display text-h3 font-semibold text-ink">Your choices</h2>
          <div className="mt-4 rounded-md border border-border bg-surface p-5">
            <p className="text-base leading-relaxed text-ink">
              You can delete a plan from its page, or delete your account in Settings. Logging out
              removes the sign-in token from this browser. Questions about your data go to the
              contact address below.
            </p>
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className="font-display text-h3 font-semibold text-ink">Contact</h2>
          <p className="mt-2 text-base leading-relaxed text-ink">
            This is a hackathon project. Questions about this policy go to{' '}
            <a href="mailto:support@studybuddy.example" className={linkClass}>
              support@studybuddy.example
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
