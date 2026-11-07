# The Levi Know-It-All Challenge

A 20-question birthday trivia game for parents at Levi's 7th birthday party. Guests open a link on their phones, answer the questions, pick a tiebreaker number, and see their own score right away.

There is no database, backend, or account. Each browser keeps its own game in `localStorage`, and the host compares scores by looking at guests' screens.

## Run it locally

```sh
npm install
npm run dev
```

`npm run build` type-checks and writes the static site to `dist/`.

## Deploy to GitHub Pages

The workflow in `.github/workflows/deploy.yml` publishes the site on every push to `main`.

1. Push this repo to GitHub. A free account needs the repo to be public for Pages.
2. In the repo, open **Settings > Pages** and set **Source** to **GitHub Actions**.
3. Push to `main`, or run **Deploy to GitHub Pages** from the **Actions** tab.
4. Open `https://<username>.github.io/<repo>/`.

If the job fails on permissions, open **Settings > Actions > General** and allow actions to run. No secrets or environment variables are needed.

The Vite `base` is `./`, so the build works under any repo name without changes.

## Hosting the game

Host tools are at `https://<username>.github.io/<repo>/#/admin`. Nothing links there from the game.

- **Answer key:** all 20 correct answers.
- **Winning number:** saved only in the host's browser and never shown to players. Anyone who opens the admin URL on their own phone gets their own empty copy, but this is private for casual play, not truly secret. For real secrecy, keep the number on paper.
- **Tiebreaker calculator:** enter a guest's pick to see its distance from the winning number.
- **Reset This Device:** clears player data in that browser only.

To pick a winner, look at guests' result screens. The highest score wins. Among tied scores, the smallest distance from the winning number wins. Equal distances stay tied.

## What this app can't do

- The host can't see guests' scores, reset their phones, or reveal anything to them.
- The answer key ships in the JavaScript bundle, so a curious guest could find it.
- One browser holds one player. Someone sharing a phone needs to use **Play Again / Start Over** first.

## Changing the questions

All questions and correct answers are in `src/questions.ts`.
