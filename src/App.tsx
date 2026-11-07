import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Admin } from './Admin';
import { LETTERS, QUESTIONS, parseGuess, scoreAnswers } from './questions';
import { PLAYER_KEY, clearGame, loadGame, newGame, saveGame, type GameState, type Result } from './storage';
import { Dialog, Marquee, QuestionGrid, StorageNotice } from './ui';

const TOTAL = QUESTIONS.length;

function countAnswered(answers: (number | null)[]) {
  return answers.filter((a) => a !== null).length;
}

function useHash() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => {
      setHash(window.location.hash);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

export default function App() {
  const hash = useHash();
  const [game, setGame] = useState<GameState>(loadGame);
  const [canSave, setCanSave] = useState(true);

  useEffect(() => {
    setCanSave(saveGame(game));
  }, [game]);

  // A parent who taps the link twice has two tabs. Keep them in step so a stale
  // tab can't overwrite a submitted result.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === PLAYER_KEY || e.key === null) setGame(loadGame());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const patch = (changes: Partial<GameState>) => setGame((g) => ({ ...g, ...changes }));

  const reset = () => {
    clearGame();
    setGame(newGame());
    window.scrollTo(0, 0);
  };

  // Safe to call twice: once a result exists, it never changes.
  const submit = () => {
    setGame((g) => {
      const guess = parseGuess(g.guess);
      if (g.result || guess === null || g.answers.includes(null)) return g;
      const result = { name: g.name, score: scoreAnswers(g.answers), guess };
      return { ...g, result, screen: 'results' };
    });
    window.scrollTo(0, 0);
  };

  if (hash.startsWith('#/admin')) return <Admin onResetDevice={reset} />;

  return (
    <>
      {!canSave && game.screen !== 'results' && <StorageNotice />}
      {game.screen === 'welcome' && <Welcome game={game} patch={patch} />}
      {game.screen === 'play' && <Play game={game} patch={patch} onReset={reset} />}
      {game.screen === 'review' && <Review game={game} patch={patch} onSubmit={submit} onReset={reset} />}
      {game.screen === 'results' && game.result && (
        <Results result={game.result} answers={game.answers} onReset={reset} />
      )}
    </>
  );
}

type ScreenProps = { game: GameState; patch: (changes: Partial<GameState>) => void };

function StartOver({ label = 'Start over', onReset }: { label?: string; onReset: () => void }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <button type="button" className="btn-quiet" onClick={() => setConfirming(true)}>{label}</button>
      {confirming && (
        <Dialog title="Start over on this phone?" onClose={() => setConfirming(false)}>
          <p className="dialog-text">
            This erases your name, answers, and score on this phone. Other players aren’t affected.
          </p>
          <div className="dialog-actions">
            <button type="button" className="btn" onClick={() => setConfirming(false)}>Keep going</button>
            <button type="button" className="btn btn-gold" onClick={onReset}>Start over</button>
          </div>
        </Dialog>
      )}
    </>
  );
}

function Welcome({ game, patch }: ScreenProps) {
  const [error, setError] = useState(false);

  const start = (e: FormEvent) => {
    e.preventDefault();
    const name = game.name.trim();
    if (!name) {
      setError(true);
      return;
    }
    patch({ name, screen: 'play', index: 0 });
    window.scrollTo(0, 0);
  };

  return (
    <main className="welcome">
      <Marquee>
        <h1 className="title">
          <span>The Levi</span> <span>Know-It-All</span> <span>Challenge</span>
        </h1>
      </Marquee>
      <p className="tagline">20 questions. One birthday boy. Zero pressure.</p>
      <p className="subhead">Guessing is encouraged!</p>

      <form className="welcome-form" onSubmit={start} noValidate>
        <label className="field-label" htmlFor="name">Name</label>
        <input
          id="name"
          className="text-input"
          value={game.name}
          maxLength={40}
          autoComplete="off"
          autoCapitalize="words"
          enterKeyHint="go"
          aria-invalid={error}
          aria-describedby={error ? 'name-error' : undefined}
          onChange={(e) => {
            setError(false);
            patch({ name: e.target.value });
          }}
        />
        {error && <p id="name-error" className="field-error">Type your name to start.</p>}
        <button type="submit" className="btn btn-gold btn-big">LET’S PLAY</button>
      </form>
    </main>
  );
}

