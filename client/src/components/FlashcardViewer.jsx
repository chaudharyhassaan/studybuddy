import { useState } from 'react';
import ProgressBar from './ProgressBar';
import { secondaryButtonClass } from './PrimaryButton';

export default function FlashcardViewer({ cards }) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState({});
  const [known, setKnown] = useState({});

  const card = cards[index];
  const isRevealed = Boolean(revealed[index]);
  const isKnown = Boolean(known[index]);
  const knownCount = cards.reduce(
    (total, _card, cardIndex) => total + (known[cardIndex] ? 1 : 0),
    0
  );
  const progress = Math.round(((index + 1) / cards.length) * 100);

  function toggleKnown() {
    setKnown((current) => ({ ...current, [index]: !current[index] }));
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-label font-semibold uppercase tracking-[0.14em] text-ink-muted">
          Card {index + 1} of {cards.length}
        </p>
        <p aria-live="polite" className="text-xs text-ink-muted">
          {knownCount} of {cards.length} marked known.
          {knownCount === cards.length ? ' Every card is marked known.' : ''}
        </p>
      </div>
      <ProgressBar
        value={progress}
        label={`Deck progress, card ${index + 1} of ${cards.length}`}
        className="mt-2"
      />

      <div className="mt-4 flex min-h-60 flex-col justify-center rounded-lg border border-border border-t-2 border-t-accent bg-surface p-6">
        <p className="text-label font-semibold uppercase tracking-[0.14em] text-ink-muted">Term</p>
        <p className="mt-3 font-display text-h2 font-semibold text-ink">{card.front}</p>
        {isRevealed ? (
          <>
            <div className="my-5 border-t border-border" />
            <p className="text-label font-semibold uppercase tracking-[0.14em] text-ink-muted">
              Answer
            </p>
            <p className="mt-2 text-sm text-ink">{card.back}</p>
          </>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {isRevealed ? (
          <button
            type="button"
            aria-pressed={isKnown}
            onClick={toggleKnown}
            className={`pressable inline-flex h-11 items-center justify-center rounded-sm border px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:h-10 ${
              isKnown
                ? 'border-success bg-accent-wash text-success'
                : 'border-border-strong bg-surface text-ink hover:bg-sunken'
            }`}
          >
            {isKnown ? 'Marked known' : 'Mark known'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setRevealed((current) => ({ ...current, [index]: true }))}
            className={secondaryButtonClass}
          >
            Show answer
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setIndex(index - 1)}
          disabled={index === 0}
          className={secondaryButtonClass}
        >
          Previous card
        </button>
        <button
          type="button"
          onClick={() => setIndex(index + 1)}
          disabled={index === cards.length - 1}
          className={secondaryButtonClass}
        >
          Next card
        </button>
      </div>
    </div>
  );
}
