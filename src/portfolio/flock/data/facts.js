// Facts for the Flock page, checked on 13 October 2026.
//
// Sources:
// - commits:  GET repos/whiteducksoftware/flock/commits?per_page=1 -> Link rel="last" is page 2070,
//             so main holds 2,070 commits. The first one ("Initial commit", 2025-02-06) is by a-ratz.
// - mine:     GET repos/whiteducksoftware/flock/contributors?anon=1 -> a-ratz: 1608, plus 181 under
//             the unlinked author name "Andre Ratzenberger" (180 + 1) = 1,789.
// - stars:    GET repos/whiteducksoftware/flock -> stargazers_count: 121, license MIT.
// - release:  GET repos/whiteducksoftware/flock/releases/latest -> 0.5.700, published 2026-10-06;
//             PyPI flock-core info.version is 0.5.700 as well.
// - tests:    README.md, "Status and roadmap": "about 2,800 tests".
// - snippets: README.md and src/flock at commit 11d8398 (2026-10-12).

export const REPO = "https://github.com/whiteducksoftware/flock";
export const PYPI = "https://pypi.org/project/flock-core/";
export const DOCS = "https://whiteducksoftware.github.io/flock/";
export const RELEASE = "https://github.com/whiteducksoftware/flock/releases/tag/0.5.700";
export const ROADMAP = "https://github.com/whiteducksoftware/flock/blob/main/ROADMAP.md";

export const FACTS = [
  { value: "1,789", unit: "of 2,070", label: "commits on main are mine, starting with the first", href: `${REPO}/graphs/contributors` },
  { value: "121", unit: "stars", label: "on GitHub, MIT license", href: REPO },
  { value: "0.5.700", unit: "6 Oct 2026", label: "latest release, adds Microsoft Foundry hosted agents", href: RELEASE },
  { value: "~2,800", unit: "tests", label: "in the repository, per the README", href: `${REPO}/tree/main/tests` },
];

export const CHECKED = "13 October 2026";
