import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getErrorMessage } from '../lib/api';
import { useAuth } from '../context/useAuth';
import { destructiveButtonClass, secondaryButtonClass } from '../components/PrimaryButton';
import { usePageTitle } from '../lib/usePageTitle';

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  usePageTitle('Settings');

  function openDialog() {
    setDeleteError('');
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
    triggerRef.current?.focus();
  }

  async function confirmDelete() {
    setDeleting(true);
    setDeleteError('');

    try {
      await api.delete('/auth/me');
      dialogRef.current?.close();
      logout();
      navigate('/', { replace: true });
    } catch (error) {
      setDeleteError(getErrorMessage(error, 'Could not delete your account. Try again.'));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-form">
      <h1 className="font-display text-h1 font-semibold tracking-tight text-ink">Settings</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Review your account and the study data saved to it.
      </p>

      <section aria-labelledby="account-heading" className="mt-8">
        <h2
          id="account-heading"
          className="font-display text-h2 font-semibold tracking-tight text-ink"
        >
          Account
        </h2>
        <dl className="mt-3 overflow-hidden rounded-md border border-border bg-surface">
          <div className="flex flex-col gap-1 border-t border-border px-4 py-3 first:border-t-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
            <dt className="text-xs font-semibold uppercase text-ink-muted">Name</dt>
            <dd className="break-words text-sm text-ink">{user?.name}</dd>
          </div>
          <div className="flex flex-col gap-1 border-t border-border px-4 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
            <dt className="text-xs font-semibold uppercase text-ink-muted">Email</dt>
            <dd className="break-words text-sm text-ink">{user?.email}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="delete-account-heading" className="mt-10">
        <h2
          id="delete-account-heading"
          className="font-display text-h2 font-semibold tracking-tight text-ink"
        >
          Delete account
        </h2>
        <div className="mt-3 rounded-md border border-border bg-surface p-5">
          <p className="text-sm text-ink-muted">
            Deleting your account removes your name, email, plans, tasks, quizzes and flashcards.
            This cannot be undone.
          </p>
          <button
            ref={triggerRef}
            type="button"
            onClick={openDialog}
            className="mt-4 inline-flex h-11 items-center justify-center rounded-sm border border-error bg-transparent px-4 text-sm font-semibold text-error transition-colors duration-150 hover:bg-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:h-10"
          >
            Delete account
          </button>
        </div>
      </section>

      <dialog
        ref={dialogRef}
        aria-labelledby="delete-account-title"
        aria-describedby="delete-account-details"
        className="m-auto max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-[480px] overflow-y-auto rounded-md border border-border bg-surface p-6 text-ink backdrop:bg-ink/40"
      >
        <h2
          id="delete-account-title"
          className="font-display text-h2 font-semibold tracking-tight text-ink"
        >
          Delete your account?
        </h2>
        <p id="delete-account-details" className="mt-2 text-sm text-ink-muted">
          This removes your account and every plan, task, quiz and flashcard saved to it. This
          cannot be undone.
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
            {deleting ? 'Deleting account' : 'Delete account'}
          </button>
        </div>
      </dialog>
    </div>
  );
}
