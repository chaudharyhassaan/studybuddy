import { useEffect, useRef, useState } from 'react';
import ProgressBar from './ProgressBar';
import { secondaryButtonClass } from './PrimaryButton';

const optionBase =
  'flex w-full items-start gap-3 rounded-sm border px-4 py-3.5 text-left text-sm text-ink transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';
const optionIdle = 'cursor-pointer border-border-strong bg-surface hover:bg-sunken';
const optionAnswered = 'cursor-default';

const letters = ['A', 'B', 'C', 'D'];

function optionStateClass(answered, isAnswer, isChosen) {
  if (!answered) {
    return 'border-border-strong';
  }

  if (isAnswer) {
    return 'border-success bg-accent-wash';
  }

  return isChosen ? 'border-error bg-sunken' : 'border-border bg-surface';
}

function letterStateClass(answered, isAnswer, isChosen) {
  if (!answered) {
    return 'border-border-strong text-ink-muted';
  }

  if (isAnswer) {
    return 'border-success text-success';
  }

  return isChosen ? 'border-error text-error' : 'border-border text-ink-muted';
}

export default function QuizPlayer({ questions, autoFocus = true }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const questionRef = useRef(null);
  const scoreRef = useRef(null);
  const nextRef = useRef(null);
  const optionRefs = useRef([]);
  const mountedRef = useRef(false);

  const question = questions[current];
  const selectedIndex = answers[current];
  const answered = selectedIndex !== undefined;
  const isCorrect = answered && selectedIndex === question.answerIndex;
  const score = questions.reduce(
    (total, item, index) => total + (answers[index] === item.answerIndex ? 1 : 0),
    0
  );
  const scorePercentage = Math.round((score / questions.length) * 100);
  const progress = finished ? 100 : Math.round((current / questions.length) * 100);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    if (!autoFocus) {
      return;
    }

    if (finished) {
      scoreRef.current?.focus();
    } else {
      questionRef.current?.focus();
    }
  }, [current, finished, autoFocus]);

  useEffect(() => {
    if (answered && autoFocus) {
      nextRef.current?.focus();
    }
  }, [answered, autoFocus]);

  function choose(index) {
    if (answered) {
      return;
    }

    setAnswers((currentAnswers) => ({ ...currentAnswers, [current]: index }));
  }

  function moveOption(index) {
    const count = question.options.length;
    const next = (index + count) % count;
    optionRefs.current[next]?.focus();
  }

  function onOptionKeyDown(event, index) {
    if (answered) {
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      moveOption(index + 1);
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      moveOption(index - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      moveOption(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      moveOption(question.options.length - 1);
    }
  }

  function advance() {
    if (!answered) {
      return;
    }

    if (current === questions.length - 1) {
      setFinished(true);
      return;
    }

    setCurrent(current + 1);
  }

  function retry() {
    setAnswers({});
    setCurrent(0);
    setFinished(false);
  }

  if (finished) {
    return (
      <div>
        <p className="eyebrow">Result</p>
        <h4
          ref={scoreRef}
          tabIndex={-1}
          className="mt-3 font-display text-h2 font-semibold text-ink focus:outline-none"
        >
          Quiz complete
        </h4>
        <p className="mt-4 font-display text-stat font-semibold tabular-nums text-ink">
          {score} of {questions.length} correct
        </p>
        <ProgressBar
          value={scorePercentage}
          label="Quiz score"
          tone={scorePercentage === 100 ? 'success' : 'accent'}
          className="mt-3"
        />
        <p className="mt-2 text-xs text-ink-muted">{scorePercentage}% correct.</p>
        <div className="mt-5">
          <button type="button" onClick={retry} className={secondaryButtonClass}>
            Retry quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-label font-semibold uppercase tracking-[0.14em] text-ink-muted">
          Question {current + 1} of {questions.length}
        </p>
        <p className="text-xs text-ink-muted">
          {answered ? (isCorrect ? 'Correct' : 'Incorrect') : 'Choose one answer'}
        </p>
      </div>
      <ProgressBar
        value={progress}
        label={`Quiz progress, question ${current + 1} of ${questions.length}`}
        className="mt-2"
      />

      <fieldset className="mt-5">
        <legend
          id="quiz-question"
          ref={questionRef}
          tabIndex={-1}
          className="font-display text-h3 font-semibold text-ink focus:outline-none"
        >
          {question.question}
        </legend>
        <div role="radiogroup" aria-labelledby="quiz-question" className="mt-4 space-y-2">
          {question.options.map((option, index) => {
            const isAnswer = index === question.answerIndex;
            const isChosen = index === selectedIndex;

            return (
              <button
                key={`${current}-${index}`}
                ref={(node) => {
                  optionRefs.current[index] = node;
                }}
                type="button"
                role="radio"
                aria-checked={isChosen}
                aria-disabled={answered}
                tabIndex={answered ? -1 : index === 0 ? 0 : -1}
                onClick={() => choose(index)}
                onKeyDown={(event) => onOptionKeyDown(event, index)}
                className={`${optionBase} ${answered ? optionAnswered : optionIdle} ${optionStateClass(
                  answered,
                  isAnswer,
                  isChosen
                )}`}
              >
                <span
                  aria-hidden="true"
                  className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-xs border text-2xs font-semibold ${letterStateClass(
                    answered,
                    isAnswer,
                    isChosen
                  )}`}
                >
                  {letters[index]}
                </span>
                <span className="min-w-0 flex-1">{option}</span>
                {answered && isAnswer ? (
                  <span className="shrink-0 rounded-xs border border-success px-2 py-0.5 text-2xs font-semibold text-success">
                    Correct answer
                  </span>
                ) : null}
                {answered && isChosen && !isAnswer ? (
                  <span className="shrink-0 rounded-xs border border-error px-2 py-0.5 text-2xs font-semibold text-error">
                    Your answer
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </fieldset>

      {answered ? (
        <div
          role="status"
          aria-live="polite"
          className={`mt-4 rounded-md border border-border border-l-2 bg-surface px-4 py-3 ${
            isCorrect ? 'border-l-success' : 'border-l-error'
          }`}
        >
          <p className={`text-sm font-semibold ${isCorrect ? 'text-success' : 'text-error'}`}>
            {isCorrect ? 'Correct.' : 'Incorrect.'}
          </p>
          {isCorrect ? null : (
            <p className="mt-1 text-sm text-ink">
              The correct answer is {question.options[question.answerIndex]}.
            </p>
          )}
          <p className="mt-2 text-sm text-ink-muted">{question.explanation}</p>
        </div>
      ) : (
        <p className="mt-3 text-xs text-ink-muted">
          Use the arrow keys to move between options, then press Enter to choose an answer.
        </p>
      )}

      {answered ? (
        <div className="mt-4">
          <button type="button" ref={nextRef} onClick={advance} className={secondaryButtonClass}>
            {current === questions.length - 1 ? 'See score' : 'Next question'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
