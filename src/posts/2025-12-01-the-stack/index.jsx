import { useState, useEffect } from "react";
import { tools } from "./data";

const categories = [...new Set(tools.map((t) => t.category))];
const statuses = ["All", "Established", "Recommended", "Watch"];

const categoryColors = {
  Languages: {
    bg: "rgba(99, 102, 241, 0.15)",
    border: "#6366f1",
    text: "#a5b4fc",
  },
  Terminal: {
    bg: "rgba(34, 197, 94, 0.15)",
    border: "#22c55e",
    text: "#86efac",
  },
  IDE: { bg: "rgba(168, 85, 247, 0.15)", border: "#a855f7", text: "#d8b4fe" },
  "AI Tools": {
    bg: "rgba(236, 72, 153, 0.15)",
    border: "#ec4899",
    text: "#f9a8d4",
  },
  Infrastructure: {
    bg: "rgba(234, 179, 8, 0.15)",
    border: "#eab308",
    text: "#fde047",
  },
  Databases: {
    bg: "rgba(239, 68, 68, 0.15)",
    border: "#ef4444",
    text: "#fca5a5",
  },
  Cloud: { bg: "rgba(6, 182, 212, 0.15)", border: "#06b6d4", text: "#67e8f9" },
  Frontend: {
    bg: "rgba(59, 130, 246, 0.15)",
    border: "#3b82f6",
    text: "#93c5fd",
  },
  APIs: { bg: "rgba(156, 163, 175, 0.15)", border: "#9ca3af", text: "#d1d5db" },
  Observability: {
    bg: "rgba(180, 83, 9, 0.15)",
    border: "#b45309",
    text: "#fbbf24",
  },
  Security: {
    bg: "rgba(220, 38, 38, 0.15)",
    border: "#dc2626",
    text: "#f87171",
  },
  Testing: {
    bg: "rgba(139, 92, 246, 0.15)",
    border: "#8b5cf6",
    text: "#c4b5fd",
  },
  Docs: { bg: "rgba(107, 114, 128, 0.15)", border: "#6b7280", text: "#9ca3af" },
  "Up and Coming": {
    bg: "rgba(249, 115, 22, 0.15)",
    border: "#f97316",
    text: "#fdba74",
  },
  Hosting: {
    bg: "rgba(236, 72, 153, 0.15)",
    border: "#ec4899",
    text: "#f9a8d4",
  },
};

const statusIcons = {
  Established: "◆",
  Recommended: "●",
  Watch: "◐",
};

