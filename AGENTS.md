# AGENTS.md

Permanent rulebook for StudyBuddy Planner. Read this before every task and follow it in all code, copy and design decisions. If a request conflicts with a rule here, say so before changing code.

## Project

StudyBuddy Planner is a solo student hackathon project for the STEM2Connect AI Hackathon, Education track.

The product works in one loop:

1. A student enters a subject, its topics, the exam date and how many hours per day they can study.
2. The backend asks Gemini to generate a day-by-day study schedule, quizzes and flashcards.
3. The student works through the plan and tracks task completion, progress and a daily streak.

Scope stays small. No admin area, no payments, no social features, no chat.

## Stack

Monorepo with two apps.

`client/` (React + Vite)
- React Router
- Axios
- Tailwind CSS
- Recharts

`server/` (Node + Express)
- Mongoose with MongoDB Atlas
- bcrypt
- jsonwebtoken
- zod

### AI integration

- Provider: Google Gemini API, free tier.
- Called from the backend only. The browser never holds an AI key and never calls Gemini.
- All provider code lives in `server/services/ai.js`: client setup, prompt construction and response parsing. No other file imports the Gemini SDK. Swapping providers means editing that one file.
- Treat AI output as untrusted input. Validate it with zod on the server before storing it or returning it.

### Repository layout (target)

```
/
  AGENTS.md
  README.md
  .gitignore
  client/
  server/
```

Keep server concerns separated: routes, controllers, models, middleware, validators and services. Do not grow a single large app file.

## Environment and secrets

