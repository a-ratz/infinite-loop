// A scripted Atlas session for the page's replay. Nothing here ran against a live agent.
//
// What follows the public repo a-ratz/atlas (v0.6.1):
// - the three workflows and their order: atlas-learn -> atlas-distill -> atlas-map
//   (skills/atlas/app/.agents/skills/*/SKILL.md)
// - the note formats: capture frontmatter and sections, insight frontmatter (description, category,
//   confidence, source, topics), map layout ("# <Theme> map", sub-themes, open questions)
// - the commands and what they print: wait, say, say --progress, commit, check, next
//   (skills/atlas/app/engine/atlas.py: cmd_wait, cmd_say, cmd_commit, cmd_check, cmd_next, suggestions)
// - the inbox record the browser appends (chat_post) and the "Your move" labels (vault/atlas.yaml)
// - the reader's trust strings (engine/static/app.js: epistemic, trustPanel)
//
// Made up for this page: the topic, the note texts and the commit hashes.

export const CAPTURE_STEM = "2026-10-13-longitude-at-sea";

const CAPTURE_PATH = `captures/${CAPTURE_STEM}.md`;
const SOURCE_PATH = `sources/${CAPTURE_STEM}.md`;

export const NOTES = {
  capture: {
    kind: "capture",
    path: CAPTURE_PATH,
    movedTo: SOURCE_PATH,
    stem: CAPTURE_STEM,
    short: "the capture",
    title: "Ships found longitude by comparing local time with the time at a reference meridian",
    question: "How did ships find their longitude at sea?",
    front: [
      ["kind", "research"],
      ["source_type", "research"],
      ["question", '"How did ships find their longitude at sea?"'],
      ["date", "2026-10-13"],
      ["sources", "[4 entries]"],
      ["authors", "[Nevil Maskelyne, Dava Sobel]"],
      ["orgs", "[Royal Museums Greenwich]"],
    ],
    body: [
      { h: "Answer" },
      {
        p: "Longitude is a difference in time. The Earth turns 15 degrees an hour, so a navigator who knows both the local time and the time at a reference meridian knows how far east or west the ship is. Local time came from the Sun. The reference time was the hard part. By the 1760s there were two ways to get it: carry it in a marine clock, or read it from the Moon with printed tables.",
      },
      { h: "Findings" },
      {
        li: [
          "The Longitude Act of 1714 offered £10,000 for a method good to one degree, £15,000 for two-thirds of a degree and £20,000 for half a degree. (Longitude Act 1714, primary)",
          "John Harrison's sea watch H4 kept time within the Act's limit on the 1761–62 trial voyage to Jamaica. (Royal Museums Greenwich; Sobel, secondary)",
          "The Nautical Almanac, first issued for 1767, printed lunar distances in advance so navigators could work the method at sea. (Nautical Almanac for 1767, primary)",
          "Early chronometers were handmade and expensive; lunar distances stayed in use for decades. (Sobel, secondary)",
        ],
      },
      { h: "Contested or uncertain" },
      {
        li: [
          "The Board of Longitude did not accept the Jamaica result alone and asked for a second trial, to Barbados in 1764.",
          "No source here gives chronometer prices, so the cost argument rests on secondary accounts.",
        ],
      },
      { h: "Insight candidates" },
      {
        ol: [
          "Finding longitude comes down to knowing the time at a reference meridian (proven)",
          "The 1714 Act tied its prize to accuracy (proven)",
          "H4 met the Act's test at sea (working)",
          "Lunar distances read the reference time from the sky (proven)",
          "Lunar distances outlasted H4 because chronometers cost too much to carry in numbers (speculative)",
        ],
      },
      { h: "Open questions" },
      { li: ["How did a ship check its chronometer during a long voyage?"] },
    ],
  },

  clock: {
    kind: "insight",
    path: "insights/longitude-is-a-clock-problem.md",
    stem: "longitude-is-a-clock-problem",
    short: "a clock problem",
    title: "Finding longitude at sea comes down to knowing the time at a reference meridian",
    description: "The Earth turns 15 degrees an hour, so the gap between local time and reference time gives the ship's longitude.",
    category: "navigation",
    confidence: "proven",
    body: [
      {
        p: "Local noon is easy to observe at sea: it is the moment the Sun stands highest. If the navigator also knows the time at a reference meridian, each hour of difference is 15 degrees of longitude, east or west of it.",
      },
      {
        p: "Latitude needs no clock, because the height of the Sun at noon or of the Pole Star gives it. Longitude needs one, which is why it stayed unsolved at sea long after latitude was routine.",
      },
      {
        quote:
          "The Earth turns 15 degrees an hour, so a navigator who knows both the local time and the time at a reference meridian knows how far east or west the ship is.",
      },
    ],
    related: [],
  },

  act: {
    kind: "insight",
    path: "insights/the-longitude-act-priced-accuracy.md",
    stem: "the-longitude-act-priced-accuracy",
    short: "the 1714 prize",
    title: "The Longitude Act of 1714 tied its prize to accuracy, up to £20,000 for half a degree",
    description: "£10,000 for one degree, £15,000 for two-thirds, £20,000 for half, shown on a voyage to the West Indies.",
    category: "navigation",
    confidence: "proven",
    body: [
      {
        p: "Parliament paid for a result on a trial voyage from Britain to the West Indies, and the sum rose as the error fell: £10,000 for one degree, £15,000 for two-thirds of a degree, £20,000 for half a degree.",
      },
      {
        p: "Half a degree is 30 nautical miles at the equator. For a clock it means two minutes of error over the whole voyage.",
      },
      {
        quote:
          "The Longitude Act of 1714 offered £10,000 for a method good to one degree, £15,000 for two-thirds of a degree and £20,000 for half a degree.",
      },
    ],
    related: [["clock", "why the error is counted in minutes of time"]],
  },

  h4: {
    kind: "insight",
    path: "insights/harrison-h4-kept-time-at-sea.md",
    stem: "harrison-h4-kept-time-at-sea",
    short: "H4 at sea",
    title: "Harrison's sea watch H4 kept reference time well enough at sea to meet the Act's test",
    description: "On the 1761–62 voyage to Jamaica its error stayed inside the Act's limit; the Board still asked for a second trial.",
    category: "navigation",
    confidence: "working",
    body: [
      {
        p: "John Harrison's first three marine clocks, H1 to H3, were large and heavy. H4, finished in 1759, is a watch. On the trial voyage to Jamaica in 1761–62 it kept time inside the Act's half-degree limit.",
      },
      {
        p: "The Board of Longitude did not take one voyage as proof and sent H4 on a second trial, to Barbados in 1764. The watch had done its part; the dispute was about proof and payment.",
      },
      {
        quote: "John Harrison's sea watch H4 kept time within the Act's limit on the 1761–62 trial voyage to Jamaica.",
      },
    ],
    related: [
      ["clock", "carries the reference time on board"],
      ["act", "the test it met"],
    ],
  },

  lunar: {
    kind: "insight",
    path: "insights/lunar-distances-read-time-from-the-sky.md",
    stem: "lunar-distances-read-time-from-the-sky",
    short: "lunar distances",
    title: "The lunar distance method read reference time from the Moon's position against the stars",
    description: "Maskelyne's Nautical Almanac, first issued for 1767, printed the distances in advance, so no marine clock was needed.",
    category: "navigation",
    confidence: "proven",
    body: [
      {
        p: "The Moon moves against the stars by about its own width every hour. Measure its angle to a bright star with a sextant, look the angle up in a table, and you have the time at the reference meridian.",
      },
      {
        p: "Working those angles out on board was slow. Nevil Maskelyne's Nautical Almanac printed them in advance, starting with the edition for 1767. With the tables, a ship needed a sextant and arithmetic instead of a marine clock.",
      },
      {
        quote:
          "The Nautical Almanac, first issued for 1767, printed lunar distances in advance so navigators could work the method at sea.",
      },
    ],
    related: [["clock", "reads the reference time instead of carrying it"]],
  },

  cost: {
    kind: "insight",
    path: "insights/lunar-distances-outlasted-h4-on-cost.md",
    stem: "lunar-distances-outlasted-h4-on-cost",
    short: "why both lasted",
    title: "Lunar distances stayed in use for decades after H4 because chronometers cost too much to carry in numbers",
    description: "An inference from secondary accounts. The capture has no price data, so it stays speculative.",
    category: "navigation",
    confidence: "speculative",
    body: [
      {
        p: "H4 showed that a clock could do the job. A ship with one clock cannot tell when it drifts, though, and early chronometers were handmade and expensive. Lunar distances needed a sextant, tables and arithmetic, and a navigator could use them to check a clock.",
      },
      {
        p: "This note rests on secondary accounts. The capture checked no prices, so the note stays speculative until a source with figures backs it or contradicts it.",
      },
      { quote: "Early chronometers were handmade and expensive; lunar distances stayed in use for decades." },
    ],
    related: [
      ["h4", "the clock that worked"],
      ["lunar", "the method that stayed"],
    ],
  },

  map: {
    kind: "map",
    path: "insights/longitude-map.md",
    stem: "longitude-map",
    short: "longitude map",
    title: "Longitude map",
    description: "How ships found longitude: the problem, the prize, two methods, and why both stayed in use.",
    body: [
      {
        p: "Longitude at sea was a timekeeping problem. By the 1760s it had two answers, a clock on board and printed tables for the Moon, and ships used both for decades.",
      },
      { h: "The problem" },
      {
        links: [
          ["clock", "why a clock settles it"],
          ["act", "the test every method had to pass"],
        ],
      },
      { h: "Two answers" },
      {
        links: [
          ["h4", "carry the reference time on board"],
          ["lunar", "read it from the sky"],
        ],
      },
      { h: "Why both lasted" },
      { links: [["cost", "cost, in one speculative note"]] },
      { h: "Open questions" },
      { li: ["How did a ship check its chronometer during a long voyage?"] },
    ],
  },
};

