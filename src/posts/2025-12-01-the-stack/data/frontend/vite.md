---
name: Vite
status: Established
link: https://vite.dev/
why: Instant HMR, ESM-native, great plugins
---

Once upon a time, starting a development server meant waiting. Making a change meant waiting more. Build tools were things you configured once, swore at twice, and tried never to touch again.

Then Evan You got annoyed and made Vite.

No bundling during development. Native ES modules served directly to the browser. Hot module replacement so fast you'll check if it actually worked. The dev server starts in milliseconds regardless of how large your project grows, because it's not doing the work upfront that it doesn't need to do yet.

Vite 6.0 now pulls 17 million weekly downloads, up from 7.5 million last year. SvelteKit uses it. Nuxt 3 uses it. Analog for Angular uses it. The ecosystem of plugins is vast, Rollup-compatible, and actually documented. When you eventually need to build for production, esbuild handles TypeScript and minification at Go speeds while Rollup does tree-shaking with surgical precision.

The build tool wars are over. Vite won by making everyone else feel slow.