export default function DevStackShowcase() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTool, setExpandedTool] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredTools = tools.filter((tool) => {
    const matchesCategory =
      selectedCategory === "All" || tool.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "All" || tool.status === selectedStatus;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const groupedTools = filteredTools.reduce((acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = [];
    acc[tool.category].push(tool);
    return acc;
  }, {});

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%)",
        color: "#e4e4e7",
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        padding: "0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Noise overlay */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.03,
          pointerEvents: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Grid lines background */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
        `,
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <header
        style={{
          padding: "60px 40px 40px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          position: "relative",
          background:
            "linear-gradient(180deg, rgba(99, 102, 241, 0.05) 0%, transparent 100%)",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "16px",
              marginBottom: "12px",
            }}
          >
            <h1
              style={{
                fontSize: "48px",
                fontWeight: 700,
                margin: 0,
                letterSpacing: "-2px",
                background: "linear-gradient(135deg, #fff 0%, #a1a1aa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: '"Space Grotesk", system-ui, sans-serif',
              }}
            >
              THE STACK
            </h1>
            <span
              style={{
                fontSize: "14px",
                color: "#6366f1",
                fontWeight: 500,
                padding: "4px 12px",
                background: "rgba(99, 102, 241, 0.1)",
                borderRadius: "4px",
                border: "1px solid rgba(99, 102, 241, 0.3)",
              }}
            >
              2025-2026
            </span>
          </div>
          <p
            style={{
              fontSize: "18px",
              color: "#71717a",
              margin: 0,
              maxWidth: "600px",
              lineHeight: 1.6,
              fontFamily: '"Inter", system-ui, sans-serif',
            }}
          >
            Merit over market share. Best-in-class over biggest-in-market.
            <br />
            <span style={{ color: "#52525b" }}>
              Like choosing Claude over ChatGPT.
            </span>
          </p>
        </div>
      </header>

      {/* Filters */}
      <div
        style={{
          padding: "24px 40px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          position: "sticky",
          top: 0,
          background: "rgba(10, 10, 15, 0.9)",
          backdropFilter: "blur(20px)",
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            display: "flex",
            gap: "24px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* Search */}
          <div
            style={{
              position: "relative",
              flex: "1",
              minWidth: "200px",
              maxWidth: "300px",
            }}
          >
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px 12px 44px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px",
                color: "#e4e4e7",
                fontSize: "14px",
                fontFamily: "inherit",
                outline: "none",
                transition: "all 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#6366f1";
                e.target.style.background = "rgba(99, 102, 241, 0.05)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.08)";
                e.target.style.background = "rgba(255,255,255,0.03)";
              }}
            />
            <span
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#52525b",
                fontSize: "16px",
              }}
            >
              ⌕
            </span>
          </div>

          {/* Status filter */}
          <div style={{ display: "flex", gap: "8px" }}>
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                style={{
                  padding: "8px 16px",
                  background:
                    selectedStatus === status
                      ? "rgba(99, 102, 241, 0.2)"
                      : "rgba(255,255,255,0.03)",
                  border: `1px solid ${selectedStatus === status ? "#6366f1" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: "6px",
                  color: selectedStatus === status ? "#a5b4fc" : "#71717a",
                  fontSize: "13px",
                  fontFamily: "inherit",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {status !== "All" && (
                  <span style={{ fontSize: "10px" }}>
                    {statusIcons[status]}
                  </span>
                )}
                {status}
              </button>
            ))}
          </div>

          {/* Category pills - scrollable */}
          <div
            style={{
              display: "flex",
              gap: "6px",
              flexWrap: "wrap",
              flex: "1",
            }}
          >
            <button
              onClick={() => setSelectedCategory("All")}
              style={{
                padding: "6px 12px",
                background:
                  selectedCategory === "All"
                    ? "rgba(255,255,255,0.1)"
                    : "transparent",
                border: `1px solid ${selectedCategory === "All" ? "rgba(255,255,255,0.2)" : "transparent"}`,
                borderRadius: "4px",
                color: selectedCategory === "All" ? "#e4e4e7" : "#52525b",
                fontSize: "12px",
                fontFamily: "inherit",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "6px 12px",
                  background:
                    selectedCategory === cat
                      ? categoryColors[cat]?.bg
                      : "transparent",
                  border: `1px solid ${selectedCategory === cat ? categoryColors[cat]?.border : "transparent"}`,
                  borderRadius: "4px",
                  color:
                    selectedCategory === cat
                      ? categoryColors[cat]?.text
                      : "#52525b",
                  fontSize: "12px",
                  fontFamily: "inherit",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div
        style={{
          padding: "16px 40px",
          borderBottom: "1px solid rgba(255,255,255,0.03)",
          background: "rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            display: "flex",
            gap: "32px",
            fontSize: "13px",
            color: "#52525b",
          }}
        >
          <span>
            <strong style={{ color: "#a1a1aa" }}>{filteredTools.length}</strong>{" "}
            tools
          </span>
          <span>
            <strong style={{ color: "#22c55e" }}>
              {filteredTools.filter((t) => t.status === "Established").length}
            </strong>{" "}
            established
          </span>
          <span>
            <strong style={{ color: "#6366f1" }}>
              {filteredTools.filter((t) => t.status === "Recommended").length}
            </strong>{" "}
            recommended
          </span>
          <span>
            <strong style={{ color: "#f97316" }}>
              {filteredTools.filter((t) => t.status === "Watch").length}
            </strong>{" "}
            watching
          </span>
        </div>
      </div>

      {/* Main content */}
      <main
        style={{
          padding: "40px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {Object.entries(groupedTools).map(
          ([category, categoryTools], catIndex) => (
            <section
              key={category}
              style={{
                marginBottom: "48px",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(20px)",
                transition: `all 0.5s ease ${catIndex * 0.1}s`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                <h2
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    margin: 0,
                    color: categoryColors[category]?.text || "#a1a1aa",
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                  }}
                >
                  {category}
                </h2>
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    background: `linear-gradient(90deg, ${categoryColors[category]?.border || "#444"}44, transparent)`,
                  }}
                />
                <span
                  style={{
                    fontSize: "12px",
                    color: "#52525b",
                  }}
                >
                  {categoryTools.length}
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                  gap: "16px",
                }}
              >
                {categoryTools.map((tool, index) => (
                  <div
                    key={tool.name}
                    onClick={() =>
                      setExpandedTool(
                        expandedTool === tool.name ? null : tool.name,
                      )
                    }
                    style={{
                      padding: "20px",
                      background:
                        expandedTool === tool.name
                          ? "rgba(255,255,255,0.06)"
                          : "rgba(255,255,255,0.02)",
                      border: `1px solid ${
                        expandedTool === tool.name
                          ? categoryColors[category]?.border || "#444"
                          : "rgba(255,255,255,0.05)"
                      }`,
                      borderRadius: "12px",
                      cursor: "pointer",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      position: "relative",
                      overflow: "hidden",
                      opacity: mounted ? 1 : 0,
                      transform: mounted ? "translateY(0)" : "translateY(20px)",
                      transitionDelay: `${index * 0.05}s`,
                    }}
                    onMouseEnter={(e) => {
                      if (expandedTool !== tool.name) {
                        e.currentTarget.style.background =
                          "rgba(255,255,255,0.04)";
                        e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.1)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (expandedTool !== tool.name) {
                        e.currentTarget.style.background =
                          "rgba(255,255,255,0.02)";
                        e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.05)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }
                    }}
                  >
                    {/* Hot badge */}
                    {tool.hot && (
                      <div
                        style={{
                          position: "absolute",
                          top: "12px",
                          right: tool.link ? "70px" : "12px",
                          padding: "2px 8px",
                          background:
                            "linear-gradient(135deg, #f97316, #ea580c)",
                          borderRadius: "4px",
                          fontSize: "10px",
                          fontWeight: 700,
                          color: "#fff",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        HOT
                      </div>
                    )}

                    {/* Link button - top right */}
                    {tool.link && (
                      <a
                        href={tool.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: "absolute",
                          top: "12px",
                          right: "12px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "4px 10px",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "4px",
                          color: "#71717a",
                          fontSize: "11px",
                          fontFamily: '"JetBrains Mono", monospace',
                          textDecoration: "none",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            categoryColors[category]?.bg ||
                            "rgba(99, 102, 241, 0.15)";
                          e.currentTarget.style.borderColor =
                            categoryColors[category]?.border || "#6366f1";
                          e.currentTarget.style.color =
                            categoryColors[category]?.text || "#a5b4fc";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "rgba(255,255,255,0.05)";
                          e.currentTarget.style.borderColor =
                            "rgba(255,255,255,0.1)";
                          e.currentTarget.style.color = "#71717a";
                        }}
                      >
                        <span>↗</span>
                        <span>Visit</span>
                      </a>
                    )}

                    {/* Header */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                        marginBottom: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          background:
                            categoryColors[category]?.bg ||
                            "rgba(255,255,255,0.1)",
                          border: `1px solid ${categoryColors[category]?.border || "#444"}33`,
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                          color: categoryColors[category]?.text || "#a1a1aa",
                          flexShrink: 0,
                        }}
                      >
                        {tool.name.charAt(0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3
                          style={{
                            fontSize: "16px",
                            fontWeight: 600,
                            margin: "0 0 4px 0",
                            color: "#f4f4f5",
                            fontFamily: '"Inter", system-ui, sans-serif',
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            paddingRight: tool.hot ? "50px" : "0",
                          }}
                        >
                          {tool.name}
                        </h3>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "11px",
                              color:
                                tool.status === "Established"
                                  ? "#22c55e"
                                  : tool.status === "Recommended"
                                    ? "#6366f1"
                                    : "#f97316",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <span style={{ fontSize: "8px" }}>
                              {statusIcons[tool.status]}
                            </span>
                            {tool.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#a1a1aa",
                        margin: 0,
                        lineHeight: 1.6,
                        fontFamily: '"Inter", system-ui, sans-serif',
                      }}
                    >
                      {tool.description}
                    </p>

                    {/* Expanded content */}
                    <div
                      style={{
                        maxHeight: expandedTool === tool.name ? "200px" : "0",
                        overflow: "hidden",
                        transition: "all 0.3s ease",
                        opacity: expandedTool === tool.name ? 1 : 0,
                      }}
                    >
                      <div
                        style={{
                          marginTop: "16px",
                          paddingTop: "16px",
                          borderTop: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#52525b",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                            marginBottom: "8px",
                          }}
                        >
                          Why this?
                        </div>
                        <p
                          style={{
                            fontSize: "13px",
                            color: "#d4d4d8",
                            margin: 0,
                            lineHeight: 1.6,
                            fontFamily: '"Inter", system-ui, sans-serif',
                          }}
                        >
                          {tool.why}
                        </p>
                      </div>
                    </div>

                    {/* Expand indicator */}
                    <div
                      style={{
                        marginTop: "12px",
                        fontSize: "18px",
                        color: "#52525b",
                        textAlign: "center",
                        transform:
                          expandedTool === tool.name
                            ? "rotate(180deg)"
                            : "rotate(0)",
                        transition: "transform 0.3s ease",
                      }}
                    >
                      ⌄
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ),
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: "40px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "13px",
            color: "#52525b",
            margin: 0,
            fontFamily: '"Inter", system-ui, sans-serif',
          }}
        >
          Curated with intention. Built with Claude.{" "}
          <span style={{ color: "#6366f1" }}>December 2025</span>
        </p>
      </footer>
    </div>
  );
}