- Secrets live in `.env`. `.env` is in `.gitignore` from the first commit. Never commit real keys.
- Commit `.env.example` files that list variable names only, no values.
- The server validates required environment variables at startup and fails loudly with a clear message and a non-zero exit when any are missing or empty.
- Expected server variables: `NODE_ENV`, `PORT`, `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `CLIENT_ORIGIN`.
- Debug output is off in production. No stack traces or internal details in responses sent to the client.

## Security rules

Apply these to every file.

- Hash passwords with bcrypt. Never store or log plain passwords.
- Authenticate with JWTs via proper middleware. Verify the token on every protected route; do not trust a user id sent in the body or query.
- Access control: every database query that touches user data is scoped to the authenticated user's id. Never query by id alone for user-owned documents.
- Validate and sanitize all request input with zod. Use strict object schemas so unknown keys are rejected, and block NoSQL operator injection (reject keys starting with `$` or containing `.`).
- Prevent XSS: never use `dangerouslySetInnerHTML`. Render AI output as plain text. If rich text is ever needed, sanitize with a vetted library and an allowlist.
- Rate limiting is required. A general API limiter, plus stricter limiters on auth routes and AI routes.
- Use helmet for security headers.
- Use a strict CORS allowlist read from env. No wildcard origins.
- Errors return generic messages to the client. Internal details go to server logs only, and only outside production.
- No admin routes exist in this app. If any are added later, they must be authenticated and role-protected.
- Keep dependencies updated and remove unused packages.

## Design rules

The site must not look vibecoded. Use the ui-ux-pro-max skill for design decisions, within the constraints below. Rules win over any skill suggestion.

### Visual constraints

- No gradients at all, including skeleton shimmer. Depth comes from borders and tonal layers.
- No purple, no purple and black, no neon, no rainbow colors, no basic pastel palettes.
- No pure white background. Use a considered tinted neutral. Acceptable starting directions: warm paper with dark ink and a muted clay or forest accent; cool stone with dark ink and a muted amber accent. Pick one direction and keep it consistent.
- No drop shadows. Use 1px hairline borders and background tone changes for separation.
- No emojis anywhere, including icons, alt text, labels and copy.
- Do not use lucide icons. Use Phosphor or Tabler, sparingly, or plain text labels. Choose one icon set and stay with it.
- No pill-shaped buttons. Use small, consistent corner radii: about 4px for buttons and inputs, 6 to 8px for cards and panels. Never fully rounded.
- No liquid glass, radial orbs, dot grids, sparkle icons, animated arrows, cursor animations, terminal-window mockups.
- No bento grids, no row of three identical feature cards, no checkmark bullet lists, no three-tier pricing section.

### Layout and components

- Compose pages as editorial sections with clear hierarchy, not a stack of identical cards.
- Use a fixed spacing scale (4px base) and a fixed type scale. At most two typefaces: one for UI, one for display if needed. No decorative fonts.
- One primary action per view. Secondary actions are quiet text or outline buttons.
- Visible keyboard focus states, semantic labels and text contrast of at least 4.5:1.
- Record the chosen color, type, spacing and radius tokens in one place and reuse them everywhere.

### Motion and loading

- No scroll animations, no parallax, no reveal-on-scroll, no scroll-driven effects.
- Hover states are a simple color change only. No lift, scale, glow or transform.
- Use skeleton loaders for every loading state. Never a bare spinner on a blank page. Skeletons use a tonal pulse (background tone or opacity), not a gradient shimmer.
- Empty states and error states are written, not decorative.

### Content and trust

- No fake counters, fake reviews, fake testimonials, fake logos or fake metrics. Only show real data.
- Show the real product UI on the landing page, not abstract illustrations or AI-generated images. Build the preview from the app's own schedule, quiz and flashcard components using output produced by the app itself, not hand-written marketing numbers.
- Do not add a "made with AI" badge in the UI. AI disclosure goes in the README only.

### Required pages and assets

- A favicon.
- A Terms page at `/terms` and a Privacy Policy page at `/privacy`, both linked in the footer with readable, plain-language content covering accounts, stored study data, AI use and data deletion.
- A footer present on every page.

## Copy rules

- Specific and plain. Say what the app does and what the student gets.
- No vague hero text. No generic AI marketing language. No exclamation-heavy tone.
- No em dashes. Use commas, colons, periods or parentheses.
- No "it's not X, it's Y" constructions.
- No invented claims, outcomes or statistics.
- Keep labels short. Buttons describe the action ("Generate schedule", not "Get started today").

## Workflow

- Work only on the task given. Do not refactor or restyle unrelated files.
- Keep code simple and readable. Match the patterns already in the repo. Prefer small functions and clear names over clever abstractions.
- Do not add a dependency unless it earns its place. Remove packages that stop being used.
- Keep `.env.example` in sync whenever environment variables change.
- Verify before claiming done: the app builds, the server starts, and the changed flow works. Fix what you broke.
- After each task, report:
  1. Files changed, with a one-line reason for each.
  2. How to run the result.
  3. How to test the result, step by step.

### Definition of done (check each task)

- [ ] No gradients, purple, neon, pastels, pure white surfaces, drop shadows, emojis, lucide icons or pill buttons.
- [ ] No scroll animations, hover is a color change only.
- [ ] Every loading state uses a skeleton.
- [ ] No fabricated data anywhere in the UI.
- [ ] Input is zod-validated and NoSQL injection is blocked.
- [ ] Every user-data query is scoped to the authenticated user.
- [ ] Auth routes and AI routes have stricter rate limits.
- [ ] Errors are generic outside development.
- [ ] `.env` is ignored, `.env.example` is current, startup fails loudly on missing variables.
- [ ] Copy is plain, has no em dashes and makes no invented claims.
- [ ] Relevant pages still render on a small screen and with the keyboard.

## Git workflow

- The remote "origin" already exists. Do not create a new repo or change the remote.
- Make small atomic commits. Commit after each logical unit of work, not once per task. Examples: one commit per model, per route, per controller, per middleware, per React page or component, per bug fix, per config change, per docs update.
- Each commit must contain real, working changes that belong together. Never create empty commits, never touch files just to create a commit, never split one tiny change into several commits artificially.
- Use conventional messages: "feat: add user model", "fix: handle expired jwt", "refactor: ...", "docs: ...", "chore: ...", "test: ...", "style: ...".
- Push to origin main after every 2 to 3 commits, and always at the end of a task.
- Before every commit, run `git status` and confirm no `.env`, secrets, `node_modules`, build output, logs, or editor files are staged. If anything unsafe is staged, unstage it and tell me.
- Never force push, rewrite history, or squash commits. Do not run `git reset --hard` or delete branches without asking me.
- If a push fails, show me the exact error and stop. Do not try to work around authentication.
- Never print, request, or store my GitHub token or any password.
- End each task with a list of the commits made (`git log --oneline` for that task).