function Play({ game, patch, onReset }: ScreenProps & { onReset: () => void }) {
  const { index, answers } = game;
  const question = QUESTIONS[index];
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [gridOpen, setGridOpen] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const answered = countAnswered(answers);
  const isLast = index === TOTAL - 1;

  // Screen readers land on the new question after every move.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [index]);

  const goTo = (target: number) => {
    setDirection(target < index ? 'backward' : 'forward');
    patch({ index: target });
  };

  const choose = (option: number) => {
    patch({ answers: answers.map((a, i) => (i === index ? option : a)) });
  };

  return (
    <div className="play">
      <header className="play-header">
        <div className="bulb-row" aria-hidden="true">
          {answers.map((a, i) => (
            <span
              key={i}
              className={`bulb${a !== null ? ' is-lit' : ''}${i === index ? ' is-current' : ''}`}
            />
          ))}
        </div>
        <div className="play-status">
          <span>Question {index + 1} of {TOTAL}</span>
          <span className="play-answered">{answered} answered</span>
        </div>
      </header>

      <main className="play-main">
        <div key={index} className={`slide slide-${direction}`}>
          <h1 ref={headingRef} id="prompt" className="prompt" tabIndex={-1}>{question.prompt}</h1>
          <div className="answers" role="radiogroup" aria-labelledby="prompt">
            {question.options.map((option, i) => {
              const selected = answers[index] === i;
              return (
                <label key={i} className={`answer${selected ? ' is-selected' : ''}`}>
                  <input
                    type="radio"
                    className="answer-radio"
                    name={`question-${index}`}
                    checked={selected}
                    onChange={() => choose(i)}
                  />
                  <span className="answer-letter" aria-hidden="true">{LETTERS[i]}</span>
                  <span className="answer-text">{option}</span>
                  {selected && <span className="answer-check" aria-hidden="true">✓</span>}
                </label>
              );
            })}
          </div>
        </div>
        <div className="play-links">
          <StartOver onReset={onReset} />
        </div>
      </main>

      <nav className="play-nav" aria-label="Question navigation">
        <button type="button" className="btn" disabled={index === 0} onClick={() => goTo(index - 1)}>
          Back
        </button>
        <button type="button" className="btn" onClick={() => setGridOpen(true)}>
          All Questions
        </button>
        <button
          type="button"
          className="btn btn-gold"
          onClick={() => (isLast ? patch({ screen: 'review' }) : goTo(index + 1))}
        >
          {isLast ? 'Review & Finish' : 'Next'}
        </button>
      </nav>

      {gridOpen && (
        <Dialog title="All questions" onClose={() => setGridOpen(false)}>
          <p className="dialog-text">{answered} of {TOTAL} answered. Gold numbers are done.</p>
          <QuestionGrid
            answers={answers}
            current={index}
            onPick={(i) => {
              setGridOpen(false);
              goTo(i);
            }}
          />
          <div className="dialog-actions">
            <button type="button" className="btn" onClick={() => setGridOpen(false)}>Close</button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

function Review({
  game,
  patch,
  onSubmit,
  onReset,
}: ScreenProps & { onSubmit: () => void; onReset: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const { answers, guess } = game;
  const answered = countAnswered(answers);
  const missing = TOTAL - answered;
  const firstOpen = answers.indexOf(null);
  const guessOk = parseGuess(guess) !== null;
  const showGuessError = guess.trim() !== '' && !guessOk;

  const jump = (index: number) => {
    patch({ screen: 'play', index });
  };

  let blocker = '';
  if (missing > 0 && !guessOk) {
    blocker = `Answer ${missing} more ${missing === 1 ? 'question' : 'questions'} and pick your number to submit.`;
  } else if (missing > 0) {
    blocker = `Answer ${missing} more ${missing === 1 ? 'question' : 'questions'} to submit.`;
  } else if (!guessOk) {
    blocker = 'Pick your tiebreaker number to submit.';
  }

  return (
    <main className="page">
      <h1 className="page-title">Final check</h1>
      <p className="review-count">{answered} of {TOTAL} answered</p>

      <QuestionGrid answers={answers} onPick={jump} />
      {firstOpen !== -1 && (
        <button type="button" className="btn btn-wide" onClick={() => jump(firstOpen)}>
          Go to question {firstOpen + 1}
        </button>
      )}

      <section className="tiebreaker">
        <label className="field-label" htmlFor="guess">Tiebreaker: pick a number from 1 to 100</label>
        <p id="guess-help" className="field-help">
          This isn’t scored. If scores tie, the pick closest to the host’s secret number wins.
        </p>
        <input
          id="guess"
          className="text-input guess-input"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={3}
          value={guess}
          aria-invalid={showGuessError}
          aria-describedby={showGuessError ? 'guess-help guess-error' : 'guess-help'}
          onChange={(e) => patch({ guess: e.target.value })}
        />
        {showGuessError && (
          <p id="guess-error" className="field-error">Enter a whole number from 1 to 100.</p>
        )}
      </section>

      {blocker && <p className="review-blocker" role="status">{blocker}</p>}
      <button
        type="button"
        className="btn btn-gold btn-big btn-wide"
        disabled={!!blocker}
        onClick={() => setConfirming(true)}
      >
        Submit
      </button>
      <button type="button" className="btn btn-wide" onClick={() => jump(TOTAL - 1)}>
        Back to questions
      </button>
      <StartOver onReset={onReset} />

      {confirming && (
        <Dialog title="Submit your answers?" onClose={() => setConfirming(false)}>
          <p className="dialog-text">You can’t change them after this.</p>
          <div className="dialog-actions">
            <button type="button" className="btn" onClick={() => setConfirming(false)}>Keep checking</button>
            <button type="button" className="btn btn-gold" onClick={onSubmit}>Submit</button>
          </div>
        </Dialog>
      )}
    </main>
  );
}

const CONFETTI = Array.from({ length: 30 }, (_, i) => i);

function Results({
  result,
  answers,
  onReset,
}: {
  result: Result;
  answers: (number | null)[];
  onReset: () => void;
}) {
  const [viewing, setViewing] = useState<number | null>(null);
  const [celebrated, setCelebrated] = useState(false);

  if (viewing !== null) {
    return (
      <AnswerReview
        answers={answers}
        index={viewing}
        onGoTo={setViewing}
        onExit={() => {
          setViewing(null);
          window.scrollTo(0, 0);
        }}
        onReset={onReset}
      />
    );
  }

  return (
    <main className="results">
      {!celebrated && (
        <div className="confetti" aria-hidden="true">
          {CONFETTI.map((i) => (
            <i
              key={i}
              className={`confetti-piece confetti-${i % 3}`}
              style={{
                left: `${(i * 37) % 100}%`,
                animationDelay: `${(i * 83) % 900}ms`,
                animationDuration: `${2200 + ((i * 131) % 1200)}ms`,
              }}
            />
          ))}
        </div>
      )}

      <h1 className="results-title">You did it!</h1>
      <Marquee>
        <p className="score" aria-label={`${result.score} out of ${TOTAL}`}>
          <span className="score-number">{result.score}</span>
          <span className="score-total">/ {TOTAL}</span>
        </p>
        <p className="results-name">{result.name}</p>
      </Marquee>
      <p className="results-pick">Your tiebreaker pick: <strong>{result.guess}</strong></p>
      <p className="results-host">Show this screen to the birthday host!</p>

      <button
        type="button"
        className="btn btn-gold btn-wide"
        onClick={() => {
          setCelebrated(true);
          setViewing(0);
        }}
      >
        See your answers
      </button>
      <StartOver label="Play Again / Start Over" onReset={onReset} />
    </main>
  );
}

function AnswerReview({
  answers,
  index,
  onGoTo,
  onExit,
  onReset,
}: {
  answers: (number | null)[];
  index: number;
  onGoTo: (index: number) => void;
  onExit: () => void;
  onReset: () => void;
}) {
  const question = QUESTIONS[index];
  const picked = answers[index];
  const isRight = picked === question.correct;
  const marks = QUESTIONS.map((q, i) => answers[i] === q.correct);
  const rightCount = marks.filter(Boolean).length;
  const isLast = index === TOTAL - 1;
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [gridOpen, setGridOpen] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [index]);

  const goTo = (target: number) => {
    setDirection(target < index ? 'backward' : 'forward');
    onGoTo(target);
  };

  return (
    <div className="play">
      <header className="play-header">
        <div className="bulb-row" aria-hidden="true">
          {marks.map((right, i) => (
            <span
              key={i}
              className={`bulb${right ? ' is-lit' : ''}${i === index ? ' is-current' : ''}`}
            />
          ))}
        </div>
        <div className="play-status">
          <span>Question {index + 1} of {TOTAL}</span>
          <span className="play-answered">{rightCount} right</span>
        </div>
      </header>

      <main className="play-main">
        <div key={index} className={`slide slide-${direction}`}>
          <h1 ref={headingRef} className="prompt" tabIndex={-1}>{question.prompt}</h1>
          <p className="verdict">{isRight ? 'You got it!' : 'Not this one'}</p>
          <ul className="answers answers-list">
            {question.options.map((option, i) => {
              const isCorrect = i === question.correct;
              const isPicked = i === picked;
              const state = isCorrect ? ' is-selected' : isPicked ? ' is-wrong' : '';
              return (
                <li key={i} className={`answer answer-static${state}`}>
                  <span className="answer-letter" aria-hidden="true">{LETTERS[i]}</span>
                  <span className="answer-text">
                    {option}
                    {isPicked && <span className="answer-tag">Your answer</span>}
                    {isCorrect && !isPicked && <span className="answer-tag">Correct answer</span>}
                  </span>
                  {isCorrect && <span className="answer-check" aria-hidden="true">✓</span>}
                  {isPicked && !isCorrect && <span className="answer-check" aria-hidden="true">✕</span>}
                </li>
              );
            })}
          </ul>
        </div>
        <div className="play-links">
          <button type="button" className="btn-quiet" onClick={onExit}>Back to my score</button>
          <StartOver onReset={onReset} />
        </div>
      </main>

      <nav className="play-nav" aria-label="Answer navigation">
        <button type="button" className="btn" disabled={index === 0} onClick={() => goTo(index - 1)}>
          Back
        </button>
        <button type="button" className="btn" onClick={() => setGridOpen(true)}>
          All Questions
        </button>
        <button
          type="button"
          className="btn btn-gold"
          onClick={() => (isLast ? onExit() : goTo(index + 1))}
        >
          {isLast ? 'See my score' : 'Next'}
        </button>
      </nav>

      {gridOpen && (
        <Dialog title="All questions" onClose={() => setGridOpen(false)}>
          <p className="dialog-text">{rightCount} of {TOTAL} right. Gold numbers are the ones you got.</p>
          <QuestionGrid
            answers={answers}
            marks={marks}
            current={index}
            onPick={(i) => {
              setGridOpen(false);
              goTo(i);
            }}
          />
          <div className="dialog-actions">
            <button type="button" className="btn" onClick={() => setGridOpen(false)}>Close</button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
