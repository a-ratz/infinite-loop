import React, { useState, useMemo, useRef, useEffect } from 'react';

// Realistic file list - mix of real project structures
const SAMPLE_FILES = [
  'src/components/Button.tsx',
  'src/components/Modal.tsx',
  'src/components/Dropdown.tsx',
  'src/components/Tooltip.tsx',
  'src/components/Toast.tsx',
  'src/components/Table/index.tsx',
  'src/components/Table/TableRow.tsx',
  'src/components/Table/TableCell.tsx',
  'src/components/Form/Input.tsx',
  'src/components/Form/Select.tsx',
  'src/components/Form/Checkbox.tsx',
  'src/components/Form/RadioGroup.tsx',
  'src/hooks/useAuth.ts',
  'src/hooks/useLocalStorage.ts',
  'src/hooks/useDebounce.ts',
  'src/hooks/useFetch.ts',
  'src/hooks/useKeyboard.ts',
  'src/hooks/useClickOutside.ts',
  'src/utils/format.ts',
  'src/utils/validation.ts',
  'src/utils/api.ts',
  'src/utils/constants.ts',
  'src/utils/helpers.ts',
  'src/pages/Home.tsx',
  'src/pages/Dashboard.tsx',
  'src/pages/Settings.tsx',
  'src/pages/Profile.tsx',
  'src/pages/Login.tsx',
  'src/pages/NotFound.tsx',
  'src/pages/admin/Users.tsx',
  'src/pages/admin/Analytics.tsx',
  'src/pages/admin/Config.tsx',
  'src/store/index.ts',
  'src/store/slices/authSlice.ts',
  'src/store/slices/userSlice.ts',
  'src/store/slices/uiSlice.ts',
  'src/types/api.ts',
  'src/types/models.ts',
  'src/types/common.ts',
  'src/styles/globals.css',
  'src/styles/variables.css',
  'src/styles/components.css',
  'src/App.tsx',
  'src/main.tsx',
  'src/index.css',
  'package.json',
  'tsconfig.json',
  'vite.config.ts',
  'tailwind.config.js',
  'postcss.config.js',
  '.eslintrc.js',
  '.prettierrc',
  '.gitignore',
  'README.md',
  'CHANGELOG.md',
  'docker-compose.yml',
  'Dockerfile',
  '.env.example',
  '.env.local',
  'tests/setup.ts',
  'tests/utils.test.ts',
  'tests/components/Button.test.tsx',
  'tests/components/Modal.test.tsx',
  'tests/hooks/useAuth.test.ts',
  'tests/e2e/login.spec.ts',
  'tests/e2e/dashboard.spec.ts',
  'scripts/deploy.sh',
  'scripts/seed.ts',
  'scripts/migrate.ts',
  'docs/API.md',
  'docs/CONTRIBUTING.md',
  'docs/ARCHITECTURE.md',
];

/**
 * Fuzzy match algorithm inspired by fzf
 * Returns { score, matches } where matches is array of matched indices
 */
function fuzzyMatch(pattern, text) {
  if (!pattern) return { score: 0, matches: [] };

  const patternLower = pattern.toLowerCase();
  const textLower = text.toLowerCase();

  let patternIdx = 0;
  let matches = [];
  let score = 0;
  let prevMatchIdx = -1;
  let consecutive = 0;

  for (let i = 0; i < text.length && patternIdx < pattern.length; i++) {
    if (textLower[i] === patternLower[patternIdx]) {
      matches.push(i);

      // Scoring bonuses
      let charScore = 1;

      // Consecutive match bonus
      if (prevMatchIdx === i - 1) {
        consecutive++;
        charScore += consecutive * 2;
      } else {
        consecutive = 0;
      }

      // Start of word bonus
      if (i === 0 || text[i - 1] === '/' || text[i - 1] === '.' || text[i - 1] === '-' || text[i - 1] === '_') {
        charScore += 10;
      }

      // Uppercase in camelCase bonus
      if (text[i] === text[i].toUpperCase() && text[i] !== text[i].toLowerCase()) {
        charScore += 5;
      }

      // Exact case match bonus
      if (text[i] === pattern[patternIdx]) {
        charScore += 1;
      }

      score += charScore;
      prevMatchIdx = i;
      patternIdx++;
    }
  }

  // All pattern characters must match
  if (patternIdx !== pattern.length) {
    return { score: 0, matches: [] };
  }

  // Bonus for shorter strings (prefer more specific matches)
  score += Math.max(0, 50 - text.length);

  // Bonus for matches appearing earlier
  if (matches.length > 0) {
    score += Math.max(0, 20 - matches[0]);
  }

  return { score, matches };
}

