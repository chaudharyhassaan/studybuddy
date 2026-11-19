# StudyBuddy Design System

Status: draft 2, updated for the shipped tokens, brand mark and motion.
Scope: light theme only, web, students aged 13 and up.
Related: `AGENTS.md` (rules), `docs/tailwind-tokens.md` (tokens to paste into the client).

## 1. Design direction

### Paper and ink

StudyBuddy should feel like a clear desk the night before an exam. Paper-toned surfaces, dark ink, one clay accent, thin rules instead of shadows, and type that carries the hierarchy.

Mood: calm, prepared, plainspoken.
Personality: the organized classmate who already made a plan and is willing to share it. Direct, steady, quietly encouraging. Never a mascot, never a hype coach, never a productivity influencer.

Visual principles:

- Flat surfaces with hairline borders and five tonal layers (paper, surface, sunken, sunken-deep, accent-wash).
- Fraunces for display and headings, Source Sans 3 for everything else.
- One clay accent used for action and selection only.
- Generous spacing and short line lengths. The screen should feel unhurried.
- Real product UI shown as the main visual. No illustration style, no generated art.
- Status colors carry meaning, never decoration.
- Motion is rare and purposeful: one short entrance per view, a capped list stagger, a panel for the mobile menu, a dialog entrance, and a press-only scale. Nothing on hover, nothing tied to scroll.

The skill's flat design direction fits: no shadows, typography-led hierarchy, color-only hover states, fast loading. Its suggested teal palette, pure white cards and Lucide icons conflict with `AGENTS.md`, so they are rejected. The palette below is a warm paper and clay system adapted to those rules.

Light theme only. No dark mode in this project.

## 2. Color

All values are exact. No pure white and no pure black appear anywhere.

| Token | Hex | Role |
| --- | --- | --- |
| `paper` | `#F4F0E6` | Page background |
| `surface` | `#FAF7EF` | Cards, panels, sidebar, product preview frames |
| `sunken` | `#EAE4D6` | Recessed layers, selected navigation, stat strips, skeleton base |
| `sunken-deep` | `#E0D7C4` | Pressed state for quiet and secondary controls |
| `border` | `#D7CFBE` | Hairline dividers and card edges |
| `border-strong` | `#8B8371` | Input borders, interactive control boundaries |
| `ink` | `#23261F` | Primary text |
| `ink-muted` | `#5E6458` | Secondary text, metadata, placeholders |
| `accent` | `#8F4529` | Primary buttons, links, active tab, focus outline |
| `accent-hover` | `#7A3920` | Hover for accent buttons and accent text |
| `accent-pressed` | `#6B3119` | Pressed primary button |
| `accent-soft` | `#F1E3D5` | Selected row, quiet accent block |
| `accent-wash` | `#F7EDE3` | Quiet accent surface: selected nav, countdown, streak, correct option |
| `on-accent` | `#FBF8F0` | Text and icons on accent fills |
| `success` | `#2F6B45` | Completed, correct, on track |
| `warning` | `#8A5B12` | Due soon, attention |
| `error` | `#A63A2D` | Incorrect, destructive, validation |
| `error-hover` | `#8A2F24` | Hover for solid destructive buttons |

Usage balance: roughly 70 percent paper, 20 percent surface and sunken, 7 percent ink, 3 percent accent. Status colors appear only when the state applies.

Rules:

- Accent fills are limited to primary buttons, selected options, small state marks and the active tab rule. Never a full section background.
- `accent-soft` is a quiet selected state. `accent-wash` is the larger quiet accent surface for the streak stat, countdown card, selected navigation and a correct quiz option. Both stay secondary to the paper and surface layers.
- `sunken-deep` is a pressed state for secondary and quiet controls. It is not a text surface: `ink-muted` on it is 4.27:1, below AA for normal text.
- No gradients, no color mixing, no opacity tricks for color variants. Use the tokens.
- `border` is decorative separation. Never use it as the only boundary of a form control. Inputs use `border-strong`.
- `border` against `sunken-deep` is 1.08:1, so do not draw hairlines between those two tones.

### Contrast check (WCAG AA)

Measured with the standard relative luminance formula. Normal text needs 4.5:1, large text 3:1, interface boundaries and focus indicators 3:1.

