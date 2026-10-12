import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

// Scroll-triggered section component
function RevealSection({ children, delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.15 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(40px)",
        transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {children}
    </div>
  );
}

// Animated word that reveals on hover
function GlitchWord({ children }) {
  const [hovered, setHovered] = useState(false);

  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        cursor: "default",
        transition: "color 0.3s",
        color: hovered ? "#fbbf24" : "inherit",
      }}
    >
      {children}
      {hovered && (
        <span
          style={{
            position: "absolute",
            left: "2px",
            top: "2px",
            color: "#ef4444",
            opacity: 0.5,
            pointerEvents: "none",
            animation: "glitch 0.3s infinite",
          }}
        >
          {children}
        </span>
      )}
    </span>
  );
}

export default function About() {
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#09090b",
        color: "#fafafa",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Custom styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Syne:wght@400;600;700;800&display=swap');

        @keyframes glitch {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(2px, -2px); }
          60% { transform: translate(-1px, -1px); }
          80% { transform: translate(1px, 1px); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(1deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }

        ::selection {
          background: #fbbf24;
          color: #09090b;
        }
      `}</style>

      {/* Grain overlay */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.035,
          pointerEvents: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          zIndex: 9999,
        }}
      />

      {/* Floating ambient shapes */}
      <div
        style={{
          position: "fixed",
          top: "20%",
          right: "10%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%)",
          filter: "blur(40px)",
          animation: "float 8s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "30%",
          left: "5%",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 70%)",
          filter: "blur(30px)",
          animation: "float 12s ease-in-out infinite reverse",
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
          background: "rgba(9, 9, 11, 0.8)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.06)",
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
            fontFamily: '"Syne", sans-serif',
            fontWeight: 600,
            letterSpacing: "0.5px",
            textDecoration: "none",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fbbf24")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#a1a1aa")}
        >
          <span style={{ fontSize: "16px" }}>←</span>
          <span>INFINITE LOOP</span>
        </Link>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "0 10vw",
          position: "relative",
        }}
      >
        <div
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted
              ? `translateY(0) translateX(${scrollY * -0.1}px)`
              : "translateY(60px)",
            transition: "opacity 1.2s, transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <p
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: "clamp(14px, 2vw, 18px)",
              fontStyle: "italic",
              color: "#71717a",
              marginBottom: "24px",
              letterSpacing: "0.1em",
            }}
          >
            A manifesto in motion
          </p>
          <h1
            style={{
              fontFamily: '"Syne", sans-serif',
              fontSize: "clamp(48px, 12vw, 160px)",
              fontWeight: 800,
              lineHeight: 0.9,
              margin: 0,
              letterSpacing: "-0.03em",
            }}
          >
            <span style={{ display: "block" }}>WHY</span>
            <span
              style={{
                display: "block",
                color: "transparent",
                WebkitTextStroke: "2px #fbbf24",
                marginLeft: "10vw",
              }}
            >
              THIS
            </span>
            <span style={{ display: "block", marginLeft: "5vw" }}>EXISTS</span>
          </h1>
        </div>

        {/* Scroll indicator */}
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            opacity: mounted ? 0.5 : 0,
            transition: "opacity 1s 1.5s",
          }}
        >
          <span
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: "12px",
              fontStyle: "italic",
              color: "#71717a",
              letterSpacing: "0.2em",
            }}
          >
            scroll
          </span>
          <div
            style={{
              width: "1px",
              height: "40px",
              background: "linear-gradient(to bottom, #71717a, transparent)",
              animation: "pulse 2s infinite",
            }}
          />
        </div>
      </section>

      {/* The Problem */}
      <section
        style={{
          padding: "15vh 10vw",
          position: "relative",
        }}
      >
        <RevealSection>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: "8vw",
              alignItems: "start",
            }}
          >
            <div>
              <span
                style={{
                  fontFamily: '"Syne", sans-serif',
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.3em",
                  color: "#fbbf24",
                  textTransform: "uppercase",
                }}
              >
                The Problem
              </span>
              <div
                style={{
                  width: "60px",
                  height: "2px",
                  background: "#fbbf24",
                  marginTop: "16px",
                }}
              />
            </div>
            <div>
              <p
                style={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: "clamp(24px, 4vw, 42px)",
                  fontWeight: 400,
                  lineHeight: 1.4,
                  color: "#e4e4e7",
                  margin: 0,
                }}
              >
                You write a blog post. It's{" "}
                <GlitchWord>good</GlitchWord>. People skim it, maybe bookmark
                it, probably <em style={{ color: "#71717a" }}>forget it</em>.
              </p>
              <p
                style={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: "clamp(18px, 2.5vw, 24px)",
                  color: "#71717a",
                  marginTop: "32px",
                  lineHeight: 1.7,
                }}
              >
                The format hasn't evolved since the printing press. Title,
                paragraphs, maybe a code block. Scroll down, reach the end,
                close the tab.
              </p>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* The Question - Full width elegant */}
      <section
        style={{
          padding: "18vh 0",
          textAlign: "center",
          position: "relative",
        }}
      >
        <RevealSection delay={100}>
          <p
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: "clamp(28px, 5vw, 64px)",
              fontWeight: 400,
              fontStyle: "italic",
              lineHeight: 1.3,
              margin: 0,
              padding: "0 10vw",
              color: "#a1a1aa",
            }}
          >
            Why are we still publishing{" "}
            <span
              style={{
                color: "#fbbf24",
                fontStyle: "normal",
                fontWeight: 600,
              }}
            >
              PDFs
            </span>{" "}
            with extra steps?
          </p>
        </RevealSection>
      </section>

      {/* The Answer */}
      <section
        style={{
          padding: "15vh 10vw",
          position: "relative",
        }}
      >
        <RevealSection delay={150}>
          <div
            style={{
              maxWidth: "800px",
              marginLeft: "auto",
            }}
          >
            <span
              style={{
                fontFamily: '"Syne", sans-serif',
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.3em",
                color: "#fbbf24",
                textTransform: "uppercase",
              }}
            >
              The Answer
            </span>
            <h2
              style={{
                fontFamily: '"Syne", sans-serif',
                fontSize: "clamp(28px, 5vw, 56px)",
                fontWeight: 700,
                lineHeight: 1.2,
                margin: "24px 0 32px",
                letterSpacing: "-0.02em",
              }}
            >
              Each post is a{" "}
              <span style={{ color: "#fbbf24" }}>full application</span>.
            </h2>
            <p
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: "clamp(18px, 2.5vw, 24px)",
                color: "#a1a1aa",
                lineHeight: 1.8,
                margin: 0,
              }}
            >
              Not "interactive" like "has a comment section." Interactive like
              filterable, explorable, animated, stateful. Each entry gets full
              creative freedom — its own styling, its own logic, its own
              personality.
            </p>
          </div>
        </RevealSection>
      </section>

      {/* This Page Is Proof */}
      <section
        style={{
          padding: "18vh 10vw",
          background: "rgba(251, 191, 36, 0.02)",
          borderTop: "1px solid rgba(251, 191, 36, 0.08)",
          borderBottom: "1px solid rgba(251, 191, 36, 0.08)",
        }}
      >
        <RevealSection delay={100}>
          <div style={{ textAlign: "center" }}>
            <p
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: "clamp(14px, 2vw, 16px)",
                fontStyle: "italic",
                color: "#52525b",
                marginBottom: "20px",
                letterSpacing: "0.15em",
              }}
            >
              case in point
            </p>
            <h2
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: "clamp(24px, 4vw, 48px)",
                fontWeight: 400,
                lineHeight: 1.3,
                margin: "0 0 24px",
                color: "#e4e4e7",
              }}
            >
              This page looks{" "}
              <span
                style={{
                  color: "#fbbf24",
                  fontStyle: "italic",
                }}
              >
                nothing
              </span>{" "}
              like the rest.
            </h2>
            <p
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: "clamp(16px, 2vw, 20px)",
                color: "#71717a",
                maxWidth: "600px",
                margin: "0 auto",
                lineHeight: 1.8,
              }}
            >
              Different fonts. Different layout. Different mood.
              <br />
              <span style={{ color: "#a1a1aa" }}>Yet unmistakably the same site.</span>
            </p>
          </div>
        </RevealSection>
      </section>

      {/* The Vision */}
      <section
        style={{
          padding: "15vh 10vw",
          position: "relative",
        }}
      >
        <RevealSection>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: "8vw",
              alignItems: "start",
            }}
          >
            <div>
              <span
                style={{
                  fontFamily: '"Syne", sans-serif',
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.3em",
                  color: "#fbbf24",
                  textTransform: "uppercase",
                }}
              >
                The Real Point
              </span>
              <div
                style={{
                  width: "60px",
                  height: "2px",
                  background: "#fbbf24",
                  marginTop: "16px",
                }}
              />
            </div>
            <div>
              <p
                style={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: "clamp(24px, 4vw, 42px)",
                  fontWeight: 400,
                  lineHeight: 1.4,
                  color: "#e4e4e7",
                  margin: 0,
                }}
              >
                In a world where AI makes knowledge and skill{" "}
                <em style={{ color: "#71717a" }}>commodities</em>, what remains
                scarce is <span style={{ color: "#fbbf24" }}>vision</span>.
              </p>
              <p
                style={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: "clamp(18px, 2.5vw, 24px)",
                  color: "#71717a",
                  marginTop: "32px",
                  lineHeight: 1.7,
                }}
              >
                This is an experiment in vision. Doing things with AI that
                haven't been done. Exploring the unexplored. Finding new ways
                to think, create, and share ideas.
              </p>
              <p
                style={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: "clamp(18px, 2.5vw, 24px)",
                  color: "#52525b",
                  marginTop: "24px",
                  lineHeight: 1.7,
                  fontStyle: "italic",
                }}
              >
                Not just using AI to do old things faster — but to do
                new things entirely.
              </p>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* The Philosophy */}
      <section
        style={{
          padding: "15vh 10vw",
        }}
      >
        <RevealSection>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "48px",
            }}
          >
            {[
              {
                title: "Freedom over templates",
                desc: "No two posts need to look alike. Each idea gets its own shape, its own rules, its own personality.",
              },
              {
                title: "Experience over consumption",
                desc: "Reading is passive. Exploring is active. That's a different relationship with information.",
              },
              {
                title: "Format follows content",
                desc: "Some ideas are essays. Some are explorable databases. The container should fit what's inside.",
              },
            ].map((item, i) => (
              <RevealSection key={i} delay={i * 100}>
                <div>
                  <span
                    style={{
                      fontFamily: '"Syne", sans-serif',
                      fontSize: "64px",
                      fontWeight: 800,
                      color: "rgba(251, 191, 36, 0.15)",
                      lineHeight: 1,
                    }}
                  >
                    0{i + 1}
                  </span>
                  <h3
                    style={{
                      fontFamily: '"Syne", sans-serif',
                      fontSize: "20px",
                      fontWeight: 700,
                      margin: "16px 0 12px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: '"Cormorant Garamond", serif',
                      fontSize: "17px",
                      color: "#71717a",
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              </RevealSection>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* The Creators */}
      <section
        style={{
          padding: "15vh 10vw 20vh",
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <RevealSection>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: "48px",
            }}
          >
            <div>
              <span
                style={{
                  fontFamily: '"Syne", sans-serif',
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.3em",
                  color: "#52525b",
                  textTransform: "uppercase",
                }}
              >
                Built by
              </span>
              <h2
                style={{
                  fontFamily: '"Syne", sans-serif',
                  fontSize: "clamp(24px, 4vw, 48px)",
                  fontWeight: 700,
                  margin: "16px 0 0",
                  letterSpacing: "-0.02em",
                }}
              >
                André Ratzenberger
              </h2>
              <p
                style={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: "20px",
                  color: "#71717a",
                  margin: "8px 0 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span>&</span>
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontWeight: 600,
                  }}
                >
                  Claude
                </span>
              </p>
            </div>
            <div
              style={{
                display: "flex",
                gap: "24px",
              }}
            >
              {[
                { href: "https://x.com/a_ratzenberger", label: "X" },
                {
                  href: "https://www.linkedin.com/in/ratzenberger/",
                  label: "LinkedIn",
                },
                {
                  href: "https://github.com/a-ratz/infinite-loop",
                  label: "GitHub",
                },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: '"Syne", sans-serif',
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#52525b",
                    textDecoration: "none",
                    padding: "12px 20px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "4px",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#fbbf24";
                    e.currentTarget.style.borderColor = "#fbbf24";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#52525b";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </RevealSection>
      </section>

      {/* Final statement */}
      <section
        style={{
          padding: "15vh 10vw",
          textAlign: "center",
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <RevealSection>
          <p
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: "clamp(24px, 4vw, 40px)",
              fontStyle: "italic",
              color: "#71717a",
              maxWidth: "700px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            The blog is the app.
            <br />
            The app is the blog.
            <br />
            <span style={{ color: "#fbbf24" }}>The loop is infinite.</span>
          </p>
        </RevealSection>
      </section>

      {/* Footer link back */}
      <footer
        style={{
          padding: "40px 10vw",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          textAlign: "center",
        }}
      >
        <Link
          to="/"
          style={{
            fontFamily: '"Syne", sans-serif',
            fontSize: "14px",
            fontWeight: 600,
            color: "#52525b",
            textDecoration: "none",
            letterSpacing: "0.1em",
            transition: "color 0.3s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fbbf24")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#52525b")}
        >
          ← EXPLORE THE POSTS
        </Link>
      </footer>
    </div>
  );
}
