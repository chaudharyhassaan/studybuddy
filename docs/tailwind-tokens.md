# Tailwind tokens

Tokens match `docs/DESIGN.md`. Paste the section for the Tailwind version the client uses. Do not add colors, fonts, radii or shadows outside these tokens.

## Fonts

Add to `client/index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500..600&family=Source+Sans+3:wght@400..600&display=swap" rel="stylesheet">
```

## Tailwind v4 (current, recommended)

Put this in `client/src/index.css`.

```css
@import "tailwindcss";

@theme {
  /* Remove the default theme so off-system colors, sizes and radii do not exist */
  --color-*: initial;
  --text-*: initial;
  --radius-*: initial;
  --container-*: initial;

  /* Paper, ink and clay */
  --color-paper: #f4f0e6;
  --color-surface: #faf7ef;
  --color-sunken: #eae4d6;
  --color-sunken-deep: #e0d7c4;
  --color-border: #d7cfbe;
  --color-border-strong: #8b8371;
  --color-ink: #23261f;
  --color-ink-muted: #5e6458;
  --color-accent: #8f4529;
  --color-accent-hover: #7a3920;
  --color-accent-pressed: #6b3119;
  --color-accent-soft: #f1e3d5;
  --color-accent-wash: #f7ede3;
  --color-on-accent: #fbf8f0;
  --color-success: #2f6b45;
  --color-warning: #8a5b12;
  --color-error: #a63a2d;
  --color-error-hover: #8a2f24;

  /* Type */
  --font-display: "Fraunces", Georgia, "Times New Roman", serif;
  --font-sans: "Source Sans 3", ui-sans-serif, system-ui, "Segoe UI", sans-serif;

  --text-display: clamp(2.75rem, 5.6vw, 4.25rem);
  --text-display--line-height: 1.02;
  --text-display--letter-spacing: -0.028em;

  --text-title: clamp(2rem, 3.6vw, 2.75rem);
  --text-title--line-height: 1.1;
  --text-title--letter-spacing: -0.022em;

  --text-h1: clamp(1.75rem, 2.8vw, 2.15rem);
  --text-h1--line-height: 1.16;
  --text-h1--letter-spacing: -0.018em;

  --text-h2: 1.5rem;
  --text-h2--line-height: 1.28;
  --text-h2--letter-spacing: -0.01em;

  --text-h3: 1.25rem;
  --text-h3--line-height: 1.35;
  --text-h3--letter-spacing: -0.004em;

  --text-stat: clamp(2rem, 3.4vw, 2.75rem);
  --text-stat--line-height: 1;
  --text-stat--letter-spacing: -0.03em;

  --text-lg: 1.125rem;
  --text-lg--line-height: 1.6;

  --text-base: 1rem;
  --text-base--line-height: 1.65;

  --text-sm: 0.9375rem;
  --text-sm--line-height: 1.55;

  --text-xs: 0.8125rem;
  --text-xs--line-height: 1.45;
  --text-xs--letter-spacing: 0.005em;

  --text-2xs: 0.75rem;
  --text-2xs--line-height: 1.4;
  --text-2xs--letter-spacing: 0.06em;

  --text-label: 0.6875rem;
  --text-label--line-height: 1.2;
  --text-label--letter-spacing: 0.14em;

  /* Spacing: 4px base */
  --spacing: 0.25rem;

  /* Radius */
  --radius-xs: 3px;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;

  /* Widths */
  --container-content: 1120px;
  --container-reading: 700px;
  --container-form: 640px;
  --container-auth: 420px;

  /* Remove shadow utilities: depth comes from borders and tones */
  --shadow-*: initial;
  --drop-shadow-*: initial;

  /* Motion */
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);

  /* Only the tonal skeleton pulse remains as a built-in animation */
  --animate-*: initial;
  --animate-pulse: pulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;

  --default-transition-duration: 160ms;
  --default-transition-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}

@keyframes page-enter {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes item-enter {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes panel-enter {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes dialog-enter {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@layer base {
  html {
    color-scheme: light;
  }

  body {
    background-color: var(--color-paper);
    color: var(--color-ink);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  h1,
  h2,
  h3,
  h4 {
    font-family: var(--font-display);
    font-optical-sizing: auto;
    text-wrap: balance;
  }

  p {
    text-wrap: pretty;
  }

  ::selection {
    background-color: var(--color-accent-soft);
    color: var(--color-ink);
  }

  :focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  dialog::backdrop {
    background-color: rgb(35 38 31 / 0.4);
  }
}

@layer components {
  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--color-ink-muted);
    font-size: var(--text-label);
    font-weight: 600;
    letter-spacing: 0.14em;
    line-height: 1.2;
    text-transform: uppercase;
  }

  .eyebrow::before {
    content: "";
    display: block;
    width: 1.5rem;
    height: 1px;
    background-color: var(--color-accent);
  }

  .page-enter {
    animation: page-enter 320ms var(--ease-out) backwards;
  }

  .enter-up {
    animation: item-enter 300ms var(--ease-out) backwards;
  }

  .enter-panel {
    animation: panel-enter 220ms var(--ease-out) backwards;
  }

  .stagger-list > * {
    animation: item-enter 300ms var(--ease-out) backwards;
  }

  .stagger-list > :nth-child(2) { animation-delay: 30ms; }
  .stagger-list > :nth-child(3) { animation-delay: 60ms; }
  .stagger-list > :nth-child(4) { animation-delay: 90ms; }
  .stagger-list > :nth-child(5) { animation-delay: 120ms; }
  .stagger-list > :nth-child(6) { animation-delay: 150ms; }
  .stagger-list > :nth-child(7) { animation-delay: 180ms; }
  .stagger-list > :nth-child(8) { animation-delay: 210ms; }
  .stagger-list > :nth-child(n + 9) { animation-delay: 240ms; }

  .pressable {
    transition-property: background-color, border-color, color, opacity;
    transition-duration: 160ms;
    transition-timing-function: var(--ease-out);
  }

  dialog[open] {
    animation: dialog-enter 200ms var(--ease-out) backwards;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .pressable:active:not(:disabled) {
    transform: scale(0.985);
    transition: transform 110ms var(--ease-out);
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  .page-enter,
  .enter-up,
  .enter-panel,
  .stagger-list > *,
  dialog[open] {
    animation: none;
  }

  .pressable:active:not(:disabled) {
    transform: none;
  }
}
```

