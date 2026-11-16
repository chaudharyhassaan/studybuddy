import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api, getErrorMessage } from '../lib/api';
import { plural } from '../lib/plans';
import { secondaryButtonClass } from './PrimaryButton';
import QuizPlayer from './QuizPlayer';
import FlashcardViewer from './FlashcardViewer';

const QUIZ_QUESTIONS = 5;
const DECK_CARDS = 8;

const retryLinkClass =
  'mt-2 text-sm font-semibold underline underline-offset-2 transition-colors duration-150 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

function topicKey(topic) {
  return topic.toLowerCase();
}

function latestByTopic(items) {
  const latest = new Map();

  for (const item of items) {
    const key = topicKey(item.topic);

    if (!latest.has(key)) {
      latest.set(key, item);
    }
  }

  return latest;
}

async function fetchTools(planId) {
  const [quizResponse, deckResponse] = await Promise.all([
    api.get('/ai/quiz', { params: { planId } }),
    api.get('/ai/flashcards', { params: { planId } }),
  ]);

  return { quizzes: quizResponse.data.quizzes, flashcards: deckResponse.data.flashcards };
}

function ToolsSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="mt-3">
      <p className="text-sm text-ink-muted">Loading your study tools.</p>
      <div
        aria-hidden="true"
        className="mt-3 overflow-hidden rounded-md border border-border bg-surface"
      >
        {[0, 1, 2].map((row) => (
          <div key={row} className="border-t border-border px-4 py-4 first:border-t-0">
            <div className="h-4 w-40 rounded-sm bg-sunken motion-safe:animate-pulse" />
            <div className="mt-2 h-3 w-56 max-w-full rounded-sm bg-sunken motion-safe:animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ToolError({ message, onRetry }) {
  return (
    <div
      role="alert"
      className="rounded-md border border-border border-l-2 border-l-error bg-surface px-4 py-3 text-sm text-error"
    >
      <p>{message}</p>
      <button type="button" onClick={onRetry} className={retryLinkClass}>
        Try again
      </button>
    </div>
  );
}

function GeneratingPanel({ kind, topic }) {
  return (
    <div aria-busy="true" aria-live="polite">
      <p className="text-sm text-ink-muted">
        {kind === 'quiz'
          ? `Generating ${plural(QUIZ_QUESTIONS, 'question')} for ${topic}.`
          : `Generating ${plural(DECK_CARDS, 'card')} for ${topic}.`}
      </p>
      {kind === 'quiz' ? (
        <div
          aria-hidden="true"
          className="mt-4 rounded-md border border-border bg-surface p-5"
        >
          <div className="h-5 w-3/4 rounded-sm bg-sunken motion-safe:animate-pulse" />
          <div className="mt-4 space-y-2">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="h-11 rounded-sm bg-sunken motion-safe:animate-pulse" />
            ))}
          </div>
        </div>
      ) : (
        <div
          aria-hidden="true"
          className="mt-4 flex min-h-60 flex-col justify-center rounded-md border border-border bg-surface p-6"
        >
          <div className="h-3 w-14 rounded-sm bg-sunken motion-safe:animate-pulse" />
          <div className="mt-4 h-6 w-2/3 rounded-sm bg-sunken motion-safe:animate-pulse" />
          <div className="mt-3 h-4 w-full rounded-sm bg-sunken motion-safe:animate-pulse" />
          <div className="mt-2 h-4 w-1/2 rounded-sm bg-sunken motion-safe:animate-pulse" />
        </div>
      )}
    </div>
  );
}

