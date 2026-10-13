import { Link, useLocation } from "react-router-dom";
import { posts } from "../posts/registry";
import { useState, useEffect } from "react";
import PortfolioSection from "../components/PortfolioSection";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [hoveredPost, setHoveredPost] = useState(null);
  const { hash } = useLocation();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #0a0a0f 0%, #0f0f18 50%, #0a0a0f 100%)",
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

      {/* Grid background */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
          linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
        `,
          backgroundSize: "80px 80px",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <header
        style={{
          padding: "80px 40px 60px",
          maxWidth: "1200px",
          margin: "0 auto",
          position: "relative",
        }}
      >
        <div
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(48px, 10vw, 96px)",
              fontWeight: 700,
              margin: 0,
              letterSpacing: "-4px",
              fontFamily: '"Space Grotesk", system-ui, sans-serif',
              background: "linear-gradient(135deg, #fff 0%, #52525b 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1,
            }}
          >
            INFINITE LOOP
          </h1>
          <p
            style={{
              fontSize: "18px",
              color: "#52525b",
              marginTop: "16px",
              fontFamily: '"JetBrains Mono", monospace',
              letterSpacing: "-0.5px",
            }}
          >
            Interactive essays & explorable ideas
          </p>
        </div>
      </header>

      {/* Posts grid */}
      <main
        style={{
          padding: "0 40px 80px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "24px",
          }}
        >
          {posts.map((post, index) => (
            <Link
              key={post.slug}
              to={`/${post.slug}`}
              style={{
                display: "block",
                height: "100%",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(30px)",
                transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.1 + 0.2}s`,
              }}
              onMouseEnter={() => setHoveredPost(post.slug)}
              onMouseLeave={() => setHoveredPost(null)}
            >
              <article
                style={{
                  background:
                    hoveredPost === post.slug
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(255,255,255,0.02)",
                  border: `1px solid ${
                    hoveredPost === post.slug
                      ? post.color || "rgba(99, 102, 241, 0.5)"
                      : "rgba(255,255,255,0.06)"
                  }`,
                  borderRadius: "16px",
                  padding: "32px",
                  transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                  transform:
                    hoveredPost === post.slug
                      ? "translateY(-4px)"
                      : "translateY(0)",
                  position: "relative",
                  overflow: "hidden",
                  minHeight: "240px",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Glow effect on hover */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "1px",
                    background: `linear-gradient(90deg, transparent, ${post.color || "#6366f1"}, transparent)`,
                    opacity: hoveredPost === post.slug ? 1 : 0,
                    transition: "opacity 0.4s",
                  }}
                />

                {/* Date & type & series */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#52525b",
                      fontFamily: '"JetBrains Mono", monospace',
                    }}
                  >
                    {post.date}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      color: post.color || "#6366f1",
                      padding: "3px 8px",
                      background: `${post.color || "#6366f1"}15`,
                      borderRadius: "4px",
                      fontFamily: '"JetBrains Mono", monospace',
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {post.type}
                  </span>
                  {post.series && (
                    <span
                      title={post.seriesFull}
                      style={{
                        fontSize: "10px",
                        color: "#f5f5f5",
                        padding: "3px 8px",
                        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        borderRadius: "4px",
                        fontFamily: '"JetBrains Mono", monospace',
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        fontWeight: 600,
                      }}
                    >
                      {post.series}
                    </span>
                  )}
                  {post.part && (
                    <span
                      style={{
                        fontSize: "10px",
                        color: post.color || "#6366f1",
                        padding: "2px 8px",
                        border: `1px solid ${post.color || "#6366f1"}`,
                        borderRadius: "4px",
                        fontFamily: '"JetBrains Mono", monospace',
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        fontWeight: 600,
                      }}
                    >
                      {post.part}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2
                  style={{
                    fontSize: "24px",
                    fontWeight: 600,
                    margin: "0 0 12px 0",
                    fontFamily: '"Space Grotesk", system-ui, sans-serif',
                    color: "#f4f4f5",
                    letterSpacing: "-0.5px",
                    lineHeight: 1.3,
                  }}
                >
                  {post.title}
                </h2>

                {/* Description */}
                <p
                  style={{
                    fontSize: "14px",
                    color: "#71717a",
                    margin: 0,
                    lineHeight: 1.6,
                    flex: 1,
                  }}
                >
                  {post.description}
                </p>

                {/* Enter indicator */}
                <div
                  style={{
                    marginTop: "24px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#52525b",
                    fontSize: "13px",
                    fontFamily: '"JetBrains Mono", monospace',
                    opacity: hoveredPost === post.slug ? 1 : 0.5,
                    transition: "all 0.3s",
                    transform:
                      hoveredPost === post.slug
                        ? "translateX(4px)"
                        : "translateX(0)",
                  }}
                >
                  <span>Enter</span>
                  <span
                    style={{
                      fontSize: "16px",
                      transition: "transform 0.3s",
                      transform:
                        hoveredPost === post.slug
                          ? "translateX(4px)"
                          : "translateX(0)",
                    }}
                  >
                    →
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>

        <PortfolioSection mounted={mounted} />
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: "48px 40px",
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <p
            style={{
              fontSize: "13px",
              color: "#52525b",
              fontFamily: '"JetBrains Mono", monospace',
              margin: 0,
              letterSpacing: "0.5px",
            }}
          >
            Ideas rendered as experiences
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              color: "#3f3f46",
              fontFamily: '"JetBrains Mono", monospace',
            }}
          >
            <span>made by</span>
            <span style={{ color: "#71717a" }}>André Ratzenberger</span>
            <span style={{ color: "#52525b" }}>&</span>
            <span
              style={{
                background: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Claude
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <Link
              to="/about"
              style={{
                fontSize: "11px",
                fontFamily: '"JetBrains Mono", monospace',
                textDecoration: "none",
                background: "linear-gradient(135deg, #71717a 0%, #a1a1aa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              About/Why?
            </Link>
            <span style={{ color: "#27272a", fontSize: "10px" }}>•</span>
            <Link
              to="/impressum"
              style={{
                color: "#3f3f46",
                fontSize: "11px",
                fontFamily: '"JetBrains Mono", monospace',
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#a1a1aa")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#3f3f46")}
            >
              Impressum
            </Link>
            <span style={{ color: "#27272a", fontSize: "10px" }}>•</span>
            <a
              href="https://x.com/a_ratzenberger"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#3f3f46",
                fontSize: "12px",
                fontFamily: '"JetBrains Mono", monospace',
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#a1a1aa")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#3f3f46")}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/in/ratzenberger/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#3f3f46",
                fontSize: "12px",
                fontFamily: '"JetBrains Mono", monospace',
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#a1a1aa")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#3f3f46")}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a
              href="https://github.com/a-ratz/infinite-loop"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#3f3f46",
                fontSize: "12px",
                fontFamily: '"JetBrains Mono", monospace',
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#a1a1aa")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#3f3f46")}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