Notes for v4:

- The `initial` declarations remove the default color, text size, radius and container scales. Use the tokens only. `font-serif` and `font-mono` remain from Tailwind defaults; do not use them.
- `font-display` and `font-sans` are available from `--font-*`.
- `bg-paper`, `text-ink`, `border-border-strong`, `rounded-sm`, `text-h1`, `max-w-content` work from the tokens above.
- Five tonal surfaces: `paper`, `surface`, `sunken`, `sunken-deep`, `accent-wash`. `sunken-deep` is a pressed state only; do not put `text-ink-muted` on it.
- `text-display`, `text-title`, `text-h1` and `text-stat` are fluid clamps, so no breakpoint variants are needed for size.
- `--shadow-*: initial` removes shadow utilities. `ring-*` still uses a box shadow, so do not use ring utilities. Use `outline-*`.
- Gradients cannot be removed by a token. Do not use `bg-linear-*` or any gradient utility.
- `--animate-*: initial` removes the built-in spin, ping and bounce. Only `animate-pulse` remains, for skeletons.
- Motion lives in `.page-enter`, `.enter-up`, `.enter-panel`, `.stagger-list`, `dialog[open]` and `.pressable`. Use those classes rather than writing new keyframes.

## Tailwind v3 (fallback)

Save as `client/tailwind.config.js` if the client is on v3.

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      inherit: 'inherit',
      paper: '#F4F0E6',
      surface: '#FAF7EF',
      sunken: '#EAE4D6',
      'sunken-deep': '#E0D7C4',
      border: '#D7CFBE',
      'border-strong': '#8B8371',
      ink: '#23261F',
      'ink-muted': '#5E6458',
      accent: '#8F4529',
      'accent-hover': '#7A3920',
      'accent-pressed': '#6B3119',
      'accent-soft': '#F1E3D5',
      'accent-wash': '#F7EDE3',
      'on-accent': '#FBF8F0',
      success: '#2F6B45',
      warning: '#8A5B12',
      error: '#A63A2D',
      'error-hover': '#8A2F24',
    },
    borderColor: ({ theme }) => ({
      DEFAULT: theme('colors.border'),
      ...theme('colors'),
    }),
    divideColor: ({ theme }) => theme('colors'),
    ringColor: ({ theme }) => ({
      DEFAULT: theme('colors.accent'),
      ...theme('colors'),
    }),
    outlineColor: ({ theme }) => theme('colors'),
    fontFamily: {
      display: ['Fraunces', 'Georgia', 'Times New Roman', 'serif'],
      sans: ['Source Sans 3', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
    },
    fontSize: {
      '2xs': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.06em' }],
      xs: ['0.8125rem', { lineHeight: '1.45', letterSpacing: '0.005em' }],
      sm: ['0.9375rem', { lineHeight: '1.55' }],
      base: ['1rem', { lineHeight: '1.65' }],
      lg: ['1.125rem', { lineHeight: '1.6' }],
      h3: ['1.25rem', { lineHeight: '1.35', letterSpacing: '-0.004em' }],
      h2: ['1.5rem', { lineHeight: '1.28', letterSpacing: '-0.01em' }],
      h1: ['clamp(1.75rem, 2.8vw, 2.15rem)', { lineHeight: '1.16', letterSpacing: '-0.018em' }],
      title: ['clamp(2rem, 3.6vw, 2.75rem)', { lineHeight: '1.1', letterSpacing: '-0.022em' }],
      display: ['clamp(2.75rem, 5.6vw, 4.25rem)', { lineHeight: '1.02', letterSpacing: '-0.028em' }],
      stat: ['clamp(2rem, 3.4vw, 2.75rem)', { lineHeight: '1', letterSpacing: '-0.03em' }],
      label: ['0.6875rem', { lineHeight: '1.2', letterSpacing: '0.14em' }],
    },
    spacing: {
      0: '0px',
      px: '1px',
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      5: '20px',
      6: '24px',
      8: '32px',
      10: '40px',
      11: '44px',
      12: '48px',
      16: '64px',
      20: '80px',
      24: '96px',
      32: '128px',
    },
    borderRadius: {
      none: '0px',
      DEFAULT: '4px',
      xs: '3px',
      sm: '4px',
      md: '6px',
      lg: '8px',
      full: '9999px',
    },
    boxShadow: {
      none: 'none',
    },
    backgroundImage: {
      none: 'none',
    },
    transitionProperty: {
      none: 'none',
      colors: 'color, background-color, border-color, text-decoration-color, fill, stroke',
    },
    transitionDuration: {
      DEFAULT: '160ms',
      160: '160ms',
      320: '320ms',
    },
    transitionTimingFunction: {
      DEFAULT: 'cubic-bezier(0.23, 1, 0.32, 1)',
      out: 'cubic-bezier(0.23, 1, 0.32, 1)',
      'in-out': 'cubic-bezier(0.77, 0, 0.175, 1)',
    },
    keyframes: {
      pulse: {
        '0%, 100%': { opacity: '1' },
        '50%': { opacity: '0.55' },
      },
      'page-enter': {
        from: { opacity: '0', transform: 'translateY(10px)' },
        to: { opacity: '1', transform: 'translateY(0)' },
      },
      'item-enter': {
        from: { opacity: '0', transform: 'translateY(6px)' },
        to: { opacity: '1', transform: 'translateY(0)' },
      },
      'panel-enter': {
        from: { opacity: '0', transform: 'translateY(-4px)' },
        to: { opacity: '1', transform: 'translateY(0)' },
      },
      'dialog-enter': {
        from: { opacity: '0', transform: 'translateY(8px) scale(0.985)' },
        to: { opacity: '1', transform: 'translateY(0) scale(1)' },
      },
    },
    animation: {
      none: 'none',
      pulse: 'pulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      'page-enter': 'page-enter 320ms cubic-bezier(0.23, 1, 0.32, 1) backwards',
      'item-enter': 'item-enter 300ms cubic-bezier(0.23, 1, 0.32, 1) backwards',
      'panel-enter': 'panel-enter 220ms cubic-bezier(0.23, 1, 0.32, 1) backwards',
      'dialog-enter': 'dialog-enter 200ms cubic-bezier(0.23, 1, 0.32, 1) backwards',
    },
    extend: {
      maxWidth: {
        content: '1120px',
        reading: '700px',
        form: '640px',
        auth: '420px',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          md: '1.5rem',
          lg: '2.5rem',
        },
      },
    },
  },
  plugins: [],
};
```

Notes for v3:

- `text-xl`, `text-2xl`, `shadow-sm`, `shadow-md`, `transition-all`, `animate-spin` and `bg-gradient-*` no longer exist. Use the tokens.
- `border` alone resolves to the `border` color. `border-border-strong` is the control boundary.
- `ring-*` still renders a box shadow. Use `outline-*` for focus.
- `rounded-full` exists for status dots only.
- The quiz option recipe uses `has-[:checked]`, which needs Tailwind 3.4 or newer.
- Use `focus-visible` utilities, not `focus`, so pointer clicks do not draw outlines.

## Reference recipes

Below 768px, swap `h-10` for `h-11` on buttons and inputs so touch targets reach 44px.

Page shell:

```html
<div class="min-h-screen bg-paper font-sans text-ink">
```

Page heading:

```html
<h1 class="font-display text-h1 font-semibold tracking-tight">Your study</h1>
```

Primary button:

```html
<button class="pressable inline-flex h-10 select-none items-center justify-center rounded-sm border border-accent bg-accent px-4 text-sm font-semibold text-on-accent hover:bg-accent-hover active:bg-accent-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:border-border disabled:bg-sunken disabled:text-ink-muted">
  Create plan
