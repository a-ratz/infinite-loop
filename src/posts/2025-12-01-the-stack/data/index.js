// Simple frontmatter parser (browser-compatible, no Node.js deps)
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { data: {}, content: content.trim() };
  }

  const frontmatterStr = match[1];
  const body = match[2];

  // Parse YAML-like frontmatter (simple key: value pairs)
  const data = {};
  for (const line of frontmatterStr.split("\n")) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();

    // Handle booleans
    if (value === "true") value = true;
    else if (value === "false") value = false;
    // Handle null/empty
    else if (value === "" || value === "null") value = null;

    data[key] = value;
  }

  return { data, content: body.trim() };
}

// Category folder name -> Display name mapping
const categoryDisplayNames = {
  languages: "Languages",
  terminal: "Terminal",
  ide: "IDE",
  "ai-tools": "AI Tools",
  infrastructure: "Infrastructure",
  databases: "Databases",
  cloud: "Cloud",
  frontend: "Frontend",
  apis: "APIs",
  observability: "Observability",
  security: "Security",
  testing: "Testing",
  docs: "Docs",
  hosting: "Hosting",
  "up-and-coming": "Up and Coming",
};

// Import all markdown files from category folders
const toolModules = import.meta.glob("./**/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

// Parse markdown files and build tools array
export const tools = Object.entries(toolModules).map(([path, content]) => {
  // Extract category from path: ./languages/vue-nuxt.md -> languages
  const pathParts = path.split("/");
  const categoryFolder = pathParts[1];
  const category = categoryDisplayNames[categoryFolder] || categoryFolder;

  // Parse frontmatter and content
  const { data, content: description } = parseFrontmatter(content);

  return {
    name: data.name,
    category,
    status: data.status,
    description: description.trim(),
    why: data.why,
    link: data.link || null,
    hot: data.hot === true || data.hot === "true",
  };
});

// Sort tools by category order (matches original order)
const categoryOrder = Object.values(categoryDisplayNames);
tools.sort((a, b) => {
  const aIndex = categoryOrder.indexOf(a.category);
  const bIndex = categoryOrder.indexOf(b.category);
  return aIndex - bIndex;
});

export default tools;
