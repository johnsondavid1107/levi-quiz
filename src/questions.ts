export type Question = {
  prompt: string;
  options: [string, string, string, string];
  /** Index into options: 0 = A, 1 = B, 2 = C, 3 = D. */
  correct: number;
};

export const LETTERS = ['A', 'B', 'C', 'D'];

// Scoring runs in the browser, so this key ships in the JS bundle. That is
// expected for a casual party game.
export const QUESTIONS: Question[] = [
  { prompt: 'What date is Levi’s birthday?', options: ['Nov 5', 'Nov 7', 'Nov 9', 'Nov 12'], correct: 1 },
  { prompt: 'What number does Levi wear in football?', options: ['10', '11', '12', '14'], correct: 2 },
  { prompt: 'What is Levi’s favorite sport?', options: ['Chess', 'Competitive knitting', 'Underwater hockey', 'Football'], correct: 3 },
  { prompt: 'What grade is Levi in?', options: ['Preschool', '1st grade', '8th grade', 'College'], correct: 1 },
  { prompt: 'What is Levi’s favorite color?', options: ['Beige', 'Gold', 'Invisible', 'Plaid'], correct: 1 },
  { prompt: 'Which Pokémon is Levi’s favorite?', options: ['Charmander', 'Charizard', 'Dragonite', 'Pikachu'], correct: 1 },
  { prompt: 'What is Levi’s favorite restaurant?', options: ['Denny’s', 'IHOP', 'Applebee’s', 'Friendly’s'], correct: 1 },
  { prompt: 'Which game does Levi love?', options: ['Roblox', 'Fortnite', 'Minecraft', 'Mario Kart'], correct: 2 },
  { prompt: 'What was Levi’s Halloween costume this year?', options: ['A tax accountant', 'Ninja', 'A parking meter', 'A toaster'], correct: 1 },
  { prompt: 'Where does Levi fall among his siblings?', options: ['Oldest', 'Youngest', 'Middle', 'Only child'], correct: 2 },
  { prompt: 'What was Levi almost named?', options: ['Jace', 'Jett', 'Jude', 'Jack'], correct: 1 },
  { prompt: 'What is Levi’s pet fish named?', options: ['Benny Blue', 'Barry Blue', 'Bobby Blue', 'Billy Blue'], correct: 1 },
  { prompt: 'What is Levi’s favorite bedtime stuffy named?', options: ['Snowflake', 'Snowy', 'Snowball', 'Frosty'], correct: 2 },
  { prompt: 'How many tackles did Levi record in regular-season games?', options: ['0 — saving them for next season', '47', '108', '1,000'], correct: 0 },
  { prompt: 'What did Levi weigh at birth?', options: ['7 lb 11 oz', '8 lb 1 oz', '8 lb 6 oz', '7 lb 15 oz'], correct: 1 },
  { prompt: 'Which candy is Levi’s favorite?', options: ['Broccoli bites', 'Plain Hershey’s chocolate', 'Onion rings', 'Black licorice'], correct: 1 },
  { prompt: 'What does Levi want to be when he grows up?', options: ['Architect', 'Animator', 'Artist', 'Engineer'], correct: 2 },
  { prompt: 'Which drink does Levi pick with a kids meal?', options: ['Espresso', 'Chocolate milk', 'Black coffee', 'Tomato juice'], correct: 1 },
  { prompt: 'Which colors are on Levi’s bookbag?', options: ['Black, green & blue', 'Black, red & blue', 'Gray, green & blue', 'Black, green & yellow'], correct: 0 },
  { prompt: 'Which does Levi prefer?', options: ['Nighttime', 'Daytime', 'Both equally', 'Depends on the day'], correct: 1 },
];

export function scoreAnswers(answers: (number | null)[]): number {
  return QUESTIONS.filter((q, i) => answers[i] === q.correct).length;
}

/** Returns a whole number from 1 to 100, or null for anything else. */
export function parseGuess(text: string): number | null {
  const trimmed = text.trim();
  if (!/^\d{1,3}$/.test(trimmed)) return null;
  const n = Number(trimmed);
  return n >= 1 && n <= 100 ? n : null;
}
