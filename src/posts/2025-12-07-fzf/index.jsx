import React, { useState, useEffect } from 'react';
import FzfDemo, { FzfComparison, FzfAlgorithmViz } from './FzfDemo';

/**
 * Full blog post: "Tools You Should Know: fzf"
 *
 * First post in the "Tools You Should Know" series.
 *
 * Designed to fit the INFINITE LOOP aesthetic:
 * - Dark, terminal-inspired
 * - Each section is its own "moment"
 * - Interactive elements throughout
 * - Typography-forward
 */

// Animated typing effect for the hero
function TypedFzf() {
  const [phase, setPhase] = useState(0);
  const queries = ['btn', 'hook', 'cfg', 'auth'];
  const files = [
    ['Button.tsx', 'BtnGroup.tsx', 'SubmitBtn.tsx'],
    ['useHook.ts', 'hookUtils.ts', 'useAuthHook.ts'],
    ['config.ts', 'tsconfig.json', 'cfg.yaml'],
    ['auth.ts', 'useAuth.ts', 'authMiddleware.ts'],
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase(p => (p + 1) % queries.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-mono text-left inline-block">
      <div className="text-neutral-500 text-lg mb-2">$ find . -name "*" | fzf</div>
      <div className="flex items-center gap-2 text-2xl md:text-3xl">
        <span className="text-emerald-400">&gt;</span>
        <span className="text-white">{queries[phase]}</span>
        <span className="animate-pulse text-emerald-400">▌</span>
      </div>
      <div className="mt-3 space-y-1">
        {files[phase].map((file, i) => (
          <div
            key={file}
            className={`text-lg transition-all duration-300 ${i === 0 ? 'text-emerald-400' : 'text-neutral-500'}`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            {i === 0 && <span className="text-amber-400 mr-2">▸</span>}
            {file}
          </div>
        ))}
      </div>
    </div>
  );
}

// Section wrapper with scroll animation potential
function Section({ children, className = '', dark = false }) {
  return (
    <section className={`min-h-screen flex items-center justify-center px-6 py-24 ${dark ? 'bg-neutral-950' : 'bg-neutral-900'} ${className}`}>
      <div className="w-full max-w-4xl">
        {children}
      </div>
    </section>
  );
}

// The actual blog post
export default function FzfPost() {
  // Scroll to top on mount (after any other effects that might scroll)
  useEffect(() => {
    setTimeout(() => window.scrollTo(0, 0), 0);
  }, []);

  return (
    <div className="bg-neutral-900 text-neutral-100">
      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
        {/* Background grid effect */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />

        <div className="relative z-10 text-center">
          <p className="text-emerald-400 font-mono text-sm tracking-widest mb-6 uppercase">
            Tools You Should Know
          </p>

          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight">
            <span className="text-white">f</span>
            <span className="text-emerald-400">z</span>
            <span className="text-white">f</span>
          </h1>

          <p className="text-xl md:text-2xl text-neutral-400 max-w-lg mx-auto mb-12">
            The fuzzy finder that will change how you navigate your entire computer.
          </p>

          <div className="bg-neutral-800/50 backdrop-blur rounded-xl p-6 inline-block border border-neutral-700">
            <TypedFzf />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-neutral-500 animate-bounce">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* The Problem */}
      <Section dark>
        <div className="text-center mb-16">
          <p className="text-amber-400 font-mono text-sm tracking-widest mb-4 uppercase">
            The Problem
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            You have <span className="text-red-400">10,000</span> files.
          </h2>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            You know the one you want has "auth" somewhere in it. Maybe "hook"?
            Was it in <code className="text-neutral-300 bg-neutral-800 px-2 py-0.5 rounded">src/</code> or <code className="text-neutral-300 bg-neutral-800 px-2 py-0.5 rounded">lib/</code>?
          </p>
        </div>

        {/* Simulated painful grep experience */}
        <div className="bg-neutral-950 rounded-lg p-4 font-mono text-sm border border-neutral-800 max-w-2xl mx-auto">
          <div className="text-neutral-500 mb-2">$ find . -name "*auth*"</div>
          <div className="text-neutral-400 space-y-0.5 opacity-60">
            <div>./src/auth/authConfig.ts</div>
            <div>./src/auth/authService.ts</div>
            <div>./src/auth/authTypes.ts</div>
            <div>./src/hooks/useAuth.ts</div>
            <div>./src/hooks/useAuthCallback.ts</div>
            <div>./src/middleware/authMiddleware.ts</div>
            <div>./tests/auth/auth.test.ts</div>
            <div className="text-neutral-600">... 47 more results</div>
          </div>
          <div className="text-neutral-500 mt-4 mb-2">$ # wait, which one was the hook again?</div>
          <div className="text-neutral-500 mb-2">$ find . -name "*auth*hook*"</div>
          <div className="text-red-400">no matches</div>
          <div className="text-neutral-500 mt-2">$ # ugh</div>
        </div>

        <p className="text-center text-neutral-500 mt-8 text-lg">
          Sound familiar?
        </p>
      </Section>

      {/* The Solution */}
      <Section>
        <div className="text-center mb-16">
          <p className="text-emerald-400 font-mono text-sm tracking-widest mb-4 uppercase">
            The Solution
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Just type what you <span className="text-emerald-400">remember</span>.
          </h2>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            fzf doesn't need exact matches. Type fragments. Type abbreviations.
            Type what <em>feels</em> right. It figures out the rest.
          </p>
        </div>

        <FzfDemo showScoring={false} />

        <p className="text-center text-neutral-500 mt-8">
          ↑ This is a real fuzzy finder. Try it.
        </p>
      </Section>

      {/* grep vs fzf */}
      <Section dark>
        <div className="text-center mb-16">
          <p className="text-blue-400 font-mono text-sm tracking-widest mb-4 uppercase">
            The Difference
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            grep thinks in <span className="text-red-400">substrings</span>.<br />
            fzf thinks in <span className="text-emerald-400">sequences</span>.
          </h2>
        </div>

        <FzfComparison />
      </Section>

      {/* How it works */}
      <Section>
        <div className="text-center mb-16">
          <p className="text-amber-400 font-mono text-sm tracking-widest mb-4 uppercase">
            Under The Hood
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            It's not magic.<br />
            It's <span className="text-amber-400">scoring</span>.
          </h2>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            fzf assigns points: consecutive matches, word boundaries,
            path depth, exact case. The best matches bubble up.
          </p>
        </div>

        <FzfAlgorithmViz />
      </Section>

      {/* Your Shell, Transformed */}
      <Section dark>
        <div className="text-center mb-16">
          <p className="text-purple-400 font-mono text-sm tracking-widest mb-4 uppercase">
            Beyond Files
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            fzf transforms your <span className="text-purple-400">entire shell</span>.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {[
            {
              keys: 'Ctrl + R',
              title: 'History Search',
              desc: 'Fuzzy search your command history. Find that docker command from 3 weeks ago.',
              color: 'emerald'
            },
            {
              keys: 'Ctrl + T',
              title: 'File Picker',
              desc: 'Insert file paths into any command. No more tab-completing through directories.',
              color: 'blue'
            },
            {
              keys: 'Alt + C',
              title: 'Directory Jump',
              desc: 'cd with fuzzy matching. Type "proj" to jump to ~/work/projects/client.',
              color: 'amber'
            },
            {
              keys: '**<tab>',
              title: 'Completion',
              desc: 'kill **<tab> to fuzzy-find processes. ssh **<tab> for hosts. Works everywhere.',
              color: 'purple'
            },
          ].map(({ keys, title, desc, color }) => (
            <div
              key={keys}
              className="bg-neutral-800/50 rounded-lg p-5 border border-neutral-700"
            >
              <kbd className={`
                inline-block px-3 py-1.5 rounded text-sm font-mono font-bold mb-3
                ${color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : ''}
                ${color === 'blue' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : ''}
                ${color === 'amber' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : ''}
                ${color === 'purple' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : ''}
              `}>
                {keys}
              </kbd>
              <h3 className="text-lg font-bold text-neutral-200 mb-2">{title}</h3>
              <p className="text-neutral-400 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Preview Feature */}
      <Section>
        <div className="text-center mb-12">
          <p className="text-cyan-400 font-mono text-sm tracking-widest mb-4 uppercase">
            Level Up
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Preview files <span className="text-cyan-400">before you open them</span>.
          </h2>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            fzf can show you what's inside each file as you navigate.
            Syntax highlighting, line numbers, the works.
          </p>
        </div>

        {/* Screenshot */}
        <div className="max-w-4xl mx-auto mb-8">
          <img
            src="/fzf-preview.png"
            alt="fzf with preview panel showing syntax-highlighted code"
            className="w-full rounded-lg border border-neutral-700 shadow-2xl"
          />
        </div>

        {/* Command */}
        <div className="max-w-2xl mx-auto">
          <p className="text-neutral-400 text-center mb-4">
            Add this to your shell config for the full experience:
          </p>
          <div className="bg-neutral-950 rounded-lg border border-cyan-500/30 overflow-hidden">
            <div className="bg-cyan-500/10 px-4 py-2 border-b border-cyan-500/20 flex items-center justify-between">
              <span className="text-cyan-400 font-mono text-sm">~/.bashrc or ~/.zshrc</span>
              <button
                onClick={() => navigator.clipboard.writeText(`export FZF_DEFAULT_OPTS="--style full --preview 'fzf-preview.sh {}' --bind 'focus:transform-header:file --brief {}'"

# Or for a quick alias:
alias fzfp="fzf --style full --preview 'fzf-preview.sh {}' --bind 'focus:transform-header:file --brief {}'"
`)}
                className="text-neutral-500 hover:text-white transition-colors text-xs flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
            </div>
            <div className="p-4 font-mono text-sm overflow-x-auto">
              <div className="text-neutral-500 mb-2"># Set as default for all fzf invocations</div>
              <div className="text-neutral-300">
                <span className="text-emerald-400">export</span> FZF_DEFAULT_OPTS=<span className="text-amber-400">"--style full \</span>
              </div>
              <div className="text-amber-400 pl-4">
                --preview 'fzf-preview.sh {"{}"}' \
              </div>
              <div className="text-amber-400 pl-4">
                --bind 'focus:transform-header:file --brief {"{}"}'"
              </div>
              <div className="text-neutral-500 mt-4 mb-2"># Or create a quick alias</div>
              <div className="text-neutral-300">
                <span className="text-emerald-400">alias</span> fzfp=<span className="text-amber-400">"fzf --style full --preview 'fzf-preview.sh {"{}"}' --bind 'focus:transform-header:file --brief {"{}"}'"</span>
              </div>
            </div>
          </div>

          {/* What each flag does */}
          <div className="mt-6 grid sm:grid-cols-3 gap-3 text-sm">
            <div className="bg-neutral-800/50 rounded-lg p-3 border border-neutral-700">
              <code className="text-cyan-400">--style full</code>
              <p className="text-neutral-500 mt-1">Rounded borders, cleaner UI</p>
            </div>
            <div className="bg-neutral-800/50 rounded-lg p-3 border border-neutral-700">
              <code className="text-cyan-400">--preview</code>
              <p className="text-neutral-500 mt-1">Shows file contents with syntax highlighting</p>
            </div>
            <div className="bg-neutral-800/50 rounded-lg p-3 border border-neutral-700">
              <code className="text-cyan-400">--bind focus:...</code>
              <p className="text-neutral-500 mt-1">Updates header with file type info</p>
            </div>
          </div>

          {/* Optional bat install */}
          <div className="mt-8 bg-neutral-800/30 rounded-lg p-4 border border-neutral-700">
            <div className="flex items-start gap-3">
              <span className="text-purple-400 text-lg">💡</span>
              <div>
                <p className="text-neutral-300 font-medium mb-2">
                  Optional: Install <a href="https://github.com/sharkdp/bat" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">bat</a> for syntax highlighting
                </p>
                <div className="font-mono text-sm space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-neutral-500">macOS:</span>
                    <code className="text-emerald-400">brew install bat</code>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-neutral-500">Ubuntu/Debian:</span>
                    <code className="text-emerald-400">sudo apt install bat</code>
                    <span className="text-neutral-600 text-xs">(runs as <code className="text-neutral-500">batcat</code>)</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-neutral-500">Arch:</span>
                    <code className="text-emerald-400">sudo pacman -S bat</code>
                  </div>
                </div>
                <p className="text-neutral-500 text-sm mt-3">
                  On Ubuntu, add <code className="text-neutral-400">alias bat="batcat"</code> to your bashrc.
                  bat is also great on its own. It's <code className="text-neutral-400">cat</code> with syntax highlighting and line numbers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Install */}
      <Section>
        <div className="text-center">
          <p className="text-emerald-400 font-mono text-sm tracking-widest mb-4 uppercase">
            Get It
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            One command. <span className="text-emerald-400">Done.</span>
          </h2>
          <p className="text-neutral-400 mb-12 max-w-lg mx-auto">
            The git install is recommended. It includes key bindings, completions, and auto-updates.
          </p>

          {/* Recommended: Git install */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-emerald-400 text-sm font-bold uppercase tracking-wider">Recommended</span>
              <span className="text-neutral-600 text-sm">— works everywhere</span>
            </div>
            <div className="bg-neutral-950 rounded-lg border border-emerald-500/30 overflow-hidden">
              <div className="bg-emerald-500/10 px-4 py-2 border-b border-emerald-500/20">
                <span className="text-emerald-400 font-mono text-sm">Linux / macOS / WSL</span>
              </div>
              <div className="p-4 font-mono text-sm space-y-2">
                <div className="flex items-center justify-between group">
                  <code className="text-neutral-300">git clone --depth 1 https://github.com/junegunn/fzf.git ~/.fzf</code>
                  <button
                    onClick={() => navigator.clipboard.writeText('git clone --depth 1 https://github.com/junegunn/fzf.git ~/.fzf')}
                    className="text-neutral-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 ml-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center justify-between group">
                  <code className="text-neutral-300">~/.fzf/install</code>
                  <button
                    onClick={() => navigator.clipboard.writeText('~/.fzf/install')}
                    className="text-neutral-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 ml-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="bg-neutral-900 px-4 py-3 border-t border-neutral-800 text-sm text-neutral-500">
                Say <span className="text-emerald-400">yes</span> to all prompts. Then <code className="text-neutral-400">source ~/.bashrc</code> or restart your shell.
              </div>
            </div>
          </div>

          {/* Alternative: Package managers */}
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-neutral-500 text-sm font-bold uppercase tracking-wider">Alternatives</span>
              <span className="text-neutral-600 text-sm">— if you prefer package managers</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: 'macOS', cmd: 'brew install fzf && $(brew --prefix)/opt/fzf/install', note: 'Full install with Homebrew' },
                { label: 'Arch', cmd: 'sudo pacman -S fzf', note: 'Includes key bindings' },
                { label: 'Windows', cmd: 'winget install fzf', note: 'Or choco install fzf' },
              ].map(({ label, cmd, note }) => (
                <div
                  key={label}
                  className="bg-neutral-800/50 rounded-lg p-3 border border-neutral-700 group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-neutral-400 text-sm font-medium">{label}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(cmd)}
                      className="text-neutral-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                  <code className="text-emerald-400 font-mono text-xs break-all">{cmd}</code>
                  <div className="text-neutral-600 text-xs mt-1">{note}</div>
                </div>
              ))}
            </div>

            {/* Warning about apt */}
            <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-left">
              <div className="flex items-start gap-2">
                <span className="text-amber-400 text-lg">⚠</span>
                <div className="text-sm">
                  <span className="text-amber-400 font-medium">Avoid apt install fzf on Ubuntu/Debian</span>
                  <p className="text-neutral-400 mt-1">
                    The apt package is stripped down. It's missing key bindings and shell integration.
                    Use the git install instead.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Further Reading */}
      <Section dark>
        <div className="text-center mb-12">
          <p className="text-neutral-400 font-mono text-sm tracking-widest mb-4 uppercase">
            Go Deeper
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            This is just the beginning.
          </h2>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            fzf can be wired up to almost anything. Git branches, docker containers,
            SSH hosts, Kubernetes pods, npm scripts. If it's a list, fzf can search it.
          </p>
        </div>

        <div className="max-w-2xl mx-auto grid gap-4">
          {[
            {
              title: 'Community Examples Wiki',
              description: 'Hundreds of ready-to-use snippets: git workflows, process killers, docker helpers, and more.',
              url: 'https://github.com/junegunn/fzf/wiki/examples',
              icon: '📚',
              highlight: true
            },
            {
              title: 'Git Integration Examples',
              description: 'Fuzzy checkout branches, search commits, interactive rebase, stash management.',
              url: 'https://github.com/junegunn/fzf/wiki/examples#git',
              icon: '🔀'
            },
            {
              title: 'Official Documentation',
              description: 'Full reference for all options, key bindings, and advanced features.',
              url: 'https://github.com/junegunn/fzf#readme',
              icon: '📖'
            },
            {
              title: 'fzf-tab (Zsh)',
              description: 'Replace Zsh\'s default completion with fzf. Game changer for Zsh users.',
              url: 'https://github.com/Aloxaf/fzf-tab',
              icon: '⚡'
            },
          ].map(({ title, description, url, icon, highlight }) => (
            <a
              key={title}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                flex items-start gap-4 p-4 rounded-lg border transition-all
                hover:scale-[1.02] hover:bg-neutral-800/50
                ${highlight
                  ? 'bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/50'
                  : 'bg-neutral-800/30 border-neutral-700 hover:border-neutral-600'
                }
              `}
            >
              <span className="text-2xl">{icon}</span>
              <div>
                <h3 className={`font-semibold mb-1 ${highlight ? 'text-emerald-400' : 'text-neutral-200'}`}>
                  {title}
                  <svg className="w-4 h-4 inline ml-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </h3>
                <p className="text-neutral-400 text-sm">{description}</p>
              </div>
            </a>
          ))}
        </div>
      </Section>

      {/* Closing */}
      <section className="min-h-[50vh] flex items-center justify-center px-6 py-24 bg-neutral-950">
        <div className="text-center">
          <p className="text-2xl md:text-3xl text-neutral-400 max-w-2xl mx-auto mb-8">
            Some tools make you <span className="text-neutral-200">slightly more efficient</span>.<br />
            fzf makes you feel like you have <span className="text-emerald-400">superpowers</span>.
          </p>

          <a
            href="https://github.com/junegunn/fzf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-900 font-bold px-6 py-3 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
            </svg>
            View on GitHub
          </a>

          <p className="text-neutral-600 mt-12 text-sm">
            Part of <a href="/" className="text-neutral-500 hover:text-neutral-300">INFINITE LOOP</a> — Tools You Should Know series
          </p>
        </div>
      </section>
    </div>
  );
}
