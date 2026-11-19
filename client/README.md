# StudyBuddy Planner client

React and Vite client for StudyBuddy Planner. Product rules and the design system live in the root `AGENTS.md` and `docs/DESIGN.md`.

## Setup

Copy `.env.example` to `.env` and set `VITE_API_URL` to the API origin, without the `/api` suffix.

```
npm install
npm run dev
```

The client calls `${VITE_API_URL}/api`. If `VITE_API_URL` is unset it falls back to `http://localhost:5000`.

## Scripts

- `npm run dev` starts the Vite dev server.
- `npm run build` creates the production build.
- `npm run preview` serves the production build.
- `npm run lint` runs oxlint.

## Routes

- `/login` and `/register` for the auth flow.
- `/dashboard` when signed in.
- `/plans/new` and `/plans/:id` for creating and working through a plan.
- `/documents/summarize` for document summaries.
- `/settings` for the account.
- `/terms` and `/privacy` for the legal pages.
- Every other path shows the 404 page.

The sign-in token is stored in `localStorage` under `studybuddy.token` and sent as a Bearer token.
