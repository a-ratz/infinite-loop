import { Link } from "react-router-dom";
import { useState } from "react";
import { works } from "../portfolio/registry";

const mono = '"JetBrains Mono", monospace';
const display = '"Space Grotesk", system-ui, sans-serif';

export default function PortfolioSection({ mounted }) {
  const [hovered, setHovered] = useState(null);

  return (
    <section id="portfolio" style={{ marginTop: "112px", scrollMarginTop: "40px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.8s 0.4s",
        }}
      >
        <span style={{ fontFamily: mono, fontSize: "12px", color: "#71717a", letterSpacing: "3px" }}>
          PORTFOLIO
        </span>
        <div
          style={{
            flex: 1,
            height: "1px",
            background: "linear-gradient(90deg, rgba(255,255,255,0.12), transparent)",
          }}
        />
        <span style={{ fontFamily: mono, fontSize: "12px", color: "#3f3f46" }}>
          {String(works.length).padStart(2, "0")} projects
        </span>
      </div>

      <h2
        style={{
          fontFamily: display,
          fontSize: "clamp(32px, 5vw, 48px)",
          fontWeight: 700,
          letterSpacing: "-1.5px",
          margin: "20px 0 8px",
          background: "linear-gradient(135deg, #fff 0%, #71717a 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: 1.1,
        }}
      >
        Open-source work
      </h2>
      <p style={{ fontFamily: mono, fontSize: "14px", color: "#52525b", margin: "0 0 32px" }}>
        Each project has its own interactive page.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "24px",
        }}
      >
        {works.map((work, index) => {
          const on = hovered === work.slug;
          return (
            <Link
              key={work.slug}
              to={`/portfolio/${work.slug}`}
              style={{
                display: "block",
                height: "100%",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(30px)",
                transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.1 + 0.5}s`,
              }}
              onMouseEnter={() => setHovered(work.slug)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(work.slug)}
              onBlur={() => setHovered(null)}
            >
              <article
                style={{
                  position: "relative",
                  overflow: "hidden",
                  height: "100%",
                  minHeight: "320px",
                  display: "flex",
                  flexDirection: "column",
                  padding: "32px",
                  borderRadius: "16px",
                  border: `1px solid ${on ? work.color : "rgba(255,255,255,0.06)"}`,
                  background: `radial-gradient(420px 220px at 100% 0%, ${work.color}${on ? "26" : "14"}, transparent 70%), rgba(255,255,255,${on ? 0.04 : 0.02})`,
                  transform: on ? "translateY(-4px)" : "translateY(0)",
                  transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: on ? "100%" : "48px",
                    height: "2px",
                    background: work.color,
                    transition: "width 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                />

                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px" }}>
                  <span style={{ fontFamily: mono, fontSize: "12px", color: work.color }}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: "10px",
                      color: work.color,
                      padding: "3px 8px",
                      background: `${work.color}15`,
                      borderRadius: "4px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {work.kind}
                  </span>
                </div>

                <h3
                  style={{
                    fontFamily: display,
                    fontSize: "40px",
                    fontWeight: 700,
                    letterSpacing: "-1.5px",
                    color: "#f4f4f5",
                    margin: "0 0 12px",
                    lineHeight: 1,
                  }}
                >
                  {work.title}
                </h3>

                <p style={{ fontSize: "14px", color: "#71717a", lineHeight: 1.6, margin: 0, flex: 1 }}>
                  {work.description}
                </p>

                <div
                  style={{
                    marginTop: "24px",
                    padding: "10px 14px",
                    borderLeft: `2px solid ${work.color}`,
                    background: "rgba(0,0,0,0.35)",
                    fontFamily: mono,
                    fontSize: "12px",
                    color: on ? "#e4e4e7" : "#a1a1aa",
                    transition: "color 0.3s",
                    overflowWrap: "anywhere",
                  }}
                >
                  {work.readout}
                </div>

                <div
                  style={{
                    marginTop: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontFamily: mono,
                    fontSize: "13px",
                    color: on ? work.color : "#52525b",
                    transform: on ? "translateX(4px)" : "translateX(0)",
                    transition: "all 0.3s",
                  }}
                >
                  <span>Open</span>
                  <span>→</span>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
