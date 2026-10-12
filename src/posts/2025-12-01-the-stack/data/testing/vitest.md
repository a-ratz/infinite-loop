---
name: Vitest
status: Recommended
link: https://vitest.dev/
why: Same config as Vite, fast watch mode
hot: true
---

Jest was fine. Vitest is fast.

The difference isn't subtle. Vitest leverages Vite's hot module replacement and esbuild's speed to create a watch mode that feels instantaneous. Change a file, tests re-run for just the affected code, results appear before your finger lifts from Ctrl+S. The feedback loop becomes so tight it changes how you write code.

But speed is just the headline. The real joy is configuration. Vitest uses your existing vite.config.js. Same plugins. Same transformers. Same resolvers. No more maintaining parallel configurations that inevitably drift apart. Your dev server and your test runner finally agree on how your code should be processed.

Jest-compatible API means migrating is mostly mechanical. TypeScript, JSX, ESM all work out of the box. Coverage via v8 or istanbul. Built-in mocking with Tinyspy. Browser mode for component tests that need real DOM APIs. React, Vue, Svelte, Lit, Marko: all supported.

Even if you're not using Vite, Vitest is compelling. But if you are using Vite, the question isn't "should we switch?" It's "why haven't we already?"
