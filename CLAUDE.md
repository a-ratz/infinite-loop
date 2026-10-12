# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev      # Start Vite dev server (hot reload)
npm run build    # Production build to dist/
npm run preview  # Preview production build locally
```

No test runner is configured. No linter is configured.

## Architecture

**Infinite Loop** is an interactive blog where each post is a full React application, not static HTML. Posts can have their own state, filtering, animations, and data systems.

### Routing & Post Registration

```
src/App.jsx           → Routes: / (Home) + dynamic routes from posts[]
src/posts/registry.js → Post metadata array: slug, title, date, component
```

Routes are auto-generated from the `posts` array in registry.js. Each post object maps a slug to a React component.

### Post Structure

Each post lives in `src/posts/YYYY-MM-DD-slug/`:
- `index.jsx` — The main interactive component (can be 600+ lines, full creative freedom)
- `data/` — Optional: markdown files, data loaders, or any supporting content

Example: The Stack post loads markdown files with YAML frontmatter using `import.meta.glob()` and parses them with a browser-compatible frontmatter parser (no gray-matter at runtime).

### Adding a New Post

1. Create `src/posts/YYYY-MM-DD-slug/index.jsx` with a default export React component
2. Add entry to `src/posts/registry.js`:
   ```js
   import NewPost from './YYYY-MM-DD-slug'
   
   export const posts = [
     // ... existing posts
     {
       slug: 'new-post',
       title: 'New Post',
       description: 'Description for home page',
       date: 'YYYY-MM-DD',
       type: 'interactive',  // or 'demo', 'essay', etc.
       color: '#6366f1',     // accent color
       component: NewPost
     }
   ]
   ```

### Key Patterns

- **CSS-in-JS via inline styles** — Each post controls its own styling completely
- **Markdown + Frontmatter** — Content in `.md` files with YAML frontmatter, parsed at build time via Vite's glob imports
- **No external CMS** — Content lives in the repo
- **Client-side routing only** — React Router v6, no SSR/SSG

### Data Loading Pattern (from The Stack)

```js
// data/index.js
const toolModules = import.meta.glob('./**/*.md', { eager: true, query: '?raw', import: 'default' })
// Custom frontmatter parser (no Node.js deps)
```

### Companion documentation

Every post has a corresponding 'companion' markdown file in the `docs/companion` directory which provides additional context, technical details, or supplementary information like decisions made during development.

## Deployment

GitHub Pages via manual workflow. See `docs/DEPLOYMENT.md` for Cloudflare Pages, Vercel, and Netlify options.
