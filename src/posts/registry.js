// Post registry - add new posts here
import TheStack from "./2025-12-01-the-stack";
import Fzf from "./2025-12-07-fzf";
import Loops from "./2026-10-13-loops";
import FiftyOneHours from "./2026-10-13-fifty-one-hours";
import GetItGreen from "./2026-10-26-get-it-green";

export const posts = [
    {
        slug: "get-it-green",
        title: "Get It Green",
        description:
            "Play the agent with a red test. Each slide adds one control, and you see which ways to green it closes and which it leaves open.",
        date: "2026-10-26",
        type: "interactive",
        color: "#56ffd0",
        series: "NSP",
        seriesFull: "New Software Primitives",
        part: "Loops 3/3",
        component: GetItGreen,
    },
    {
        slug: "fifty-one-hours",
        title: "Fifty-One Hours",
        description:
            "A flight recorder for a 51-hour autonomous coding loop: 88 merged pull requests, 123 human messages, and the checks that made it safe to stop watching.",
        date: "2026-10-13",
        type: "interactive essay",
        color: "#56ffd0",
        series: "NSP",
        seriesFull: "New Software Primitives",
        part: "Loops 1/3",
        component: FiftyOneHours,
    },
    {
        slug: "loops",
        title: "Who Decides Done?",
        description:
            "The four moves an agent loop makes after every attempt, and why the model never accepts its own work. Includes a bench to try it.",
        date: "2026-10-13",
        type: "interactive essay",
        color: "#56ffd0",
        series: "NSP",
        seriesFull: "New Software Primitives",
        part: "Loops 2/3",
        component: Loops,
    },
    {
        slug: "fzf",
        title: "fzf",
        description:
            "The fuzzy finder that will change how you navigate your entire computer. First entry of the Tools You Should Know series.",
        date: "2025-12-07",
        type: "interactive",
        color: "#10b981",
        series: "TYSK",
        seriesFull: "Tools You Should Know",
        component: Fzf,
    },
    {
        slug: "the-stack",
        title: "The Stack",
        description:
            "An opinionated guide to developer tools for 2025-2026. Merit over market share, best-in-class over biggest-in-market.",
        date: "2025-12-01",
        type: "interactive",
        color: "#6366f1",
        component: TheStack,
    },
    // Future posts go here:
    // {
    //   slug: 'why-vue',
    //   title: 'Why I Chose Vue',
    //   description: 'A component that progressively breaks as you add React patterns.',
    //   date: '2025-12-02',
    //   type: 'demo',
    //   color: '#22c55e',
    //   component: WhyVue
    // },
];

// Old slugs that now point to a newer post.
export const redirects = { loopwright: "loops", "honest-loop": "loops" };