export default function StudyTools({ planId, topics }) {
  const [quizzes, setQuizzes] = useState([]);
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [active, setActive] = useState(null);
  const [generating, setGenerating] = useState(null);
  const [generateError, setGenerateError] = useState(null);
  const headingRef = useRef(null);
  const triggerRef = useRef(null);

  const applyTools = useCallback((data) => {
    setQuizzes(data.quizzes);
    setDecks(data.flashcards);
    setLoadError('');
  }, []);

  useEffect(() => {
    let ignore = false;

    fetchTools(planId)
      .then((data) => {
        if (!ignore) {
          applyTools(data);
        }
      })
      .catch((error) => {
        if (!ignore) {
          setLoadError(getErrorMessage(error, 'Could not load your study tools. Try again.'));
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [planId, applyTools]);

  useEffect(() => {
    if (active) {
      headingRef.current?.focus();
    }
  }, [active]);

  const quizzesByTopic = useMemo(() => latestByTopic(quizzes), [quizzes]);
  const decksByTopic = useMemo(() => latestByTopic(decks), [decks]);

  const activeQuiz =
    active?.kind === 'quiz' ? quizzesByTopic.get(topicKey(active.topic)) : null;
  const activeDeck =
    active?.kind === 'flashcards' ? decksByTopic.get(topicKey(active.topic)) : null;
  const isGeneratingActive = Boolean(
    active &&
      generating &&
      generating.kind === active.kind &&
      generating.topic === active.topic
  );
  const activeError =
    active && generateError && generateError.kind === active.kind && generateError.topic === active.topic
      ? generateError.message
      : '';

  async function generate(kind, topic) {
    setGenerateError(null);
    setGenerating({ kind, topic });

    try {
      if (kind === 'quiz') {
        const { data } = await api.post('/ai/quiz', {
          planId,
          topic,
          count: QUIZ_QUESTIONS,
        });

        setQuizzes((current) => [
          { id: `local-quiz-${Date.now()}`, topic, questions: data },
          ...current,
        ]);
      } else {
        const { data } = await api.post('/ai/flashcards', {
          planId,
          topic,
          count: DECK_CARDS,
        });

        setDecks((current) => [
          { id: `local-deck-${Date.now()}`, topic, cards: data },
          ...current,
        ]);
      }
    } catch (error) {
      setGenerateError({
        kind,
        topic,
        message: getErrorMessage(error, 'Could not generate this study tool. Try again.'),
      });
    } finally {
      setGenerating(null);
    }
  }

  function openTool(kind, topic) {
    triggerRef.current = document.activeElement;
    setActive({ kind, topic });
    setGenerateError(null);

    const existing =
      kind === 'quiz' ? quizzesByTopic.get(topicKey(topic)) : decksByTopic.get(topicKey(topic));

    if (!existing) {
      generate(kind, topic);
    }
  }

  function closeTool() {
    setActive(null);
    setGenerating(null);
    setGenerateError(null);
    triggerRef.current?.focus();
  }

  async function retryLoad() {
    setLoading(true);
    setLoadError('');

    try {
      applyTools(await fetchTools(planId));
    } catch (error) {
      setLoadError(getErrorMessage(error, 'Could not load your study tools. Try again.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section aria-labelledby="study-tools-heading">
      <h2
        id="study-tools-heading"
        className="font-display text-h2 font-semibold tracking-tight text-ink"
      >
        Study tools
      </h2>
      <p className="mt-2 text-sm text-ink-muted">
        Practise a topic with a quiz or a flashcard deck. Tools are generated from the topics in
        this plan.
      </p>

      {loading ? <ToolsSkeleton /> : null}

      {!loading && loadError ? (
        <div
          role="alert"
          className="mt-3 rounded-md border border-border border-l-2 border-l-error bg-sunken px-4 py-3 text-sm text-error"
        >
          <p>{loadError}</p>
          <button type="button" onClick={retryLoad} className={retryLinkClass}>
            Try again
          </button>
        </div>
      ) : null}

      {!loading && !loadError ? (
        <>
          {topics.length === 0 ? (
            <div className="mt-3 rounded-md border border-border bg-sunken p-5">
              <p className="text-sm font-semibold text-ink">No topics in this plan.</p>
            </div>
          ) : (
            <ul className="mt-3 overflow-hidden rounded-md border border-border bg-surface">
              {topics.map((topic) => {
                const quiz = quizzesByTopic.get(topicKey(topic));
                const deck = decksByTopic.get(topicKey(topic));
                const quizBusy = generating?.kind === 'quiz' && generating.topic === topic;
                const deckBusy =
                  generating?.kind === 'flashcards' && generating.topic === topic;
                const status = [quiz, deck]
                  .map((tool, toolIndex) =>
                    tool
                      ? toolIndex === 0
                        ? `Quiz ready, ${plural(tool.questions.length, 'question')}`
                        : `Deck ready, ${plural(tool.cards.length, 'card')}`
                      : null
                  )
                  .filter(Boolean)
                  .join('. ');

                return (
                  <li
                    key={topic}
                    className="border-t border-border px-4 py-4 first:border-t-0"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-ink">{topic}</h3>
                        <p className="mt-1 text-xs text-ink-muted">
                          {status ? `${status}.` : 'No study tools generated yet.'}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openTool('quiz', topic)}
                          disabled={Boolean(generating)}
                          className={secondaryButtonClass}
                        >
                          {quizBusy ? 'Generating quiz' : quiz ? 'Open quiz' : 'Create quiz'}
                        </button>
                        <button
                          type="button"
                          onClick={() => openTool('flashcards', topic)}
                          disabled={Boolean(generating)}
                          className={secondaryButtonClass}
                        >
                          {deckBusy ? 'Generating deck' : deck ? 'Open deck' : 'Create deck'}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {active ? (
            <div
              id="study-tools-workspace"
              role="region"
              aria-label={`${active.kind === 'quiz' ? 'Quiz' : 'Flashcards'} for ${active.topic}`}
              className="mt-4 rounded-md border border-border bg-sunken p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3
                    ref={headingRef}
                    tabIndex={-1}
                    className="font-display text-h3 font-semibold text-ink focus:outline-none"
                  >
                    {active.kind === 'quiz' ? 'Quiz' : 'Flashcards'}
                  </h3>
                  <p className="mt-1 text-xs text-ink-muted">{active.topic}</p>
                </div>
                <button
                  type="button"
                  onClick={closeTool}
                  className="shrink-0 text-sm text-ink-muted underline underline-offset-2 transition-colors duration-150 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Close
                </button>
              </div>

              <div className="mt-4">
                {isGeneratingActive ? (
                  <GeneratingPanel kind={active.kind} topic={active.topic} />
                ) : null}

                {!isGeneratingActive && activeError ? (
                  <ToolError
                    message={activeError}
                    onRetry={() => generate(active.kind, active.topic)}
                  />
                ) : null}

                {!isGeneratingActive && !activeError && active.kind === 'quiz' ? (
                  activeQuiz ? (
                    <QuizPlayer key={activeQuiz.id} questions={activeQuiz.questions} />
                  ) : (
                    <div>
                      <p className="text-sm text-ink-muted">No quiz for this topic yet.</p>
                      <button
                        type="button"
                        onClick={() => generate('quiz', active.topic)}
                        className={`${secondaryButtonClass} mt-3`}
                      >
                        Create quiz
                      </button>
                    </div>
                  )
                ) : null}

                {!isGeneratingActive && !activeError && active.kind === 'flashcards' ? (
                  activeDeck ? (
                    <FlashcardViewer key={activeDeck.id} cards={activeDeck.cards} />
                  ) : (
                    <div>
                      <p className="text-sm text-ink-muted">No deck for this topic yet.</p>
                      <button
                        type="button"
                        onClick={() => generate('flashcards', active.topic)}
                        className={`${secondaryButtonClass} mt-3`}
                      >
                        Create deck
                      </button>
                    </div>
                  )
                ) : null}
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