export const INSIGHTS = ["clock", "act", "h4", "lunar", "cost"];

// Links between notes, as the vault's wikilinks make them.
export const LINKS = [
  ["act", "clock"],
  ["h4", "clock"],
  ["h4", "act"],
  ["lunar", "clock"],
  ["cost", "h4"],
  ["cost", "lunar"],
];

// Node positions for the vault graph, one layout per width.
export const LAYOUT = {
  wide: {
    w: 640,
    h: 360,
    at: {
      capture: [92, 182],
      clock: [292, 78],
      act: [500, 58],
      h4: [560, 196],
      lunar: [258, 290],
      cost: [470, 300],
      map: [392, 182],
    },
  },
  narrow: {
    w: 360,
    h: 430,
    at: {
      capture: [70, 62],
      clock: [196, 122],
      act: [300, 58],
      h4: [298, 248],
      lunar: [74, 262],
      cost: [196, 372],
      map: [190, 232],
    },
  },
};

const PROMPT = "/learn How did ships find their longitude at sea?";
const DISTILL = "Distill this capture into insights"; // vault/atlas.yaml, capture moves
const MAP_CHOICE = "Build a map of the five longitude insights";

export const COMPOSER_TEXT = PROMPT;

export const BOOT_LINES = [
  { k: "note", text: "# atlas = uv run --no-project engine/atlas.py" },
  { k: "cmd", text: "atlas serve --operator          # background task" },
  {
    k: "out",
    text: '{"atlas": "started", "mode": "operator", "url": "http://localhost:8765", "entities": 3, "index_seconds": 0.0}',
  },
  { k: "cmd", text: "atlas wait --agent claude       # background task: its exit wakes the agent" },
];

