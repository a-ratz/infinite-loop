---
name: Qwik
status: Watch
link: https://qwik.dev
why: Minimal JS loaded, instant interactivity
---

From Miško Hevery, the creator of AngularJS, comes the framework that asked: what if we just... didn't hydrate? Qwik's "resumability" means the server serializes the entire app state into HTML. The browser picks up exactly where the server stopped, no JavaScript replay required. The loader is under 1KB and executes in under 1ms regardless of app size. Pages are interactive instantly because there's nothing to hydrate. The tradeoff is a steeper learning curve and a different mental model. But for content-heavy sites where Time to Interactive matters, Qwik's approach is radical and effective.