| Pair | Ratio | Requirement | Result |
| --- | --- | --- | --- |
| `ink` on `paper` | 13.48:1 | 4.5:1 | Pass |
| `ink` on `surface` | 14.33:1 | 4.5:1 | Pass |
| `ink` on `sunken` | 12.11:1 | 4.5:1 | Pass |
| `ink-muted` on `paper` | 5.36:1 | 4.5:1 | Pass |
| `ink-muted` on `surface` | 5.70:1 | 4.5:1 | Pass |
| `ink-muted` on `sunken` | 4.82:1 | 4.5:1 | Pass |
| `accent` on `paper` | 6.05:1 | 4.5:1 | Pass |
| `accent` on `surface` | 6.43:1 | 4.5:1 | Pass |
| `accent` on `accent-soft` | 5.47:1 | 4.5:1 | Pass |
| `on-accent` on `accent` | 6.49:1 | 4.5:1 | Pass |
| `on-accent` on `accent-hover` | 8.13:1 | 4.5:1 | Pass |
| `on-accent` on `accent-pressed` | 9.52:1 | 4.5:1 | Pass |
| `success` on `paper` | 5.58:1 | 4.5:1 | Pass |
| `success` on `surface` | 5.93:1 | 4.5:1 | Pass |
| `warning` on `paper` | 5.15:1 | 4.5:1 | Pass |
| `warning` on `surface` | 5.47:1 | 4.5:1 | Pass |
| `error` on `paper` | 5.65:1 | 4.5:1 | Pass |
| `error` on `surface` | 6.01:1 | 4.5:1 | Pass |
| `on-accent` on `error` | 6.06:1 | 4.5:1 | Pass |
| `on-accent` on `error-hover` | 7.87:1 | 4.5:1 | Pass |
| `border-strong` on `paper` | 3.31:1 | 3:1 | Pass, non-text |
| `border-strong` on `surface` | 3.51:1 | 3:1 | Pass, non-text |
| `accent` on `paper` | 6.05:1 | 3:1 | Pass, focus indicator |
| `ink` on `accent-wash` | 13.28:1 | 4.5:1 | Pass |
| `ink-muted` on `accent-wash` | 5.28:1 | 4.5:1 | Pass |
| `accent` on `accent-wash` | 5.96:1 | 4.5:1 | Pass |
| `ink` on `sunken-deep` | 10.73:1 | 4.5:1 | Pass |
| `ink-muted` on `sunken-deep` | 4.27:1 | 4.5:1 | Fail, no muted text on this tone |

The hairline `border` at 1.36:1 against `paper` is a decorative separator only. It is never the sole indicator of a control or a state.

Status text also passes on `sunken`: `success` 5.01:1, `warning` 4.62:1, `error` 5.07:1, `accent` 5.43:1. `ink-muted` on `accent-soft` is 4.85:1. On `accent-wash`, status text passes as well: `success` 5.49:1, `warning` 5.07:1, `error` 5.57:1.

## 3. Typography

### Pairing

- Display and headings: **Fraunces**, weights 500 and 600. A soft, warm serif with enough character to keep the product out of generic SaaS territory.
- Body and interface: **Source Sans 3**, weights 400 and 600. Calm, legible, and neutral without feeling cold.

Fallbacks: `Georgia, "Times New Roman", serif` and `ui-sans-serif, system-ui, "Segoe UI", sans-serif`.

