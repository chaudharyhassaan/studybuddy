import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getErrorMessage } from '../lib/api';
import { useAuth } from '../context/useAuth';
import { secondaryButtonClass } from '../components/PrimaryButton';
import ConfirmDialog from '../components/ConfirmDialog';
import TextField from '../components/TextField';
import { usePageTitle } from '../lib/usePageTitle';

function requestMessage(error, fallback) {
  const fields = error?.response?.data?.error?.fields;
  const fieldMessage =
    fields && Object.values(fields).find((value) => typeof value === 'string' && value.trim());

  return fieldMessage || getErrorMessage(error, fallback);
}

export default function Settings() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [nameOpen, setNameOpen] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [namePassword, setNamePassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameNotice, setNameNotice] = useState('');

  usePageTitle('Settings');

  function openNameDialog() {
    setNameValue(user?.name || '');
    setNamePassword('');
    setNameError('');
    setNameNotice('');
    setNameOpen(true);
  }

  function closeNameDialog() {
    if (!nameSaving) {
      setNameOpen(false);
      setNamePassword('');
      setNameError('');
    }
  }

  async function confirmName() {
    const name = nameValue.trim();

    if (!name) {
      setNameError('Enter your name.');
      return;
    }

    if (!namePassword) {
      setNameError('Enter your password.');
      return;
    }

    setNameSaving(true);
    setNameError('');

    try {
      const { data } = await api.patch('/auth/me', { name, password: namePassword });
      updateUser(data.user);
      setNameOpen(false);
      setNamePassword('');
      setNameNotice('Your name was updated.');
    } catch (error) {
      setNameError(requestMessage(error, 'Could not change your name. Try again.'));
    } finally {
      setNameSaving(false);
    }
  }

  function openDialog() {
    setDeletePassword('');
    setDeleteConfirmation('');
    setDeleteError('');
    setDeleteOpen(true);
  }

  function closeDialog() {
    if (!deleting) {
      setDeleteOpen(false);
      setDeletePassword('');
      setDeleteConfirmation('');
      setDeleteError('');
    }
  }

  async function confirmDelete() {
    if (!deletePassword) {
      setDeleteError('Enter your password.');
      return;
    }

    if (deleteConfirmation.trim() !== 'DELETE') {
      setDeleteError('Type DELETE to confirm.');
      return;
    }

    setDeleting(true);
    setDeleteError('');

    try {
      await api.delete('/auth/me', {
        data: { password: deletePassword, confirmation: deleteConfirmation.trim() },
      });
      setDeleteOpen(false);
      logout();
      navigate('/', { replace: true });
    } catch (error) {
      setDeleteError(requestMessage(error, 'Could not delete your account. Try again.'));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-form">
      <p className="eyebrow">Settings</p>
      <h1 className="mt-3 font-display text-h1 font-semibold text-ink">Settings</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Review your account and the study data saved to it.
      </p>

      <section aria-labelledby="account-heading" className="mt-8">
        <h2
          id="account-heading"
          className="font-display text-h2 font-semibold text-ink"
        >
          Account
        </h2>

        <dl className="mt-4 overflow-hidden rounded-lg border border-border bg-surface">
          <div className="flex flex-col gap-1 border-t border-border px-5 py-4 first:border-t-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
            <dt className="text-label font-semibold uppercase tracking-[0.14em] text-ink-muted">
              Name
            </dt>
            <dd className="break-words text-sm text-ink">{user?.name}</dd>
          </div>
          <div className="flex flex-col gap-1 border-t border-border px-5 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
            <dt className="text-label font-semibold uppercase tracking-[0.14em] text-ink-muted">
              Email
            </dt>
            <dd className="break-words text-sm text-ink">{user?.email}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="change-name-heading" className="mt-10">
        <h2
          id="change-name-heading"
          className="font-display text-h2 font-semibold text-ink"
        >
          Change name
        </h2>
        <div className="mt-4 rounded-lg border border-border bg-surface p-5">
          <p className="text-sm text-ink-muted">
            Update the name shown in the sidebar and header. Confirm the change with your current
            password.
          </p>
          <button
            type="button"
            onClick={openNameDialog}
            className={`${secondaryButtonClass} mt-4`}
          >
            Change name
          </button>
          {nameNotice ? (
            <p role="status" className="mt-3 text-sm text-success">
              {nameNotice}
            </p>
          ) : null}
        </div>
      </section>

      <ConfirmDialog
        open={nameOpen}
        onClose={closeNameDialog}
        onConfirm={confirmName}
        eyebrow="Change name"
        title="Change your name?"
        description="Enter the name you want to use, then confirm with your current password."
        confirmLabel="Change name"
        busyLabel="Saving name"
        busy={nameSaving}
        error={nameError}
      >
        <div className="mt-5 space-y-4">
          <TextField
            id="account-name"
            label="Name"
            value={nameValue}
            onChange={(event) => setNameValue(event.target.value)}
            autoComplete="name"
            maxLength={80}
            required
          />
          <TextField
            id="account-name-password"
            label="Current password"
            type="password"
            value={namePassword}
            onChange={(event) => setNamePassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
      </ConfirmDialog>

      <section aria-labelledby="delete-account-heading" className="mt-10">
        <h2
          id="delete-account-heading"
          className="font-display text-h2 font-semibold text-ink"
        >
          Delete account
        </h2>
        <div className="mt-4 rounded-lg border border-border border-l-2 border-l-error bg-sunken p-5">
          <p className="text-sm text-ink-muted">
            Deleting your account permanently deletes your account, plans, tasks, quizzes and
            flashcards. This cannot be undone.
          </p>
          <button
            type="button"
            onClick={openDialog}
            className="pressable mt-4 inline-flex h-11 items-center justify-center rounded-sm border border-error bg-transparent px-4 text-sm font-semibold text-error hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:h-10"
          >
            Delete account
          </button>
        </div>
      </section>

      <ConfirmDialog
        open={deleteOpen}
        onClose={closeDialog}
        onConfirm={confirmDelete}
        eyebrow="Delete account"
        title="Delete your account?"
        description="Your account and all of your plans, tasks, quizzes and flashcards will be permanently deleted. This cannot be undone."
        confirmLabel="Delete account"
        busyLabel="Deleting account"
        busy={deleting}
        destructive
        error={deleteError}
      >
        <div className="mt-5 space-y-4">
          <TextField
            id="delete-account-password"
            label="Current password"
            type="password"
            value={deletePassword}
            onChange={(event) => setDeletePassword(event.target.value)}
            autoComplete="current-password"
            required
          />
          <TextField
            id="delete-account-confirmation"
            label="Type DELETE to confirm"
            value={deleteConfirmation}
            onChange={(event) => setDeleteConfirmation(event.target.value)}
            autoComplete="off"
            helper="The account and its study data cannot be recovered."
            required
          />
        </div>
      </ConfirmDialog>
    </div>
  );
}
