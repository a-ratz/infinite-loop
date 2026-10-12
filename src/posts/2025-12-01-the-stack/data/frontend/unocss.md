---
name: UnoCSS
status: Recommended
link: https://unocss.dev/
why: Faster builds, attributify mode, pure CSS icons
hot: true
---

Tailwind CSS is a PostCSS plugin with opinions. UnoCSS is an engine with possibilities.

The difference matters when you want to color outside the lines. UnoCSS generates exactly zero CSS until you use a utility, then synthesizes only what you need with no parsing, no AST, no scanning. The result is 5x faster than Tailwind JIT, which was already fast enough that most people stopped complaining about build times.

But speed is just the opening act. Attributify mode lets you group utilities into HTML attributes instead of class soup. Pure CSS icons turn any icon set into single-class utilities. Variant groups let you write `hover:(bg-blue text-white)` instead of repeating yourself. The compilation mode can even synthesize multiple utilities into single classes for production.

With 200K weekly downloads and 17K GitHub stars, the community has voted with their installs. Want Tailwind syntax? The preset-wind gives you familiar utilities with full customization escape hatches. Want something entirely your own? Build it. UnoCSS doesn't care. It's an engine, not a religion.
