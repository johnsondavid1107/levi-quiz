import { QUESTIONS } from './questions';

export const PLAYER_KEY = 'levi-trivia-v1';
const HOST_KEY = 'levi-trivia-host-v1';

export type Screen = 'welcome' | 'play' | 'review' | 'results';

export type Result = { name: string; score: number; guess: number };

export type GameState = {
  name: string;
  answers: (number | null)[];
  guess: string;
  index: number;
  screen: Screen;
  result: Result | null;
};

export function newGame(): GameState {
  return {
    name: '',
    answers: QUESTIONS.map(() => null),
    guess: '',
    index: 0,
    screen: 'welcome',
    result: null,
  };
}

function isResult(value: unknown): value is Result {
  const r = value as Result | null;
  return (
    !!r &&
    typeof r.name === 'string' &&
    Number.isInteger(r.score) && r.score >= 0 && r.score <= QUESTIONS.length &&
    Number.isInteger(r.guess) && r.guess >= 1 && r.guess <= 100
  );
}

/** Rebuilds a safe state from whatever was stored, so bad data can't crash the game. */
function clean(raw: Partial<GameState>): GameState {
  const game = newGame();
  if (typeof raw.name === 'string') game.name = raw.name.slice(0, 40);
  if (typeof raw.guess === 'string') game.guess = raw.guess;
  if (Array.isArray(raw.answers) && raw.answers.length === QUESTIONS.length) {
    game.answers = raw.answers.map((a) => (Number.isInteger(a) && a! >= 0 && a! <= 3 ? a : null));
  }
  if (Number.isInteger(raw.index) && raw.index! >= 0 && raw.index! < QUESTIONS.length) {
    game.index = raw.index!;
  }
  if (isResult(raw.result)) {
    game.result = raw.result;
    game.screen = 'results';
  } else if (game.name.trim() && (raw.screen === 'play' || raw.screen === 'review')) {
    game.screen = raw.screen;
  }
  return game;
}

export function loadGame(): GameState {
  try {
    const stored = localStorage.getItem(PLAYER_KEY);
    return stored ? clean(JSON.parse(stored)) : newGame();
  } catch {
    return newGame();
  }
}

/** Returns false when the browser refused the write. */
export function saveGame(game: GameState): boolean {
  try {
    localStorage.setItem(PLAYER_KEY, JSON.stringify(game));
    return true;
  } catch {
    return false;
  }
}

export function clearGame(): void {
  try {
    localStorage.removeItem(PLAYER_KEY);
  } catch {
    // Nothing stored, so nothing to clear.
  }
}

export function loadHostNumber(): number | null {
  try {
    const n = Number(localStorage.getItem(HOST_KEY));
    return Number.isInteger(n) && n >= 1 && n <= 100 ? n : null;
  } catch {
    return null;
  }
}

export function saveHostNumber(n: number | null): boolean {
  try {
    if (n === null) localStorage.removeItem(HOST_KEY);
    else localStorage.setItem(HOST_KEY, String(n));
    return true;
  } catch {
    return false;
  }
}