/**
 * Renders text with highlighted matched characters
 */
function HighlightedText({ text, matches, highlightClass }) {
  if (!matches || matches.length === 0) {
    return <span>{text}</span>;
  }

  const matchSet = new Set(matches);
  const parts = [];
  let currentPart = '';
  let inMatch = false;

  for (let i = 0; i < text.length; i++) {
    const isMatch = matchSet.has(i);

    if (isMatch !== inMatch) {
      if (currentPart) {
        parts.push(
          <span key={i} className={inMatch ? highlightClass : undefined}>
            {currentPart}
          </span>
        );
      }
      currentPart = text[i];
      inMatch = isMatch;
    } else {
      currentPart += text[i];
    }
  }

  if (currentPart) {
    parts.push(
      <span key="last" className={inMatch ? highlightClass : undefined}>
        {currentPart}
      </span>
    );
  }

  return <>{parts}</>;
}

/**
 * Score breakdown visualization
 */
function ScoreBreakdown({ text, matches, score, pattern }) {
  if (!pattern || matches.length === 0) return null;

  return (
    <div className="text-xs opacity-60 mt-1 font-mono">
      <span className="text-emerald-400">score: {score}</span>
      <span className="mx-2 opacity-40">|</span>
      <span className="text-amber-400">matches: {matches.length}/{pattern.length}</span>
      <span className="mx-2 opacity-40">|</span>
      <span className="text-blue-400">positions: [{matches.join(', ')}]</span>
    </div>
  );
}

/**
 * Main FZF Demo Component
 */