</button>
```

Secondary button:

```html
<button class="pressable inline-flex h-10 select-none items-center justify-center rounded-sm border border-border-strong bg-surface px-4 text-sm font-semibold text-ink hover:bg-sunken active:bg-sunken-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
  Edit plan
</button>
```

Text input:

```html
<label class="block">
  <span class="mb-2 block text-xs font-semibold text-ink">Subject</span>
  <input
    type="text"
    class="block h-10 w-full rounded-sm border border-border-strong bg-surface px-3 text-base text-ink placeholder:text-ink-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:bg-sunken disabled:text-ink-muted"
    placeholder="Biology"
  />
  <span class="mt-2 block text-2xs text-ink-muted">Use the subject name from your exam timetable.</span>
</label>
```

Card:

```html
<section class="rounded-md border border-border bg-surface p-5">
```

List panel row:

```html
<li class="border-t border-border px-5 py-4 transition-colors duration-150 first:border-t-0 hover:bg-sunken">
```

Stat block:

```html
<div class="rounded-md border border-border bg-sunken p-5">
  <p class="text-label font-semibold uppercase tracking-[0.14em] text-ink-muted">Streak</p>
  <p class="mt-2 font-display text-stat font-semibold tabular-nums">6 days</p>
  <p class="mt-2 text-xs text-ink-muted">Completed a task today.</p>
