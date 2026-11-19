import { useEffect, useRef, useState } from 'react';
import { Check, Copy, FileText, UploadSimple, X } from '@phosphor-icons/react';
import { api, getErrorMessage } from '../lib/api';
import PrimaryButton, {
  quietButtonClass,
  secondaryButtonClass,
} from '../components/PrimaryButton';
import { usePageTitle } from '../lib/usePageTitle';

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_PROMPT = 400;
const ACCEPTED_EXTENSIONS = [
  '.pdf',
  '.docx',
  '.pptx',
  '.txt',
  '.md',
  '.csv',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
];
const ACCEPT_ATTRIBUTE = ACCEPTED_EXTENSIONS.join(',');
const TYPE_MESSAGE = 'Choose a PDF, DOCX, PPTX, TXT, MD, CSV, PNG, JPG or WEBP file.';

const PROMPT_SUGGESTIONS = [
  '5 bullet points',
  "Explain like I'm 12",
  'Exam revision notes',
];

const inputClass =
  'block w-full min-w-0 rounded-sm border bg-surface px-3 py-2 text-base text-ink placeholder:text-ink-muted transition-colors duration-150 hover:border-ink-muted focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:border-border disabled:bg-sunken disabled:text-ink-muted';

const dropZoneClass =
  'rounded-md border border-dashed px-5 py-8 text-center transition-colors duration-150';

