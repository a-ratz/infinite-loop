# AGENTS.md

Operational orientation for agents working in this repository.

## Project Thesis

Infinite Loop is an interactive essay/blog platform where each post is a full
React application. The core idea is "ideas rendered as experiences": posts are
not just text with styling, they can be stateful tools, simulations, catalogs,
visual explainers, or small apps.

Do not treat this like a normal static blog. The house style is the permission
structure, not a rigid component system:

- Each post may have its own visual language, layout, data model, and interaction
  pattern.
- The site shell should still feel coherent: dark technical/editorial base,
  mono metadata, restrained grid/noise texture, strong typography, and one clear
  accent color per post or section.
- The best Infinite Loop post makes the reader do or see the idea, not merely
  read about it.

## Current Stack

- React 18
- Vite 5
- React Router v6
- Tailwind CSS is available globally
- Some older components use inline styles heavily
- Content for The Stack is markdown plus frontmatter loaded with Vite
  `import.meta.glob`
- No test runner is configured
- No linter is configured

Use npm here.

```bash
npm ci
npm run dev
npm run build
npm run preview
```

The current baseline verification is `npm run build`.

## Repo Shape

```text
src/
  App.jsx                    Routes: home, about, impressum, dynamic posts
  main.jsx                   BrowserRouter entrypoint
  index.css                  Tailwind layers and global dark base
  components/
    PostLayout.jsx           Floating back nav wrapper for post pages
  pages/
    Home.jsx                 Post grid / site front door
    About.jsx                Manifesto page
    Impressum.jsx            German legal page
  posts/
    registry.js              Post metadata and route registration
    2025-12-01-the-stack/    Interactive tool catalog post
    2025-12-07-fzf/          Tools You Should Know fzf post
docs/
  companion/                 Internal notes for each post
  DEPLOYMENT.md              Hosting options and SPA routing notes
public/
  fzf-preview.png
  favicon.svg
```

## Adding A Post

1. Create `src/posts/YYYY-MM-DD-slug/index.jsx`.
2. Export a default React component.
3. Add the post to `src/posts/registry.js`.
4. Add a companion note in `docs/companion/YYYY-MM-DD-slug.md`.
5. Run `npm run build`.
6. If the post is visual or interactive, run it locally and inspect it in a
   browser at desktop and mobile sizes.

Registry shape:

```js
{
  slug: "new-post",
  title: "New Post",
  description: "Shown on the home card",
  date: "YYYY-MM-DD",
  type: "interactive",
  color: "#6366f1",
  series: "TYSK",
  seriesFull: "Tools You Should Know",
  component: NewPost,
}
```

`series` and `seriesFull` are optional.

## Current Posts

### fzf

Path: `src/posts/2025-12-07-fzf/`

First entry in the "Tools You Should Know" series. It is a cinematic tutorial
with full-screen sections, emerald terminal styling, and real interactive
components:

- animated hero terminal
- working fuzzy finder
- grep vs fzf comparison
- scoring visualization
- install/resource sections

Implementation is split across `index.jsx` and `FzfDemo.jsx`. It uses Tailwind
classes and works well on mobile in the current browser pass.

### The Stack

Path: `src/posts/2025-12-01-the-stack/`

An opinionated developer-tool catalog for 2025-2026. It behaves more like a
small dashboard than an article:

- sticky search/status/category filters
- stats row
- category grouping
- markdown-backed tool cards
- HOT badges
- Visit links
- expandable "Why this?" sections

Current repo state has 77 markdown tool records across 15 categories:

- 15 Established
- 40 Recommended
- 22 Watch

The loader in `data/index.js` uses a custom browser-safe frontmatter parser.
`gray-matter` and `buffer` are still dependencies but are not referenced by
`src/` in the current code.

## Visual Language From Browser Inspection

Desktop home:

- dark grid/noise background
- giant all-caps "INFINITE LOOP"
- small mono subtitle
- large translucent post cards with accent tags
- quiet centered footer

fzf:

- immersive tutorial deck
- one idea per viewport
- emerald accent color
- terminal-window artifacts
- live controls that update immediately

The Stack:

- dense, scannable, dashboard-like
- sticky filter band
- colored category sections
- small metadata, counters, badges, and external-link buttons
- the interaction is the argument: filtering the curated dataset is the reading
  experience

About:

- manifesto page
- giant display typography
- serif/italic contrast
- amber highlights
- scroll-driven editorial composition

Impressum:

- intentionally quiet and legal-readable
- inherits the dark grid shell

## Known Sharp Edges

- `wrangler.jsonc` uses `"name": "inifinite-loop"` with an extra `i`. This
  appears to match the existing deployed URL naming, so do not "fix" it casually.
- `docs/DEPLOYMENT.md` explains SPA redirect needs, but the repo currently does
  not have a committed `public/_redirects`.
- The home cards use `repeat(auto-fill, minmax(350px, 1fr))` inside 40px page
  padding. On a 390px mobile viewport, the cards feel slightly wider than the
  visible page.
- The Stack mobile status-filter row currently pushes the Watch button off the
  right edge.
- `npm ci` reported audit findings during orientation on 2026-06-08. Re-run
  `npm audit` before making claims about current security state.
- `npm run build` emits stale Browserslist / baseline-browser-mapping warnings.

## Development Guidance

- Preserve the "each post is its own app" idea. Do not prematurely normalize all
  posts into one component library.
- Keep shared shell changes careful because every post flows through
  `PostLayout` and `App.jsx`.
- Prefer browser verification for visual work. Reading JSX is not enough here.
- For new interactive posts, verify at least:
  - home card
  - post hero
  - one key interaction
  - desktop viewport
  - mobile viewport
- Companion docs are part of the project habit. Update them when a post's
  architecture, visual pattern, or content decisions change.
- Keep public-facing text sharp, opinionated, and concrete. Avoid corporate
  blandness.
- Do not add explanatory in-app text about how the interface works unless the
  post itself genuinely needs it.
