import { useEffect, useId, useRef } from 'react';
import {
  destructiveButtonClass,
  primaryButtonClass,
  secondaryButtonClass,
} from './PrimaryButton';

// A native modal dialog provides the focus trap, Escape handling and the
// inert background. This wrapper adds a labelled alertdialog, a predictable
// default focus and focus return when it closes.
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  eyebrow,
  title,
  description,
  confirmLabel,
  busyLabel,
  busy = false,
  destructive = false,
  confirmDisabled = false,
  error = '',
  children,
}) {
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);
  const returnFocusRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      returnFocusRef.current = document.activeElement;
      dialog.showModal();

      if (destructive) {
        cancelRef.current?.focus();
      }
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, destructive]);

  function handleCancel(event) {
    event.preventDefault();

    if (!busy) {
      onClose();
    }
  }

  function handleClose() {
    returnFocusRef.current?.focus?.();
    onClose();
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!busy && !confirmDisabled) {
      onConfirm();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={handleCancel}
      onClose={handleClose}
      className="m-auto max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-[480px] overflow-y-auto rounded-lg border border-border bg-surface p-6 text-ink"
    >
      <form onSubmit={handleSubmit} noValidate>
        <p className="eyebrow">{eyebrow || title}</p>
        <h2 id={titleId} className="mt-3 font-display text-h2 font-semibold text-ink">
          {title}
        </h2>
        <p id={descriptionId} className="mt-2 text-sm text-ink-muted">
          {description}
        </p>

        {children}

        {error ? (
          <div
            role="alert"
            className="mt-4 rounded-md border border-border border-l-2 border-l-error bg-sunken px-4 py-3 text-sm text-error"
          >
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={onClose}
            disabled={busy}
            className={secondaryButtonClass}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy || confirmDisabled}
            className={destructive ? destructiveButtonClass : primaryButtonClass}
          >
            {busy ? busyLabel : confirmLabel}
          </button>
        </div>
      </form>
    </dialog>
  );
}