</div>
```

The emphasised variant uses `bg-accent-wash` with the same text colours.

Page and list entrance:

```html
<div class="page-enter">
  <ul class="stagger-list">
    <li>First row</li>
    <li>Second row</li>
  </ul>
</div>
```

Wrap the routed outlet in `.page-enter` with a `key` of the current pathname so each navigation replays the entrance once. Put `.stagger-list` on a list or grid whose direct children should enter together; the delay caps at the ninth child.

Underline tabs:

```html
<div class="flex gap-6 border-b border-border">
  <button
    class="h-11 border-b-2 border-accent text-sm font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    aria-selected="true"
  >
    Schedule
  </button>
  <button
    class="h-11 border-b-2 border-transparent text-sm font-semibold text-ink-muted transition-colors duration-150 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    aria-selected="false"
  >
    Quizzes
  </button>
</div>
```

Skeleton:

```html
<div aria-busy="true" aria-live="polite">
  <div aria-hidden="true" class="motion-safe:animate-pulse rounded-md bg-sunken h-6 w-2/3"></div>
  <div aria-hidden="true" class="motion-safe:animate-pulse rounded-md bg-sunken mt-3 h-4 w-full"></div>
  <div aria-hidden="true" class="motion-safe:animate-pulse rounded-md bg-sunken mt-2 h-4 w-5/6"></div>
</div>
```

Quiz option:

```html
<label class="block cursor-pointer rounded-sm border border-border-strong bg-surface px-4 py-4 text-base text-ink transition-colors duration-150 hover:bg-sunken has-[:checked]:border-accent has-[:checked]:bg-accent-soft focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent">
  <input type="radio" name="answer" class="sr-only" />
  Option text
</label>
```

Inline alert:

```html
<div role="alert" class="rounded-md border border-border border-l-2 border-l-error bg-sunken px-4 py-3 text-sm text-error">
  Plan generation failed. Try again.
</div>
```

## Guardrails

- Use semantic tokens only. No arbitrary hex values in components.
- No `shadow-*`, `ring-*`, `bg-gradient-*`, `backdrop-blur-*`, `animate-spin`, `animate-bounce` or `transition-all`.
- No `rounded-full` on buttons, inputs, cards, tabs or alerts.
- No `text-white` or `bg-white`. Use `text-on-accent` and `surface`.
- Hover changes colours only. No `hover:-translate-y-*`, `hover:scale-*` or `hover:shadow-*`.
- The only scale is the 0.985 press on `.pressable`. Do not add `active:scale-*` by hand.
- No scroll-driven animation, parallax or looping motion other than the skeleton pulse.
- Use `.page-enter`, `.stagger-list`, `.enter-panel` and `dialog[open]` instead of new keyframes, and always keep the reduced-motion overrides.
- One accent primary action per view.
- Use Phosphor icons only, at 16px or 18px, and only when a text label is not enough.