Google Fonts URL:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500..600&family=Source+Sans+3:wght@400..600&display=swap" rel="stylesheet">
```

Do not use 300 weights. Do not use Fraunces below 20px. Do not set all caps beyond the 12px eyebrow style.

### Size scale

| Token | Size | Line height | Tracking | Weight | Use |
| --- | --- | --- | --- | --- | --- |
| `text-display` | `clamp(2.75rem, 5.6vw, 4.25rem)` | 1.02 | -0.028em | 600 | Landing hero, 404 numeral |
| `text-title` | `clamp(2rem, 3.6vw, 2.75rem)` | 1.1 | -0.022em | 600 | Page titles, section openers, closing band |
| `text-h1` | `clamp(1.75rem, 2.8vw, 2.15rem)` | 1.16 | -0.018em | 600 | App page headings, plan subject |
| `text-h2` | 24px / 1.5rem | 1.28 | -0.01em | 600 | Section headings, card headings |
| `text-h3` | 20px / 1.25rem | 1.35 | -0.004em | 600 | Card titles, quiz question, nav page name |
| `text-stat` | `clamp(2rem, 3.4vw, 2.75rem)` | 1 | -0.03em | 600 | Streak, percentage and countdown values |
| `text-lg` | 18px / 1.125rem | 1.6 | 0 | 400 | Lead paragraphs, hero body |
| `text-base` | 16px / 1rem | 1.65 | 0 | 400 | Default body |
| `text-sm` | 15px / 0.9375rem | 1.55 | 0 | 400 | Dense UI, table cells, button labels |
| `text-xs` | 13px / 0.8125rem | 1.45 | 0.005em | 600 | Form labels, metadata, helper text (helper at 400) |
| `text-2xs` | 12px / 0.75rem | 1.4 | 0.06em | 600 | Badges, compact labels |
| `text-label` | 11px / 0.6875rem | 1.2 | 0.14em | 600 | Uppercase eyebrow labels |

The three largest steps are fluid so the same tokens hold at 360px and 1440px without breakpoint-specific sizes. The `.eyebrow` class packages the `text-label` style with a 24px clay rule before the label; use it for section markers instead of hand-building uppercase text.

Rules:

- Headings in sentence case. No title case except proper nouns.
- Body line length: 68 characters maximum. Reading pages: 65 to 70 characters.
- Use tabular numerals for streaks, scores, counts and dates.
- One display heading per screen. Do not stack a serif heading inside a card that already has a serif page title.
- Links use `accent` with a 1px underline and 2px offset. Hover changes color only.

## 4. Spacing, radius and borders

### Spacing scale (4px base)

| Token | Value | Use |
| --- | --- | --- |
| `1` | 4px | Icon and text gap |
| `2` | 8px | Tight stacks, label to field |
| `3` | 12px | Control inner gaps, list row gaps |
| `4` | 16px | Card padding on mobile, form field gaps |
| `5` | 20px | Card padding on desktop |
| `6` | 24px | Page gutter on tablet, panel padding |
| `8` | 32px | Page gutter on desktop, major stacks |
| `10` | 40px | Section inner padding |
| `11` | 44px | Large buttons and tab bar |
| `12` | 48px | Section spacing on mobile |
| `16` | 64px | Section spacing on desktop |
| `20` | 80px | Landing section spacing |
| `24` | 96px | Landing hero breathing room |
| `32` | 128px | Large vertical gaps between landing bands |

Page widths: content 1120px, reading 700px, forms 640px, auth card 420px, register frame 820px, quiz 720px.

Breakpoints: 360px, 768px, 1024px, 1280px, 1440px. Page gutters: 16px, 24px, 40px.

### Corner radius

| Token | Value | Use |
| --- | --- | --- |
| `rounded-xs` | 3px | Badges, tags, checkboxes, skeleton blocks |
| `rounded-sm` | 4px | Buttons, inputs, selects, tabs, quiz options, segmented controls |
| `rounded-md` | 6px | Cards, panels, dropdowns, modals, toasts |
| `rounded-lg` | 8px | Product preview frame and large framed media only |
| `rounded-none` | 0 | Table rows, dividers, full-width strips |
| `rounded-full` | 9999px | Status dots only. Never buttons or containers. |

### Borders and depth

- Depth comes from the five tones and 1px borders. There is no shadow anywhere.
- Hairline: 1px `border`, for card edges, section dividers, table row dividers.
- Strong: 1px `border-strong`, for input, select, textarea, checkbox and secondary button boundaries.
- Accent edge: a 2px left or top border in `accent` marks the current navigation item and the countdown, summary and flashcard panels. No thick frames, no coloured outlines around whole sections.
- Focus: 2px `accent` outline with 2px offset. Never a shadow ring.
- Hover: colour change only. No lift, scale, glow, translate or border thickness change.
- Press: `.pressable` controls scale to 0.985 for the duration of the press, then return. This is the only scale in the system and it never runs on hover.

### Motion

Motion exists so state changes read clearly, not to decorate. Only `transform` and `opacity` are animated, and every entrance is small: 6px to 10px of travel, never a slide across the screen.

| Token or class | Where | Spec |
| --- | --- | --- |
| `--ease-out` | Entrances and presses | `cubic-bezier(0.23, 1, 0.32, 1)` |
| `--ease-in-out` | Available for symmetric moves | `cubic-bezier(0.77, 0, 0.175, 1)` |
| `.page-enter` | Route change, wraps the outlet in every shell | 320ms, opacity 0 to 1, 10px up |
| `.stagger-list` | Plan list, schedule day groups, study-topic list | 300ms per item, 30ms steps, last step capped at 240ms |
| `.enter-panel` | Mobile navigation panel | 220ms, opacity plus 4px down |
| `dialog[open]` | Delete confirmations | 200ms, opacity plus 8px up and 0.985 scale |
| `.pressable:active` | Buttons and pressable links | Scale 0.985, 110ms |

Rules:

- Entrances use `backwards` fill, so no transform is left behind once the animation ends and sticky or fixed descendants keep their containing block.
- No hover animation, no scroll-driven animation, no looping motion other than the skeleton pulse, no parallax, no spring, no bounce.
- The stagger never exceeds eight steps; long lists animate the remainder together.
- Under `prefers-reduced-motion: reduce`, every entrance and transition is removed and the press scale is disabled. The interface must read the same without any motion.

## 5. Component styles

### Buttons

Primary: `accent` background, `on-accent` text, 1px `accent` border, 4px radius. Medium height 40px with 16px horizontal padding and 15px semibold text. Small height 32px with 12px horizontal padding. Large height 44px with 20px horizontal padding. Use 44px for primary and secondary actions below 768px. Small is for dense desktop tables only. Hover changes the background to `accent-hover`. Pressed uses `accent-pressed` plus the shared 0.985 press scale. Disabled uses `sunken` background, `ink-muted` text and `border` edge, with no pointer events. No shadow, no icon unless the label needs one.

Secondary: `surface` background, 1px `border-strong`, `ink` text, same sizes and radius. Hover changes the background to `sunken`, pressed to `sunken-deep`. Text stays `ink`.

Quiet: no border, no background, `ink-muted` text at 15px. Hover changes text to `ink`. Used for back links, cancel and low-priority actions.

Pressable: primary, secondary and destructive buttons all carry the `pressable` class. It transitions colour only and adds the press scale from the motion table. Do not add the class to text links, checkboxes or rows.

Destructive: solid `error` background with `on-accent` text, or quiet `error` text when the action is reversible. Solid destructive appears only in a confirmation dialog.

One primary action per view. Repeat the same action later on a long page if needed. Button labels are verbs: "Create plan", "Generate schedule", "Submit answers", "Log in".

Button loading state: keep the same width, disable the button, change the label to the in-progress action ("Generating plan") and show the skeleton in the content area. No spinner.

### Inputs

Structure: visible label above the field, 13px semibold `ink`; optional helper at 12px `ink-muted`; field; error message at 13px `error` below the field with an 8px gap.

Text input and select: height 40px, 1px `border-strong`, 4px radius, `surface` background, 16px `ink` text, 12px horizontal padding, placeholder `ink-muted`. Use 44px height on screens below 768px. Focus adds a 2px `accent` outline with 2px offset. Error uses an `error` border plus the written error message, so color is not the only signal. Disabled uses `sunken` background, `ink-muted` text and `border` edge.

Textarea: same shell, minimum three rows, vertical padding 12px, resize vertical only.

Checkbox: 18px square, 3px radius, 1px `border-strong`, `surface` background. Checked uses `accent` fill and `on-accent` check mark. Checkbox is used for schedule tasks alongside a real label, and the whole row is at least 44px tall so the tap target includes the label.

Radio: 18px circle, 1px `border-strong`. Selected uses an `accent` ring and fill. Quiz options do not use native-looking radio dots as the only affordance; the whole option row is the target.

Tag input (topics): a `surface` field with 4px radius and `border-strong` border. Tags are 3px radius badges in `sunken` with `ink` text and a plain text remove control. Add with Enter or a secondary "Add topic" button.

Date and number inputs: same shell as text. Native pickers are allowed. No custom calendar overlay in this version.

Form behavior: validate on blur and on submit. On submit failure, focus a linked error summary above the form. Never clear entered values after an error. Use correct `autocomplete` attributes on auth forms.

### Cards

Base card: `surface` background, 1px `border`, 6px radius, 20px padding on desktop and 16px on mobile. No shadow. Cards hold one idea. Do not nest cards inside cards; use dividers or `sunken` blocks instead.

List panel: one `surface` panel with a 1px border and 6px radius. Rows sit directly in the panel with 1px `border` dividers and 16px to 20px vertical padding. Row hover changes the background to `sunken`. Used for plans, tasks, quizzes and decks.

Stat block: `sunken` background, 1px `border`, 6px radius, 16px padding. Label at 12px `ink-muted`, value at 32px Fraunces `ink` with tabular numerals, meta at 13px `ink-muted`.

Interactive card (plan card, deck card): same as base card, but hover changes the border to `border-strong` and the background to `surface`. The whole card is one link with a visible focus outline. No lift.

Empty state: `sunken` panel with 1px `border`, 6px radius, 24px padding, a short heading, one sentence and one action. No illustration.

### Tabs

Underline tabs, used inside Plan Detail for Schedule, Quizzes and Flashcards. The tab bar is 44px tall with a 1px `border` bottom edge. Each tab has 15px semibold text, `ink-muted` when inactive and `ink` when active. The active tab has a 2px `accent` bottom border. Hover changes inactive text to `ink`. Focus uses the standard 2px accent outline with 2px offset. No sliding indicator, no animation, no pill background.

Segmented control, used for filters such as quiz status. Container has `surface` background, 1px `border`, 4px radius. Options are 32px tall, 4px radius, 13px semibold. The selected option uses `sunken` background and `ink` text. Inactive options use `ink-muted`. Hover changes text color only.

Tabs switch content in place. Keep the page header and progress summary above the tabs so orientation does not change.

### Progress, streak and status

Progress bar: 8px track in `sunken` with 1px `border`, 4px radius, filled with `accent` for general progress and `success` for completion. No gradient, no animation. Always pair the bar with written text such as "12 of 30 tasks complete".

Streak: a written label plus a number. Example: "6 day streak". Use an 8px `success` dot only when the student has completed a task today. No flame icon, no confetti, no emoji.

Countdown: plain text, 13px `ink-muted` label and 15px `ink` value, for example "Exam in 12 days". Use `warning` text when the exam is within 3 days.

Badges: 3px radius, 1px border in the status color, transparent background, 12px semibold text in the same color, 4px 8px padding. No pills. Use for status only: "Complete", "Due today", "Not started".

### Skeleton loaders

Every loading state uses skeletons shaped like the content that will replace them. Base block: `sunken` background, 3px to 6px radius. Use a tonal pulse between 100 percent and 55 percent opacity over 1.8 seconds. No gradient shimmer, no spinner, no blank page.

Skeletons are `aria-hidden="true"` inside a container marked `aria-busy="true"`. Under reduced motion, keep the blocks static. Match the final layout: same heights, same number of rows, same grid.

### Navigation

Marketing header: 64px tall, `paper` background, a 2px `accent` rule above it and a 1px `border` bottom edge. Wordmark left, links right, quiet "Log in" right, no primary action. Mobile: wordmark and a menu button from Phosphor. The menu panel opens with the 220ms `.enter-panel` entrance; reduced motion shows it instantly.

App shell: 240px sidebar in `surface` with a 1px `border` right edge, 64px top bar in `paper` with a 1px `border` bottom edge, content area in `paper` with 32px padding and a 1120px maximum width. The top bar shows the current page name above the shell heading.

Sidebar items: 40px tall, 10px horizontal padding, 4px radius, 15px text, Phosphor icon at 18px. Default text `ink-muted`. Active item uses `accent-wash` background, `ink` text and a 2px `accent` left border. Hover changes background to `sunken`. Current item is also marked with `aria-current="page"`.

Mobile navigation: top bar with menu button, panel with the same items, user block and logout. The panel enters from the top with `.enter-panel`; it is not a drawer and does not cover the page.

Footer: present on every screen. `border` top edge, 32px vertical padding, three zones: wordmark and one-line description, links (How it works, Terms, Privacy), copyright. Plain text links, no social icons.

### Dialogs and feedback

Confirmation dialog: overlay in `rgba(35, 38, 31, 0.4)` with no blur. Panel is `surface`, 1px `border`, 6px radius, 24px padding, 480px maximum width. Focus is trapped, Escape closes, focus returns to the trigger. Buttons: quiet cancel and one destructive confirm. No shadow.

Inline alerts: `sunken` background, 1px `border`, 6px radius, 16px padding, a 2px left border in `success`, `warning` or `error`, and written text in the matching color. No icons required.

Toasts: avoid them. Use inline alerts near the action so the message stays in context.

### Charts

If Recharts appears on the dashboard: flat presentation only. No gradients, no shadows, no grid fill. Horizontal hairline grid lines in `border`, 12px `ink-muted` axis labels, 2px `accent` line or solid `accent` bars, tooltip on `surface` with 1px `border` and 4px radius. Disable chart animations.

### Brand mark and favicon

Mark: a stacked-pages symbol. Two 16x20 rounded rectangles, the back one in `accent` outline and the front one filled, with three `on-accent` rule lines on the front page. The front page sits lower-left and the back page peeks out at the top-right, so the mark reads as a plan with more pages behind it. It is drawn at `32x32` and used at 28px in headers and 32px at the base size. The mark is decorative (`aria-hidden`) unless a `title` is passed, in which case it exposes an accessible name.

Wordmark: the mark plus a single-line lockup. "StudyBuddy" in Fraunces 600 at 20px, `ink`, tracking -0.01em. The whole lockup is one link to the home route with an `aria-label` of "StudyBuddy, home". Use the `sm` size in every header and the footer.

Favicon: derived from the same mark, `viewBox="0 0 32 32"`. `paper` rounded square, the outlined back page in `accent`, the filled front page in `accent`, and the three rule lines in `on-accent`. Keep at least one page edge visible at 16px. No gradient, no shadow. Export a 180px touch icon from the same art. Check legibility at 16px before shipping.

Files: `client/src/components/LogoMark.jsx` (mark), `client/src/components/Wordmark.jsx` (lockup), `client/public/favicon.svg` (browser tab).

## 6. Screens and layouts

Shared rules: one primary action per screen, a footer on every screen, skeleton loaders for every async region, no fabricated data, and no decorative imagery. Repeating the same primary action in a later section is allowed on a long page. Never show two different primary actions at once.

### Screen inventory

| Screen | Route | Shell | Primary action |
| --- | --- | --- | --- |
| Landing | `/` | Marketing | Create your plan |
| Register | `/register` | Auth | Create account |
| Login | `/login` | Auth | Log in |
| Dashboard | `/dashboard` | App | Create plan |
| Create Plan | `/plans/new` | App | Generate schedule |
| Plan Detail | `/plans/:id` | App | Continue next task |
| Quiz | `/plans/:id/quiz/:quizId` | Focus | Next question or Submit answers |
| Flashcards | `/plans/:id/flashcards/:deckId` | Focus | Show answer, then Got it |
| Terms | `/terms` | Reading | None |
| Privacy | `/privacy` | Reading | None |
| 404 | any unknown route | Marketing | Go to dashboard or Go to home |

When the primary action is unavailable, disable it or replace it with a written completed state. Do not add a second primary.

### Landing (`/`)

Layout: marketing header, hero, how it works, product detail, closing action band, footer. Maximum width 1120px.

Header: wordmark left, "How it works" link, quiet "Log in" right. No primary action in the header.

Hero: two columns at 1024px and up, 5 and 7. Left: 12px eyebrow "Study schedule", H1 "Know what to study each day until the exam.", one 18px paragraph explaining the inputs and outputs, primary "Create your plan", quiet "See how it works". Right: a product frame (`surface`, 1px `border`, 8px radius, no shadow) showing the real schedule component with a progress bar, three task rows and one completed task. Use a real generated plan stored as a fixture, not hand-written numbers.

How it works: three rows, not three cards. Each row is a 12-column split: number in Fraunces, short heading and two sentences, and a real UI fragment from the plan, quiz or flashcard screen. Alternate the UI side left and right. Copy:

1. "Enter the exam." Subject, topics, exam date and hours per day. That is the whole setup.
2. "Get the plan." A daily schedule with quizzes and flashcards for each topic.
3. "Finish the day." Check off tasks. Progress and streak update from completed work.

Product detail section: one asymmetric split showing the schedule view at 7 columns and a short explanation at 5, then a second split showing the quiz and flashcard components at 5 and 7. Avoid a row of three equal feature cards.

Closing band: `sunken` background with 1px top and bottom borders, H2 "Start with one subject.", one sentence, primary "Create your plan".

Footer: wordmark, "A study schedule for the weeks before an exam.", links How it works, Terms, Privacy, and copyright.

Mobile: hero stacks with copy first and the product frame below. The frame scrolls horizontally only if needed, without page overflow. Sections become single column, UI fragments follow their copy.

### Register (`/register`)

Layout: auth shell. Paper page, 64px header with wordmark and "Log in" link. At 1024px and up, a centered two-part frame: 420px form panel on `surface` with 1px border and 6px radius, and a 360px note panel on `sunken` separated by a 1px border. Below 1024px, only the form remains.

Form panel: H1 "Create your account." Fields: name, email, password. Password helper: "At least 8 characters." Primary full-width "Create account". Secondary line: "Already have an account? Log in." Legal line: "By creating an account you agree to the Terms and Privacy Policy." Both links point to the real pages.

Note panel: heading "What you get." Three plain lines separated by hairlines: "A daily schedule from today to exam day", "Quizzes and flashcards for your topics", "Progress and a streak based on completed tasks." No check marks, no icons, no testimonials.

States: inline field errors, error summary on submit, disabled submit while pending, skeleton only if the page loads remote config. Success redirects to Dashboard.

### Login (`/login`)

Layout: same auth shell. H1 "Log in." Fields: email and password. Primary full-width "Log in". Secondary: "New here? Create an account." No social login and no fake "forgot password" link unless the flow exists.

States: inline errors, error summary, disabled submit while pending, generic failure message ("Email or password is incorrect."). Never reveal whether an account exists.

### Dashboard (`/dashboard`)

Layout: app shell. Sidebar: wordmark, nav (Dashboard, Create Plan, Summarize Document, Settings), user block at the bottom with name, email and "Log out". Top bar: page name above the shell label on desktop, mobile wordmark and menu on small screens. Content: 1120px maximum width, 32px padding.

Header row: H1 "Your study", today's date in 13px muted text, primary "Create plan".

Summary strip: one `surface` panel with a 1px border and 6px radius, divided into three segments by vertical hairlines. Streak, tasks due today, active plans. Each segment has a 12px label, a 32px Fraunces value with real data, and one line of context. Nothing is hardcoded.

Main grid at 1280px and up: 8 and 4. Left: "Today" list panel with today's tasks across plans, each row with checkbox, task title, subject and minutes. Below it: "Your plans" list with rows for subject, exam date countdown, progress bar and "Open plan". Right: "This week" summary with real counts and a link to the active plan. Below 1280px everything stacks.

Empty states: no plans gives a `sunken` panel with "No plans yet." and "Create a plan for your next exam and your schedule will appear here." plus primary "Create plan". When the panel is shown, hide the header primary so only one primary remains. No tasks today gives "No tasks due today." and a quiet link to the plan.

Loading: skeleton for header, summary strip, today rows and plan rows.

### Create Plan (`/plans/new`)

Layout: app shell with a back link, H1 "Create a plan", and a two-column body at 1024px and up: form 7 columns, summary 5 columns. Summary is sticky at 88px from the top. On mobile the summary follows the form, with the primary action at the end of the form.

Form panel: `surface`, 1px border, 6px radius, 24px padding, sections separated by hairlines. Fields:

- Subject: text, required.
- Topics: tag input, at least one topic, each 1 to 80 characters.
- Exam date: date, today or later.
- Hours per day: number, 0.5 to 12, step 0.5.

Each field has a visible label and a short helper where needed. Validation is inline. The primary "Generate schedule" sits at the bottom of the form only.

Summary panel: `sunken`, 1px border, 6px radius, 20px padding. Shows the subject, topic count, days until the exam, hours per day and an estimated total hours value computed from the actual inputs. This is arithmetic, not a fake metric. The panel also explains what will be generated in one sentence.

Generation state: the summary becomes a skeleton and the page shows a schedule skeleton where the result will appear. Written status: "Generating your plan." No spinner, no fake percentage. If generation fails, an inline error panel says "Plan generation failed. Check your details and try again." The form keeps its single primary "Generate schedule". Values stay in the form.

### Plan Detail (`/plans/:id`)

Layout: app shell. Back link to Dashboard. Header: subject as H1, meta row with exam date, days remaining and hours per day. Actions: secondary "Edit plan" and quiet destructive "Delete plan" with confirmation. Progress summary: written task count, progress bar and streak status. Primary "Continue next task" sits in the summary and jumps to the next incomplete task. When every task is complete, replace it with the written line "All tasks complete." Tabs: Schedule, Quizzes, Flashcards.

Schedule tab: day groups from the plan start to the exam. Each group has a day header (date, task count, total minutes) separated by hairlines and task rows with checkbox, topic, title, minutes and status. Completed rows keep normal text but add a `success` status label and checked box. Checking a task updates progress immediately; the bar and count change from server data.

Right rail at 1280px and up: "Exam in N days", "Today" tasks and two quiet links to the Quizzes and Flashcards tabs. Below 1280px the rail stacks under the tabs.

Quizzes tab: list panel of generated quizzes. Each row: topic, question count, last score or "Not taken", and "Start quiz". No scores are invented; "Not taken" is the real empty state.

Flashcards tab: list panel of decks. Each row: topic, card count, last reviewed or "Not reviewed", and "Review cards".

Empty and error states: if a plan has no schedule, show a written message and a secondary "Generate again" action. If the plan is not found, show "Plan not found." with a link to Dashboard. Loading uses header and list skeletons.

### Quiz (`/plans/:id/quiz/:quizId`)

Layout: focus shell. 64px top bar with wordmark left and quiet "Exit quiz" right. Content 720px maximum width, centered, 32px vertical padding.

Header: quiz topic as H2 or H3, "Question 3 of 10" in 13px muted text, and a real progress bar.

Question card: `surface`, 1px border, 6px radius, 24px padding on mobile and 32px on desktop. Question at 20px to 24px, then four option rows. Each option is a full-width label with 1px `border-strong`, 4px radius, 12px to 16px padding, 16px gap between rows. Default background is `surface`. Hover changes the background to `sunken`. Selected uses `accent` border, `accent-soft` background and `ink` text. Focus shows the standard outline on the whole option.

Footer actions: secondary "Previous" when applicable, primary "Next question" or "Submit answers" on the last question. Only one primary. Keyboard: arrow keys move between options, Enter selects, Tab reaches the actions.

Results: written score such as "7 of 10 correct" with a progress bar, then a review list. Each reviewed question shows the question, the student's answer, the correct answer and a written "Correct" or "Incorrect" label in `success` or `error`. Actions: secondary "Retake quiz", quiet "Back to plan". No confetti, no emoji, no animated score.

Loading: question card skeleton with four option rows. Error: "Quiz not found." with a link back.

### Flashcards (`/plans/:id/flashcards` and review view)

Deck list lives inside the Plan Detail Flashcards tab. Review view uses the focus shell, 640px maximum width.

Review header: topic, "Card 4 of 12" and a real progress bar. Card panel: `surface`, 1px border, 6px radius, 24px to 32px padding, minimum height 240px. Front text at 20px to 24px, centered vertically, with the prompt label "Question" or "Term" in 12px muted text. A primary "Show answer" reveals the answer below a 1px divider. No 3D flip, no swipe requirement, no scroll animation.

After reveal, actions: secondary "Review again" and primary "Got it". Marking advances the card and updates the progress. Keyboard: Space reveals, 1 marks review again, 2 marks got it, with a plain text hint under the card.

Completion: written summary "Deck reviewed. 12 cards." with secondary "Review again" and primary "Back to plan". No celebration animation.

Loading: card panel skeleton with text lines. Error: "Deck not found." with a link back.

### Terms (`/terms`)

Layout: reading shell. 64px header with wordmark and "Back to home" quiet link. Article 700px maximum width, 48px to 64px vertical padding. H1 "Terms of Service", "Last updated: [date]" in 13px muted text, then sections with H2 at 20px and body at 16px/1.7. Hairline dividers between major sections.

Sections: what the service is, accounts, acceptable use, study content generated for the student, availability, ending an account, contact. Plain language, no invented legal entity details. Links use `accent` with underline.

Footer with Terms, Privacy and Home links.

### Privacy (`/privacy`)

Layout: same reading shell. H1 "Privacy Policy", last updated date, sections covering: data collected (name, email, study inputs, progress), how it is stored, third-party processing for plan generation, cookies or local storage used for sign-in, retention, deletion, and contact. Write only what the implementation actually does. If a detail is not built yet, leave it out rather than guessing.

Sections use the same type scale as Terms. A short "Your choices" block uses the base card with 20px padding, not a colored callout.

### 404

Layout: marketing shell with header and footer. Centered block, 560px maximum width, 96px vertical padding. "404" as an italic `text-display` numeral in `ink-muted`, H1 "This page does not exist.", one sentence: "Check the address, or go back to the part of StudyBuddy you were using." Primary "Go to dashboard" when signed in, otherwise "Go to home". Quiet "Back" using browser history.

No illustration, no mascot, no easter egg.

## 7. Copy patterns

- Hero: "Know what to study each day until the exam."
- Registration: "Create your account."
- Empty plans: "No plans yet. Create a plan for your next exam and your schedule will appear here."
- Generate failure: "Plan generation failed. Try again."
- Quiz result: "7 of 10 correct."
- Deck empty: "No flashcards for this topic yet."
- Delete confirmation: "Delete this plan? The schedule, quizzes and flashcards will be removed."

Avoid: "Unlock your potential", "Study smarter, not harder", "Supercharge", "AI-powered learning companion", "Join thousands of students", "It is not just a schedule, it is a new way to study."

## 8. Accessibility and quality checks

- Text contrast meets 4.5:1; interface boundaries and focus indicators meet 3:1.
- Every control has a visible label and a keyboard focus state.
- Error messages are written and linked to their fields. Color is never the only signal.
- Quiz options work with native keyboard controls and announce selected state.
- Task checkboxes have full labels, not just the checkbox.
- Touch targets are at least 44px tall.
- Reduced motion: entrances, press scale and colour transitions are removed, and the skeleton pulse stops. Content order and every state stay identical.
- Test at 360px, 768px, 1024px, 1280px and 1440px. No horizontal scrolling at 360px or 1440px.
- The page works at 200 percent zoom without overlap.

## 9. Banned list checklist

- No gradients, including skeleton shimmer.
- No purple, neon, rainbow or pastel palette.
- No pure white background.
- No drop shadows.
- No emojis in copy, icons, labels or alt text.
- No Lucide icons. Phosphor only, used sparingly.
- No pill buttons. Small radii only.
- No liquid glass, radial orbs, dot grids, sparkle icons, animated arrows, cursor effects or terminal mockups.
- No bento grids, rows of three identical cards, checkmark bullet lists or three-tier pricing.
- No scroll animations, parallax or scroll-linked transforms.
- No hover transforms. Hover is a colour change. The press-only 0.985 scale on `.pressable` is the single exception.
- No looping motion except the skeleton pulse.
- No fake counters, reviews, testimonials or metrics.
- No "made with AI" badge in the UI.