function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 102.4) / 10} KB`;
  }

  return `${Math.round(bytes / 104857.6) / 10} MB`;
}

function fileExtension(name) {
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot).toLowerCase();
}

function fileProblem(file) {
  if (!ACCEPTED_EXTENSIONS.includes(fileExtension(file.name || ''))) {
    return TYPE_MESSAGE;
  }

  if (file.size > MAX_BYTES) {
    return 'That file is larger than 10 MB.';
  }

  if (file.size === 0) {
    return 'That file is empty.';
  }

  return '';
}

function promptError(error) {
  const fields = error?.response?.data?.error?.fields;

  if (typeof fields?.prompt === 'string' && fields.prompt.trim()) {
    return fields.prompt;
  }

  return getErrorMessage(error, 'Could not summarize that document. Try again.');
}

export default function SummarizeDocument() {
  const inputRef = useRef(null);
  const chooseRef = useRef(null);
  const promptRef = useRef(null);
  const resultRef = useRef(null);
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  usePageTitle('Summarize document');

  useEffect(() => {
    if (result) {
      resultRef.current?.focus();
    }
  }, [result]);

  function acceptFile(next) {
    const problem = fileProblem(next);

    if (problem) {
      setError(problem);
      setFile(null);
      return;
    }

    setError('');
    setResult(null);
    setCopied(false);
    setFile(next);
    promptRef.current?.focus();
  }

  function chooseFile(event) {
    const next = event.target.files?.[0];
    event.target.value = '';

    if (next) {
      acceptFile(next);
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);

    const dropped = Array.from(event.dataTransfer.files || []);

    if (dropped.length > 1) {
      setError('Upload one file at a time.');
      return;
    }

    if (dropped.length === 1) {
      acceptFile(dropped[0]);
    }
  }

  function removeFile() {
    setFile(null);
    setResult(null);
    setError('');
    setCopied(false);
    chooseRef.current?.focus();
  }

  function applySuggestion(value) {
    setPrompt(value);
    promptRef.current?.focus();
  }

  async function submit(event) {
    event.preventDefault();

    if (!file) {
      setError('Choose a document to summarize.');
      return;
    }

    const problem = fileProblem(file);

    if (problem) {
      setError(problem);
      return;
    }

    if (prompt.trim().length < 3) {
      setError('Describe how to summarize the document.');
      promptRef.current?.focus();
      return;
    }

    const body = new FormData();
    body.append('file', file);
    body.append('prompt', prompt.trim());

    setBusy(true);
    setError('');
    setCopied(false);

    try {
      const { data } = await api.post('/documents/summarize', body, { timeout: 120000 });
      setResult(data);
    } catch (requestError) {
      setError(promptError(requestError));
    } finally {
      setBusy(false);
    }
  }

  async function copySummary() {
    if (!result) {
      return;
    }

    try {
      await navigator.clipboard.writeText(result.summary);
      setCopied(true);
    } catch {
      setError('Could not copy the summary. Select the text and copy it.');
    }
  }

  return (
    <div className="max-w-form">
      <p className="eyebrow">Documents</p>
      <h1 className="mt-3 font-display text-h1 font-semibold text-ink">Summarize a document</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Upload one document, say how you want it summarized, and read the result here. The file is
        read once for this request and is not saved to your account.
      </p>

      <form onSubmit={submit} noValidate aria-busy={busy} className="mt-8">
        <div className="rounded-lg border border-border bg-surface p-5">
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`${dropZoneClass} ${
              dragging
                ? 'border-accent bg-accent-wash'
                : 'border-border-strong bg-paper'
            }`}
          >
            <UploadSimple size={24} aria-hidden="true" className="mx-auto text-ink-muted" />
            <p id="upload-help" className="mt-3 text-sm font-semibold text-ink">
              Drag a document here, or choose a file
            </p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-ink-muted">
              PDF, DOCX, PPTX, TXT, MD, CSV, PNG, JPG or WEBP. One file, up to 10 MB.
            </p>
            <button
              ref={chooseRef}
              type="button"
              onClick={() => inputRef.current?.click()}
              aria-describedby="upload-help"
              className={`${secondaryButtonClass} mt-4`}
            >
              Choose file
            </button>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT_ATTRIBUTE}
              onChange={chooseFile}
              tabIndex={-1}
              className="sr-only"
            />
          </div>

          {file ? (
            <div className="mt-4 flex items-start gap-3 rounded-md border border-border bg-paper px-4 py-3">
              <FileText size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-ink-muted" />
              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-semibold text-ink">{file.name}</p>
                <p className="mt-0.5 text-xs text-ink-muted">{formatBytes(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className={quietButtonClass}
                aria-label="Remove file"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          ) : null}

          <div className="mt-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <label htmlFor="summary-prompt" className="text-sm font-semibold text-ink">
                How should it be summarized?
              </label>
              <span className="text-xs tabular-nums text-ink-muted">
                {prompt.length}/{MAX_PROMPT}
              </span>
            </div>
            <textarea
              ref={promptRef}
              id="summary-prompt"
              rows={3}
              maxLength={MAX_PROMPT}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="For example: five bullet points for exam revision."
              className={`${inputClass} mt-2 min-h-24 resize-y`}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {PROMPT_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => applySuggestion(suggestion)}
                  className="pressable inline-flex h-10 items-center rounded-sm border border-border-strong bg-surface px-3 text-xs font-semibold text-ink hover:bg-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <PrimaryButton type="submit" disabled={busy}>
              {busy ? 'Summarizing' : result ? 'Summarize again' : 'Summarize'}
            </PrimaryButton>
            {busy ? (
              <p role="status" className="text-sm text-ink-muted">
                Reading the document and writing the summary.
              </p>
            ) : null}
          </div>

          {error ? (
            <p
              role="alert"
              className="mt-5 rounded-md border border-border border-l-2 border-l-error bg-sunken px-4 py-3 text-sm text-error"
            >
              {error}
            </p>
          ) : null}
        </div>
      </form>

      {busy ? (
        <div aria-hidden="true" className="mt-8 rounded-lg border border-border bg-surface p-5">
          <div className="h-5 w-40 rounded-sm bg-sunken motion-safe:animate-pulse" />
          <div className="mt-4 h-4 w-full rounded-sm bg-sunken motion-safe:animate-pulse" />
          <div className="mt-2 h-4 w-11/12 rounded-sm bg-sunken motion-safe:animate-pulse" />
          <div className="mt-2 h-4 w-3/4 rounded-sm bg-sunken motion-safe:animate-pulse" />
        </div>
      ) : null}

      {!busy && result ? (
        <section aria-labelledby="summary-heading" className="mt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2
              ref={resultRef}
              id="summary-heading"
              tabIndex={-1}
              className="font-display text-h2 font-semibold text-ink"
            >
              Summary
            </h2>
            <span className="text-xs text-ink-muted">From {file?.name}</span>
          </div>

          {result.truncated ? (
            <p className="mt-3 rounded-md border border-border border-l-2 border-l-warning bg-accent-soft px-4 py-3 text-sm text-ink">
              This document was long, so only the first 16,000 characters were summarized.
            </p>
          ) : null}

          <div className="mt-4 rounded-lg border border-border bg-surface p-5">
            <p className="whitespace-pre-wrap break-words text-sm text-ink">{result.summary}</p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" onClick={copySummary} className={secondaryButtonClass}>
              {copied ? (
                <Check size={16} aria-hidden="true" className="mr-2" />
              ) : (
                <Copy size={16} aria-hidden="true" className="mr-2" />
              )}
              {copied ? 'Copied' : 'Copy summary'}
            </button>
            <p aria-live="polite" className="text-xs text-ink-muted">
              {copied ? 'Summary copied to the clipboard.' : ''}
            </p>
          </div>

          <p className="mt-4 text-xs text-ink-muted">
            Change the prompt above and choose Summarize again. The selected file stays in this page
            until you remove it or reload.
          </p>
        </section>
      ) : null}

      {!busy && !result ? (
        <p className="mt-6 max-w-form text-sm text-ink-muted">
          Text documents, images and scanned PDFs are supported. Long documents are shortened
          before the summary is written, and the page tells you when that happens.
        </p>
      ) : null}
    </div>
  );
}
