import { Link } from "react-router-dom";

export default function Impressum() {
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

      {/* Navigation */}
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
        }}
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
            textDecoration: "none",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#a1a1aa")}
        >
          <span style={{ fontSize: "16px" }}>←</span>
          <span>INFINITE LOOP</span>
        </Link>
      </nav>

      {/* Content */}
      <main
        style={{
          maxWidth: "640px",
          margin: "0 auto",
          padding: "120px 40px 80px",
          position: "relative",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 700,
            margin: "0 0 40px 0",
            letterSpacing: "-1px",
            fontFamily: '"Space Grotesk", system-ui, sans-serif',
            color: "#f4f4f5",
          }}
        >
          Impressum
        </h1>

        <section style={{ marginBottom: "32px" }}>
          <h2
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#52525b",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "12px",
              fontFamily: '"JetBrains Mono", monospace',
            }}
          >
            Angaben gemäß § 5 TMG
          </h2>
          <div
            style={{
              fontSize: "15px",
              color: "#a1a1aa",
              lineHeight: 1.8,
              fontFamily: '"Inter", system-ui, sans-serif',
            }}
          >
            <p style={{ margin: "0 0 8px 0" }}>André Ratzenberger</p>
            <p style={{ margin: "0 0 8px 0" }}>Von-der-Tann-Str. 31</p>
            <p style={{ margin: 0 }}>83022 Rosenheim</p>
          </div>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#52525b",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "12px",
              fontFamily: '"JetBrains Mono", monospace',
            }}
          >
            Kontakt
          </h2>
          <div
            style={{
              fontSize: "15px",
              color: "#a1a1aa",
              lineHeight: 1.8,
              fontFamily: '"Inter", system-ui, sans-serif',
            }}
          >
            <p style={{ margin: 0 }}>
              E-Mail:{" "}
              <a
                href="mailto:a.ratzenberger@gmail.com"
                style={{ color: "#6366f1", textDecoration: "none" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.textDecoration = "underline")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.textDecoration = "none")
                }
              >
                a.ratzenberger@gmail.com
              </a>
            </p>
          </div>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#52525b",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "12px",
              fontFamily: '"JetBrains Mono", monospace',
            }}
          >
            Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
          </h2>
          <div
            style={{
              fontSize: "15px",
              color: "#a1a1aa",
              lineHeight: 1.8,
              fontFamily: '"Inter", system-ui, sans-serif',
            }}
          >
            <p style={{ margin: 0 }}>André Ratzenberger</p>
          </div>
        </section>

        {/* German Disclaimer */}
        <section style={{ marginBottom: "40px" }}>
          <h2
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#52525b",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "12px",
              fontFamily: '"JetBrains Mono", monospace',
            }}
          >
            Haftungsausschluss
          </h2>
          <div
            style={{
              fontSize: "14px",
              color: "#71717a",
              lineHeight: 1.8,
              fontFamily: '"Inter", system-ui, sans-serif',
            }}
          >
            <p style={{ margin: "0 0 16px 0" }}>
              <strong style={{ color: "#a1a1aa" }}>Haftung für Inhalte:</strong>{" "}
              Die Inhalte dieser Seiten wurden mit größter Sorgfalt erstellt.
              Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte
              kann ich jedoch keine Gewähr übernehmen.
            </p>
            <p style={{ margin: 0 }}>
              <strong style={{ color: "#a1a1aa" }}>Haftung für Links:</strong>{" "}
              Diese Website enthält Links zu externen Webseiten Dritter, auf
              deren Inhalte ich keinen Einfluss habe. Für die Inhalte der
              verlinkten Seiten ist stets der jeweilige Anbieter verantwortlich.
            </p>
          </div>
        </section>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
            margin: "0 0 40px 0",
          }}
        />

        {/* English Disclaimer */}
        <section>
          <h2
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#52525b",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "12px",
              fontFamily: '"JetBrains Mono", monospace',
            }}
          >
            Disclaimer
          </h2>
          <div
            style={{
              fontSize: "14px",
              color: "#71717a",
              lineHeight: 1.8,
              fontFamily: '"Inter", system-ui, sans-serif',
            }}
          >
            <p style={{ margin: "0 0 16px 0" }}>
              <strong style={{ color: "#a1a1aa" }}>
                Liability for Content:
              </strong>{" "}
              The contents of this website have been created with the utmost
              care. However, I cannot guarantee the accuracy, completeness, or
              timeliness of the content.
            </p>
            <p style={{ margin: 0 }}>
              <strong style={{ color: "#a1a1aa" }}>Liability for Links:</strong>{" "}
              This website contains links to external third-party websites over
              whose content I have no influence. The respective provider is
              always responsible for the content of the linked pages.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
