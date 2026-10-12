import { Link } from "react-router-dom";
import { useState } from "react";

export default function PostLayout({ post, children }) {
  const [showNav, setShowNav] = useState(true);

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      {/* Floating nav */}
      <nav
        style={{
          position: "fixed",
          top: "20px",
          left: "20px",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "8px 16px",
          background: "rgba(10, 10, 15, 0.8)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "8px",
          opacity: showNav ? 1 : 0.3,
          transition: "opacity 0.3s",
        }}
        onMouseEnter={() => setShowNav(true)}
        onMouseLeave={() => setShowNav(true)}
      >
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#a1a1aa",
            fontSize: "13px",
            fontFamily: '"JetBrains Mono", monospace',
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#a1a1aa")}
        >
          <span style={{ fontSize: "16px" }}>←</span>
          <span>INFINITE LOOP</span>
        </Link>
        <div
          style={{
            width: "1px",
            height: "16px",
            background: "rgba(255,255,255,0.1)",
          }}
        />
        <span
          style={{
            color: "#52525b",
            fontSize: "12px",
            fontFamily: '"JetBrains Mono", monospace',
          }}
        >
          {post.date}
        </span>
      </nav>

      {/* Post content - full bleed */}
      {children}
    </div>
  );
}
