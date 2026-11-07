import { useState, type FormEvent } from 'react';
import { LETTERS, QUESTIONS, parseGuess } from './questions';
import { loadHostNumber, saveHostNumber } from './storage';
import { Dialog } from './ui';

export function Admin({ onResetDevice }: { onResetDevice: () => void }) {
  const [hostNumber, setHostNumber] = useState(loadHostNumber);
  const [draft, setDraft] = useState(hostNumber === null ? '' : String(hostNumber));
  const [message, setMessage] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [guestGuess, setGuestGuess] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const save = (e: FormEvent) => {
    e.preventDefault();
    const n = parseGuess(draft);
    if (n === null) {
      setInvalid(true);
      setMessage('');
      return;
    }
    const stored = saveHostNumber(n);
    setHostNumber(n);
    setInvalid(false);
    setMessage(stored ? 'Saved on this device.' : 'This browser can’t save it, so write it down too.');
  };

  const clear = () => {
    saveHostNumber(null);
    setHostNumber(null);
    setDraft('');
    setInvalid(false);
    setMessage('Cleared.');
  };

  const guest = parseGuess(guestGuess);

  return (
    <main className="page admin">
      <a className="btn admin-back" href="#/">Back to Game</a>
      <h1 className="page-title">Host tools</h1>
      <p className="field-help">
        This page only knows what’s on this device. It can’t see guests’ scores or change their
        phones, so compare results by looking at their screens.
      </p>

      <section className="admin-section">
        <h2 className="admin-heading">Winning number</h2>
        <form className="admin-row" onSubmit={save} noValidate>
          <label className="visually-hidden" htmlFor="host-number">Winning number, 1 to 100</label>
          <input
            id="host-number"
            className="text-input guess-input"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={3}
            value={draft}
            aria-invalid={invalid}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button type="submit" className="btn btn-gold">Save</button>
          {hostNumber !== null && (
            <button type="button" className="btn" onClick={clear}>Clear</button>
          )}
        </form>
        {invalid && <p className="field-error">Enter a whole number from 1 to 100.</p>}
        <p className="field-help" role="status">{message}</p>
        <p className="field-help">
          Stored only in this browser and never shown to players. That keeps it private for casual
          play, but it isn’t truly secret. For real secrecy, keep it on paper.
        </p>
      </section>

      <section className="admin-section">
        <h2 className="admin-heading">Tiebreaker calculator</h2>
        <p className="field-help">
          Use this only when scores tie. The smallest distance wins, and equal distances stay tied.
        </p>
        <label className="field-label" htmlFor="guest-guess">Guest’s pick</label>
        <input
          id="guest-guess"
          className="text-input guess-input"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={3}
          value={guestGuess}
          onChange={(e) => setGuestGuess(e.target.value)}
        />
        <p className="admin-distance" role="status">
          {hostNumber === null && 'Save a winning number first.'}
          {hostNumber !== null && guest !== null && `Distance: ${Math.abs(guest - hostNumber)}`}
          {hostNumber !== null && guest === null && guestGuess.trim() !== '' &&
            'Enter a whole number from 1 to 100.'}
        </p>
      </section>

      <section className="admin-section">
        <h2 className="admin-heading">Answer key</h2>
        <ol className="key">
          {QUESTIONS.map((q) => (
            <li key={q.prompt}>
              <span className="key-prompt">{q.prompt}</span>
              <strong className="key-answer">{LETTERS[q.correct]}. {q.options[q.correct]}</strong>
            </li>
          ))}
        </ol>
      </section>

      <section className="admin-section">
        <h2 className="admin-heading">Reset This Device</h2>
        <p className="field-help">
          Clears the player name, answers, and score in this browser only. Your winning number stays.
        </p>
        <button type="button" className="btn" onClick={() => setConfirmReset(true)}>
          Reset This Device
        </button>
        {resetDone && <p className="field-help" role="status">This device is reset.</p>}
      </section>

      {confirmReset && (
        <Dialog title="Reset this device?" onClose={() => setConfirmReset(false)}>
          <p className="dialog-text">
            This erases the player data in this browser. Guests’ phones aren’t affected.
          </p>
          <div className="dialog-actions">
            <button type="button" className="btn" onClick={() => setConfirmReset(false)}>Cancel</button>
            <button
              type="button"
              className="btn btn-gold"
              onClick={() => {
                onResetDevice();
                setConfirmReset(false);
                setResetDone(true);
              }}
            >
              Reset This Device
            </button>
          </div>
        </Dialog>
      )}
    </main>
  );
}