export const BOOT_FILES = ["atlas.yaml", "agents/claude.md"];

const nextOut = (counts, next) =>
  `{\n  "counts": ${JSON.stringify(counts).replace(/,/g, ", ").replace(/:/g, ": ")},\n  "next": ${
    next.length ? `[\n    ${JSON.stringify(next[0])}\n  ]` : "[]"
  }\n}`;

export const ACTS = [
  {
    id: "learn",
    label: "Learn",
    hint: "Send the question",
    events: [
      { t: "user", text: PROMPT, via: "command", ms: 300 },
      { t: "progress", text: "Scope: how navigators found longitude at sea, 1714 to about 1800", ms: 1100 },
      { t: "progress", text: "Reading the Longitude Act, the first Nautical Almanac and two histories", ms: 1500 },
      { t: "progress", text: "Writing the capture with graded sources", ms: 1400 },
      { t: "write", id: "capture", ms: 900 },
      {
        t: "commit",
        msg: "learn: longitude-at-sea",
        paths: [`vault/${CAPTURE_PATH}`],
        out: "committed 4e1b7a2 as claude: 1 path(s)",
        ids: ["capture"],
        ms: 900,
      },
      {
        t: "say",
        open: "capture",
        text: "Done: ships found longitude by comparing local time with the time at a reference meridian.",
        block: ["```atlas:note", CAPTURE_PATH, "```"],
        card: "capture",
        ms: 900,
      },
      {
        t: "sh",
        cmd: "atlas next",
        out: nextOut({ capture: 1, group: 2, agent: 1 }, [
          "1 capture(s) waiting: offer to distill them into insights (skill atlas-distill)",
        ]),
        ms: 800,
      },
      { t: "wait", ms: 500 },
    ],
  },
  {
    id: "distill",
    label: "Distill",
    hint: "Press Distill on the capture",
    events: [
      { t: "user", text: DISTILL, via: "move", viewing: CAPTURE_PATH, ms: 300 },
      { t: "progress", text: "Reading the capture: five insight candidates", ms: 1000 },
      { t: "progress", text: "Checking each figure against its source", ms: 1400 },
      { t: "progress", text: "No duplicates in insights/. Writing five notes, one claim each", ms: 1300 },
      { t: "write", id: "clock", ms: 800 },
      { t: "write", id: "act", ms: 650 },
      { t: "write", id: "h4", ms: 650 },
      { t: "write", id: "lunar", ms: 650 },
      { t: "write", id: "cost", ms: 650 },
      { t: "move", id: "capture", ms: 900 },
      { t: "progress", text: "atlas.py check: all checks pass", cmd: "atlas check", out: "all checks pass", ms: 900 },
      {
        t: "commit",
        msg: "distill: longitude-at-sea",
        paths: ["vault/insights", "vault/captures", "vault/sources"],
        out: "committed 9c03d5e as claude: 3 path(s)",
        ids: INSIGHTS,
        ms: 900,
      },
      {
        t: "sh",
        cmd: "atlas next",
        out: nextOut({ insight: 5, source: 1, group: 2, agent: 1 }, [
          "5 insight(s) belong to no map: offer to build the first map(s) (skill atlas-map)",
        ]),
        ms: 800,
      },
      {
        t: "say",
        text: "Five insights from the capture. The cost note stays speculative: no source gives prices. The capture moved to sources/.",
        block: [
          "```atlas:notes",
          ...INSIGHTS.map((id) => `- ${NOTES[id].path}`),
          "```",
          "```atlas:choices",
          "title: What next?",
          "options:",
          `  - ${MAP_CHOICE}`,
          "  - Research how ships checked a chronometer at sea",
          "```",
        ],
        list: INSIGHTS,
        choices: [
          { label: MAP_CHOICE, act: 2 },
          { label: "Research how ships checked a chronometer at sea" },
        ],
        ms: 900,
      },
      { t: "wait", ms: 500 },
    ],
  },
  {
    id: "map",
    label: "Map",
    hint: "Choose the map",
    events: [
      { t: "user", text: MAP_CHOICE, via: "choice", ms: 300 },
      { t: "progress", text: "Grouping five insights: the problem, two answers, why both lasted", ms: 1200 },
      { t: "write", id: "map", ms: 1100 },
      { t: "edit", ids: INSIGHTS, ms: 900 },
      { t: "progress", text: "atlas.py check: all checks pass", cmd: "atlas check", out: "all checks pass", ms: 900 },
      {
        t: "commit",
        msg: "map: longitude",
        paths: ["vault/insights"],
        out: "committed 2d7f810 as claude: 1 path(s)",
        ids: ["map", ...INSIGHTS],
        ms: 900,
      },
      {
        t: "say",
        open: "map",
        text: "The longitude map groups all five insights. The graph shows it as a hub now.",
        block: ["```atlas:note", "insights/longitude-map.md", "```"],
        card: "map",
        ms: 900,
      },
      { t: "sh", cmd: "atlas next", out: nextOut({ insight: 5, map: 1, source: 1, group: 2, agent: 1 }, []), ms: 800 },
      { t: "wait", ms: 500 },
    ],
  },
];