export default function FzfDemo({
  showScoring = false,
  maxVisible = 12,
  files = SAMPLE_FILES
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Compute fuzzy matches
  const results = useMemo(() => {
    if (!query) {
      return files.map(file => ({ file, score: 0, matches: [] }));
    }

    return files
      .map(file => {
        const { score, matches } = fuzzyMatch(query, file);
        return { file, score, matches };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [query, files]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' || (e.key === 'n' && e.ctrlKey)) {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp' || (e.key === 'p' && e.ctrlKey)) {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [results.length]);

  // Scroll selected item into view (only after user interaction, not on mount)
  const hasInteracted = useRef(false);
  useEffect(() => {
    if (!hasInteracted.current) {
      hasInteracted.current = true;
      return;
    }
    if (listRef.current) {
      const selected = listRef.current.children[selectedIndex];
      if (selected) {
        selected.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const visibleResults = results.slice(0, maxVisible);
  const hiddenCount = results.length - maxVisible;

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Terminal window chrome */}
      <div className="rounded-lg overflow-hidden shadow-2xl border border-neutral-700">
        {/* Title bar */}
        <div className="bg-neutral-800 px-4 py-2 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="ml-2 text-neutral-400 text-sm font-mono">
            fzf — fuzzy finder
          </span>
        </div>

        {/* Terminal body */}
        <div className="bg-neutral-900 p-4 font-mono text-sm">
          {/* Input line */}
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-neutral-700">
            <span className="text-emerald-400 font-bold">&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to search..."
              className="flex-1 bg-transparent outline-none text-neutral-100 placeholder-neutral-600 caret-emerald-400"
            />
            <span className="text-neutral-500 text-xs">
              {results.length}/{files.length}
            </span>
          </div>

          {/* Results list */}
          <div
            ref={listRef}
            className="space-y-0.5 max-h-96 overflow-y-auto"
          >
            {visibleResults.map((result, index) => (
              <div
                key={result.file}
                className={`
                  px-2 py-1.5 rounded cursor-pointer transition-colors
                  ${index === selectedIndex
                    ? 'bg-emerald-500/20 border-l-2 border-emerald-400'
                    : 'hover:bg-neutral-800 border-l-2 border-transparent'
                  }
                `}
                onClick={() => setSelectedIndex(index)}
              >
                <div className="text-neutral-200">
                  <HighlightedText
                    text={result.file}
                    matches={result.matches}
                    highlightClass="text-emerald-400 font-bold"
                  />
                </div>
                {showScoring && (
                  <ScoreBreakdown
                    text={result.file}
                    matches={result.matches}
                    score={result.score}
                    pattern={query}
                  />
                )}
              </div>
            ))}

            {hiddenCount > 0 && (
              <div className="text-neutral-500 text-xs px-2 py-2">
                ... and {hiddenCount} more results
              </div>
            )}

            {query && results.length === 0 && (
              <div className="text-neutral-500 text-center py-8">
                No matches found
              </div>
            )}
          </div>

          {/* Footer hints */}
          <div className="mt-3 pt-3 border-t border-neutral-700 flex gap-4 text-xs text-neutral-500">
            <span><kbd className="px-1.5 py-0.5 bg-neutral-800 rounded">↑↓</kbd> navigate</span>
            <span><kbd className="px-1.5 py-0.5 bg-neutral-800 rounded">enter</kbd> select</span>
            <span><kbd className="px-1.5 py-0.5 bg-neutral-800 rounded">esc</kbd> cancel</span>
          </div>
        </div>
      </div>

      {/* Optional: Typing suggestions */}
      {!query && (
        <div className="mt-4 text-center text-neutral-500 text-sm">
          Try typing: <button onClick={() => setQuery('btn')} className="text-emerald-400 hover:underline">btn</button>
          {' · '}
          <button onClick={() => setQuery('hook')} className="text-emerald-400 hover:underline">hook</button>
          {' · '}
          <button onClick={() => setQuery('tscfg')} className="text-emerald-400 hover:underline">tscfg</button>
          {' · '}
          <button onClick={() => setQuery('useauth')} className="text-emerald-400 hover:underline">useauth</button>
        </div>
      )}
    </div>
  );
}

/**
 * Variant: Side-by-side comparison (grep vs fzf feeling)
 */
export function FzfComparison() {
  const [query, setQuery] = useState('');

  // Exact substring match (like grep)
  const grepResults = useMemo(() => {
    if (!query) return SAMPLE_FILES;
    return SAMPLE_FILES.filter(f =>
      f.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  // Fuzzy match
  const fzfResults = useMemo(() => {
    if (!query) return SAMPLE_FILES.map(f => ({ file: f, matches: [] }));
    return SAMPLE_FILES
      .map(file => {
        const { score, matches } = fuzzyMatch(query, file);
        return { file, score, matches };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(r => ({ file: r.file, matches: r.matches }));
  }, [query]);

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Shared input */}
      <div className="mb-6 max-w-md mx-auto">
        <div className="bg-neutral-800 rounded-lg px-4 py-3 flex items-center gap-3">
          <span className="text-neutral-400">Query:</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try 'btnts' or 'uauth'..."
            className="flex-1 bg-transparent outline-none text-neutral-100 font-mono"
          />
        </div>
      </div>

      {/* Side by side */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Grep side */}
        <div className="rounded-lg overflow-hidden border border-neutral-700">
          <div className="bg-red-500/10 border-b border-neutral-700 px-4 py-2">
            <span className="text-red-400 font-mono font-bold">grep</span>
            <span className="text-neutral-500 text-sm ml-2">exact substring</span>
          </div>
          <div className="bg-neutral-900 p-3 h-72 overflow-y-auto font-mono text-sm">
            {grepResults.length === 0 ? (
              <div className="text-neutral-500 text-center py-8">No matches</div>
            ) : (
              grepResults.slice(0, 10).map(file => (
                <div key={file} className="text-neutral-400 py-0.5">{file}</div>
              ))
            )}
            {grepResults.length > 10 && (
              <div className="text-neutral-600 text-xs mt-2">
                +{grepResults.length - 10} more
              </div>
            )}
          </div>
          <div className="bg-neutral-800 px-4 py-2 text-sm">
            <span className="text-red-400">{grepResults.length}</span>
            <span className="text-neutral-500"> results</span>
          </div>
        </div>

        {/* FZF side */}
        <div className="rounded-lg overflow-hidden border border-neutral-700">
          <div className="bg-emerald-500/10 border-b border-neutral-700 px-4 py-2">
            <span className="text-emerald-400 font-mono font-bold">fzf</span>
            <span className="text-neutral-500 text-sm ml-2">fuzzy + ranked</span>
          </div>
          <div className="bg-neutral-900 p-3 h-72 overflow-y-auto font-mono text-sm">
            {fzfResults.length === 0 ? (
              <div className="text-neutral-500 text-center py-8">No matches</div>
            ) : (
              fzfResults.slice(0, 10).map(({ file, matches }) => (
                <div key={file} className="text-neutral-400 py-0.5">
                  <HighlightedText
                    text={file}
                    matches={matches}
                    highlightClass="text-emerald-400 font-bold"
                  />
                </div>
              ))
            )}
            {fzfResults.length > 10 && (
              <div className="text-neutral-600 text-xs mt-2">
                +{fzfResults.length - 10} more
              </div>
            )}
          </div>
          <div className="bg-neutral-800 px-4 py-2 text-sm">
            <span className="text-emerald-400">{fzfResults.length}</span>
            <span className="text-neutral-500"> results</span>
          </div>
        </div>
      </div>

      {/* Explanation */}
      {query && query.length >= 2 && grepResults.length !== fzfResults.length && (
        <div className="mt-4 text-center text-sm text-neutral-400">
          <span className="text-amber-400">"{query}"</span> — grep needs exact "{query}" substring,
          fzf matches <span className="text-emerald-400">{query.split('').join(' → ')}</span> in sequence anywhere
        </div>
      )}
    </div>
  );
}

/**
 * Variant: Algorithm visualization
 */
export function FzfAlgorithmViz() {
  const [query, setQuery] = useState('btn');
  const [targetFile, setTargetFile] = useState('src/components/Button.tsx');

  const { score, matches } = useMemo(() =>
    fuzzyMatch(query, targetFile),
    [query, targetFile]
  );

  return (
    <div className="w-full max-w-2xl mx-auto bg-neutral-900 rounded-lg p-6 border border-neutral-700">
      <h3 className="text-neutral-300 text-lg mb-4 font-semibold">How fzf scores matches</h3>

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-neutral-500 text-sm block mb-1">Pattern</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-neutral-800 rounded px-3 py-2 text-emerald-400 font-mono outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="text-neutral-500 text-sm block mb-1">Target</label>
          <input
            type="text"
            value={targetFile}
            onChange={(e) => setTargetFile(e.target.value)}
            className="w-full bg-neutral-800 rounded px-3 py-2 text-neutral-300 font-mono outline-none focus:ring-1 focus:ring-neutral-500"
          />
        </div>
      </div>

      {/* Visualization */}
      <div className="bg-neutral-950 rounded-lg p-4 mb-4">
        <div className="font-mono text-2xl tracking-wider mb-4 flex flex-wrap">
          {targetFile.split('').map((char, i) => {
            const isMatch = matches.includes(i);
            const isBoundary = i === 0 || '/._-'.includes(targetFile[i - 1]);
            return (
              <span
                key={i}
                className={`
                  relative px-0.5 py-1 rounded transition-all
                  ${isMatch ? 'text-emerald-400 bg-emerald-400/20 font-bold scale-110' : 'text-neutral-500'}
                  ${isMatch && isBoundary ? 'ring-1 ring-amber-400/50' : ''}
                `}
              >
                {char}
                {isMatch && (
                  <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs text-emerald-500">
                    {matches.indexOf(i) + 1}
                  </span>
                )}
              </span>
            );
          })}
        </div>

        <div className="text-sm text-neutral-400 mt-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-4 h-4 rounded bg-emerald-400/20 border border-emerald-400" />
            <span>Matched character</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-4 h-4 rounded bg-emerald-400/20 ring-1 ring-amber-400/50" />
            <span>Word boundary bonus (+10 points)</span>
          </div>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-neutral-800 rounded-lg p-3">
          <div className="text-3xl font-bold text-emerald-400">{score}</div>
          <div className="text-neutral-500 text-sm">Total Score</div>
        </div>
        <div className="bg-neutral-800 rounded-lg p-3">
          <div className="text-3xl font-bold text-blue-400">{matches.length}</div>
          <div className="text-neutral-500 text-sm">Matches</div>
        </div>
        <div className="bg-neutral-800 rounded-lg p-3">
          <div className="text-3xl font-bold text-amber-400">
            {matches.length > 0 ? matches[0] : '-'}
          </div>
          <div className="text-neutral-500 text-sm">First Match Position</div>
        </div>
      </div>

      {matches.length === 0 && query && (
        <div className="mt-4 text-center text-red-400 text-sm">
          No match — pattern characters must appear in sequence
        </div>
      )}
    </div>
  );
}
