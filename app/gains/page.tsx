"use client"

import { useEffect, useRef, useState } from "react"

/* ============================================================
   GAINS Institute — Homepage
   ============================================================
   A premium institutional landing page for governance,
   AI stewardship, sustainability, executive education,
   and board-level advisory services.
   ============================================================ */

// --- Intersection Observer hook for scroll-triggered animation ---
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el) } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return { ref, visible }
}

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useReveal()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  )
}

// --- Arrow icon for buttons ---
function ArrowRight({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  )
}

// --- Navigation ---
function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav className={`gains-nav ${scrolled ? "gains-nav-scrolled" : ""}`} role="navigation" aria-label="Primary">
      <div className="gains-container gains-nav-inner">
        {/* Logo / Wordmark */}
        <a href="/gains" className="gains-wordmark" aria-label="GAINS Institute home">
          <span className="gains-wordmark-main">GAINS</span>
          <span className="gains-wordmark-sub">Institute</span>
        </a>

        {/* Desktop nav */}
        <ul className="gains-nav-links">
          <li><a href="#about" className="gains-nav-link">About</a></li>
          <li><a href="#pillars" className="gains-nav-link">Pillars</a></li>
          <li><a href="#programmes" className="gains-nav-link">Programmes</a></li>
          <li><a href="#research" className="gains-nav-link">Research</a></li>
          <li><a href="#advisory" className="gains-nav-link">Advisory</a></li>
          <li><a href="#contact" className="gains-nav-link">Contact</a></li>
        </ul>

        {/* CTA */}
        <div className="gains-nav-actions">
          <a href="#contact" className="gains-btn gains-btn-primary gains-nav-cta">
            Engage With Us
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          className="gains-mobile-menu-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation menu"
        >
          <span style={{ display: "flex", flexDirection: "column", gap: "5px", width: "22px" }}>
            <span style={{
              height: "1.5px", background: "var(--gains-graphite)", transition: "all 0.3s ease",
              transform: mobileOpen ? "rotate(45deg) translate(4.5px, 4.5px)" : "none",
            }} />
            <span style={{
              height: "1.5px", background: "var(--gains-graphite)", transition: "all 0.3s ease",
              opacity: mobileOpen ? 0 : 1,
            }} />
            <span style={{
              height: "1.5px", background: "var(--gains-graphite)", transition: "all 0.3s ease",
              transform: mobileOpen ? "rotate(-45deg) translate(4.5px, -4.5px)" : "none",
            }} />
          </span>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="gains-mobile-nav" role="menu">
          <div className="gains-container" style={{ paddingTop: "1rem", paddingBottom: "2rem" }}>
            {["About", "Pillars", "Programmes", "Research", "Advisory", "Contact"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="gains-mobile-nav-link"
                onClick={() => setMobileOpen(false)}
                role="menuitem"
              >
                {item}
              </a>
            ))}
            <div style={{ marginTop: "1.5rem" }}>
              <a href="#contact" className="gains-btn gains-btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                Engage With Us
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

// ============================================================
// HOMEPAGE
// ============================================================
export default function GAINSHomePage() {
  return (
    <main>
      <Navigation />

      {/* ========== 1. HERO ========== */}
      <section className="gains-hero" aria-label="Introduction">
        <div className="gains-container gains-hero-inner">
          <div className="gains-hero-content">
            <p className="gains-overline gains-animate-in">Governance &middot; AI Stewardship &middot; Sustainability</p>

            <h1 className="gains-heading-display gains-animate-in gains-animate-delay-1">
              Shaping the institutions<br />
              that shape the future.
            </h1>

            <p className="gains-hero-lede gains-animate-in gains-animate-delay-2">
              GAINS Institute equips boards, executives, and institutional leaders with the
              frameworks, education, and strategic counsel to govern responsibly in an era
              of artificial intelligence, systemic risk, and sustainability transformation.
            </p>

            <div className="gains-hero-actions gains-animate-in gains-animate-delay-3">
              <a href="#programmes" className="gains-btn gains-btn-primary">
                Explore Programmes <ArrowRight />
              </a>
              <a href="#about" className="gains-btn gains-btn-secondary">
                Our Mission
              </a>
            </div>
          </div>

          <div className="gains-hero-aside gains-animate-in gains-animate-delay-4">
            <div className="gains-hero-stat-stack">
              <div className="gains-hero-stat">
                <span className="gains-hero-stat-number">2,400+</span>
                <span className="gains-hero-stat-label">Senior leaders trained</span>
              </div>
              <hr className="gains-rule" />
              <div className="gains-hero-stat">
                <span className="gains-hero-stat-number">45</span>
                <span className="gains-hero-stat-label">Countries represented</span>
              </div>
              <hr className="gains-rule" />
              <div className="gains-hero-stat">
                <span className="gains-hero-stat-number">12</span>
                <span className="gains-hero-stat-label">Research programmes active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 2. POSITIONING BRIEF ========== */}
      <section id="about" className="gains-section gains-surface-cream" aria-label="About GAINS">
        <div className="gains-container">
          <Reveal>
            <div className="gains-brief-grid">
              <div className="gains-brief-left">
                <p className="gains-overline" style={{ marginBottom: "1.25rem" }}>About the Institute</p>
                <h2 className="gains-heading-1">
                  The convergence of governance, technology, and sustainability demands a new calibre of institutional leadership.
                </h2>
              </div>
              <div className="gains-brief-right">
                <p className="gains-body-lg" style={{ marginBottom: "1.5rem" }}>
                  GAINS Institute was founded on a premise: the decisions made in boardrooms today
                  will determine whether artificial intelligence, environmental strategy, and
                  governance frameworks serve the long-term interest of societies or merely
                  the short-term interest of shareholders.
                </p>
                <p className="gains-body-lg" style={{ marginBottom: "1.5rem" }}>
                  We operate at the intersection of executive education, applied research, and
                  strategic advisory — working directly with boards, C-suite leaders, sovereign
                  institutions, and multilateral organisations to build governance capacity
                  where it matters most.
                </p>
                <p className="gains-body-lg">
                  Our work is grounded in rigorous inquiry, cross-sector collaboration, and
                  an unwavering commitment to institutional integrity.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ========== 3. THE FIVE PILLARS ========== */}
      <section id="pillars" className="gains-section" aria-label="Five Pillars">
        <div className="gains-container">
          <Reveal>
            <div style={{ marginBottom: "var(--gains-space-4xl)" }}>
              <p className="gains-overline" style={{ marginBottom: "1rem" }}>Our Focus</p>
              <h2 className="gains-heading-1" style={{ maxWidth: "640px" }}>
                Five pillars of institutional intelligence.
              </h2>
            </div>
          </Reveal>

          <div className="gains-pillars-grid">
            {[
              {
                number: "01",
                title: "Governance & Board Excellence",
                body: "Strengthening the structures, practices, and cultures through which boards govern. From fiduciary clarity to stakeholder alignment, we build governance that withstands scrutiny and serves purpose.",
              },
              {
                number: "02",
                title: "AI Stewardship & Digital Ethics",
                body: "Guiding institutions through the adoption, oversight, and ethical governance of artificial intelligence. We help leaders ask the right questions before algorithms make the decisions for them.",
              },
              {
                number: "03",
                title: "Sustainability & ESG Strategy",
                body: "Moving beyond compliance to strategic integration. We help boards and leadership teams embed sustainability into capital allocation, risk management, and long-term value creation.",
              },
              {
                number: "04",
                title: "Executive Education & Leadership",
                body: "Intensive programmes designed for senior decision-makers who need to govern emerging complexity — not theoretically, but practically, with frameworks they can deploy immediately.",
              },
              {
                number: "05",
                title: "Institutional Risk & Resilience",
                body: "Preparing organisations for systemic shocks — geopolitical, technological, environmental. We build the institutional muscle to anticipate, adapt, and endure.",
              },
            ].map((pillar, i) => (
              <Reveal key={pillar.number} delay={i * 0.08}>
                <article className="gains-pillar-card">
                  <div className="gains-pillar-number">{pillar.number}</div>
                  <h3 className="gains-heading-3" style={{ marginBottom: "0.875rem" }}>{pillar.title}</h3>
                  <p className="gains-body-sm">{pillar.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 4. EDITORIAL QUOTE ========== */}
      <section className="gains-section gains-surface-forest" aria-label="Perspective">
        <div className="gains-container-narrow">
          <Reveal>
            <blockquote className="gains-quote-hero">
              <p>
                &ldquo;The institutions that will earn lasting trust are those willing to govern
                the technologies they deploy with the same rigour they apply to the capital
                they allocate.&rdquo;
              </p>
              <footer>
                <cite>GAINS Institute, Founding Principles</cite>
              </footer>
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* ========== 5. PROGRAMMES ========== */}
      <section id="programmes" className="gains-section" aria-label="Programmes">
        <div className="gains-container">
          <Reveal>
            <div className="gains-programmes-header">
              <div>
                <p className="gains-overline" style={{ marginBottom: "1rem" }}>Executive Education</p>
                <h2 className="gains-heading-1" style={{ maxWidth: "580px" }}>
                  Programmes built for the boardroom, not the lecture hall.
                </h2>
              </div>
              <p className="gains-body-lg" style={{ maxWidth: "460px" }}>
                Each programme is designed for senior leaders who need to govern complexity —
                with practical frameworks, peer exchange, and direct application.
              </p>
            </div>
          </Reveal>

          <hr className="gains-rule" style={{ margin: "var(--gains-space-2xl) 0" }} />

          <div className="gains-programmes-list">
            {[
              {
                tag: "Flagship",
                title: "Governing AI: A Programme for Boards",
                duration: "5 days — Residential",
                desc: "An intensive programme for board directors and C-suite executives on the governance, risk, and strategic opportunity of artificial intelligence. Case-driven. Peer-led. Immediately applicable.",
              },
              {
                tag: "Certificate",
                title: "ESG Strategy & Board Oversight",
                duration: "3 modules — Blended",
                desc: "A structured programme equipping directors and senior leaders to move from ESG compliance to strategic integration — across reporting, capital allocation, and stakeholder engagement.",
              },
              {
                tag: "Intensive",
                title: "Institutional Resilience & Systemic Risk",
                duration: "4 days — Residential",
                desc: "Designed for leaders navigating geopolitical volatility, supply chain disruption, and technological discontinuity. Scenario-based. Cross-sector cohorts. Actionable takeaways.",
              },
              {
                tag: "Seminar Series",
                title: "The Governance of Emerging Technology",
                duration: "6 sessions — Virtual",
                desc: "A topical series examining how boards should approach quantum computing, generative AI, biotech, and other frontier technologies — before regulation catches up.",
              },
            ].map((prog, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <article className="gains-programme-item">
                  <div className="gains-programme-meta">
                    <span className="gains-tag">{prog.tag}</span>
                    <span className="gains-body-sm">{prog.duration}</span>
                  </div>
                  <div className="gains-programme-content">
                    <h3 className="gains-heading-3" style={{ marginBottom: "0.75rem" }}>{prog.title}</h3>
                    <p className="gains-body-sm" style={{ maxWidth: "580px" }}>{prog.desc}</p>
                  </div>
                  <div className="gains-programme-action">
                    <a href="#contact" className="gains-btn-text">
                      Learn more <ArrowRight size={14} />
                    </a>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 6. RESEARCH / INSIGHTS ========== */}
      <section id="research" className="gains-section gains-surface-cream" aria-label="Research and Insights">
        <div className="gains-container">
          <Reveal>
            <div style={{ marginBottom: "var(--gains-space-3xl)" }}>
              <p className="gains-overline" style={{ marginBottom: "1rem" }}>Research &amp; Insights</p>
              <h2 className="gains-heading-1" style={{ maxWidth: "620px" }}>
                Inquiry that informs action.
              </h2>
            </div>
          </Reveal>

          <div className="gains-research-grid">
            {[
              {
                type: "Working Paper",
                title: "Board-Level AI Oversight: A Framework for Fiduciary Governance",
                abstract: "Proposes a practical framework for boards seeking to exercise meaningful oversight of AI systems without requiring deep technical expertise — grounded in fiduciary duty and institutional accountability.",
                date: "March 2026",
              },
              {
                type: "Policy Brief",
                title: "Sustainability Reporting Beyond Compliance: From Disclosure to Strategy",
                abstract: "Examines how leading boards are moving beyond regulatory compliance in ESG reporting to use sustainability disclosure as a strategic tool for capital allocation and stakeholder trust.",
                date: "January 2026",
              },
              {
                type: "Thought Leadership",
                title: "The Governance Gap: Why Most Organisations Are Not Ready for Frontier AI",
                abstract: "An analysis of governance preparedness across 200 organisations, revealing critical gaps in board capability, risk appetite frameworks, and oversight structures for AI deployment.",
                date: "November 2025",
              },
            ].map((paper, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <article className="gains-research-card">
                  <div style={{ marginBottom: "1.25rem" }}>
                    <span className="gains-tag gains-tag-forest">{paper.type}</span>
                    <span className="gains-caption" style={{ marginLeft: "0.75rem" }}>{paper.date}</span>
                  </div>
                  <h3 className="gains-heading-3" style={{ marginBottom: "0.875rem" }}>{paper.title}</h3>
                  <p className="gains-body-sm">{paper.abstract}</p>
                  <a href="#contact" className="gains-btn-text" style={{ marginTop: "1.25rem" }}>
                    Read paper <ArrowRight size={14} />
                  </a>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 7. ADVISORY ========== */}
      <section id="advisory" className="gains-section" aria-label="Strategic Advisory">
        <div className="gains-container">
          <div className="gains-advisory-layout">
            <Reveal>
              <div className="gains-advisory-left">
                <p className="gains-overline" style={{ marginBottom: "1rem" }}>Strategic Advisory</p>
                <h2 className="gains-heading-1" style={{ marginBottom: "1.5rem" }}>
                  Confidential counsel for boards navigating complexity.
                </h2>
                <p className="gains-body-lg" style={{ marginBottom: "2rem" }}>
                  Our advisory practice serves boards, chairs, and institutional leaders who
                  require discreet, expert guidance on governance, AI strategy, sustainability
                  positioning, and institutional transformation.
                </p>
                <a href="#contact" className="gains-btn gains-btn-primary">
                  Request a Consultation <ArrowRight />
                </a>
              </div>
            </Reveal>

            <div className="gains-advisory-right">
              {[
                {
                  title: "Board Governance Reviews",
                  desc: "Independent assessment of board composition, effectiveness, and governance practices against international standards and emerging best practice.",
                },
                {
                  title: "AI Readiness & Oversight Design",
                  desc: "Structured advisory to help boards establish oversight frameworks, risk appetite, and governance infrastructure for AI and emerging technology.",
                },
                {
                  title: "ESG & Sustainability Integration",
                  desc: "Strategic counsel on embedding sustainability into corporate governance, capital allocation, and stakeholder engagement — beyond reporting requirements.",
                },
                {
                  title: "Institutional Risk Assessment",
                  desc: "Scenario-based analysis of systemic risks — geopolitical, technological, environmental — with governance recommendations and resilience planning.",
                },
              ].map((service, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <div className="gains-advisory-item">
                    <h4 className="gains-heading-4" style={{ marginBottom: "0.5rem" }}>{service.title}</h4>
                    <p className="gains-body-sm">{service.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== 8. CREDIBILITY / PROOF ========== */}
      <section className="gains-section gains-surface-parchment" aria-label="Credibility">
        <div className="gains-container">
          <Reveal>
            <div className="gains-proof-header">
              <p className="gains-overline" style={{ marginBottom: "1rem" }}>Trust &amp; Track Record</p>
              <h2 className="gains-heading-2" style={{ maxWidth: "560px" }}>
                Trusted by institutions that take governance seriously.
              </h2>
            </div>
          </Reveal>

          <div className="gains-proof-grid">
            <Reveal delay={0.1}>
              <div className="gains-proof-block">
                <div className="gains-proof-number">96%</div>
                <p className="gains-body-sm">of programme participants rate our executive education as directly applicable to board-level decision-making.</p>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="gains-proof-block">
                <div className="gains-proof-number">45+</div>
                <p className="gains-body-sm">countries represented across our programme alumni network, spanning public, private, and multilateral sectors.</p>
              </div>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="gains-proof-block">
                <div className="gains-proof-number">80+</div>
                <p className="gains-body-sm">advisory engagements completed with boards and institutional leadership teams since founding.</p>
              </div>
            </Reveal>
            <Reveal delay={0.4}>
              <div className="gains-proof-block">
                <div className="gains-proof-number">12</div>
                <p className="gains-body-sm">active research programmes informing policy, governance practice, and executive education curricula worldwide.</p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.3}>
            <div className="gains-testimonial-block">
              <blockquote className="gains-blockquote">
                &ldquo;GAINS provided our board with exactly what we needed — a rigorous, practical
                framework for AI oversight that we could adopt immediately. No other programme
                came close to this level of institutional relevance.&rdquo;
                <cite>Chair, FTSE 250 Board &middot; Programme Alumnus</cite>
              </blockquote>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ========== 9. AFFILIATIONS ========== */}
      <section className="gains-affiliations" aria-label="Affiliations">
        <div className="gains-container">
          <p className="gains-overline" style={{ textAlign: "center", marginBottom: "var(--gains-space-xl)" }}>
            Engaged by institutions across sectors
          </p>
          <div className="gains-affiliations-grid">
            {[
              "Sovereign Wealth Funds",
              "FTSE & Fortune 500 Boards",
              "Central Banks",
              "Multilateral Organisations",
              "Family Offices",
              "National Regulators",
            ].map((org) => (
              <div key={org} className="gains-affiliation-item">
                <span>{org}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 10. CLOSING CTA ========== */}
      <section id="contact" className="gains-section gains-surface-forest" aria-label="Engage with GAINS">
        <div className="gains-container-narrow" style={{ textAlign: "center" }}>
          <Reveal>
            <p className="gains-overline" style={{ marginBottom: "1.25rem", color: "var(--gains-stone-light)" }}>
              Begin the Conversation
            </p>
            <h2 className="gains-cta-heading">
              Better governance starts with<br />better preparation.
            </h2>
            <p className="gains-cta-body">
              Whether you are a board seeking strategic counsel, an institution investing in
              leadership development, or a partner aligned with our mission — we welcome the
              conversation.
            </p>
            <div className="gains-cta-actions">
              <a href="mailto:contact@gainsinstitute.org" className="gains-btn gains-btn-cta-primary">
                Contact the Institute <ArrowRight />
              </a>
              <a href="#programmes" className="gains-btn gains-btn-cta-secondary">
                Explore Programmes
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="gains-footer" role="contentinfo">
        <div className="gains-container">
          <div className="gains-footer-grid">
            <div className="gains-footer-brand">
              <div className="gains-wordmark" style={{ marginBottom: "1rem" }}>
                <span className="gains-wordmark-main" style={{ color: "var(--gains-graphite)" }}>GAINS</span>
                <span className="gains-wordmark-sub" style={{ color: "var(--gains-stone)" }}>Institute</span>
              </div>
              <p className="gains-body-sm" style={{ maxWidth: "280px" }}>
                Advancing responsible governance, AI stewardship, and sustainability
                for institutions worldwide.
              </p>
            </div>
            <div className="gains-footer-col">
              <p className="gains-overline" style={{ marginBottom: "0.75rem" }}>Institute</p>
              <ul className="gains-footer-links">
                <li><a href="#about">About</a></li>
                <li><a href="#pillars">Pillars</a></li>
                <li><a href="#research">Research</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            <div className="gains-footer-col">
              <p className="gains-overline" style={{ marginBottom: "0.75rem" }}>Education</p>
              <ul className="gains-footer-links">
                <li><a href="#programmes">Programmes</a></li>
                <li><a href="#advisory">Advisory</a></li>
                <li><a href="#programmes">Seminars</a></li>
                <li><a href="#programmes">Custom Programmes</a></li>
              </ul>
            </div>
            <div className="gains-footer-col">
              <p className="gains-overline" style={{ marginBottom: "0.75rem" }}>Connect</p>
              <ul className="gains-footer-links">
                <li><a href="mailto:contact@gainsinstitute.org">Email</a></li>
                <li><a href="#contact">LinkedIn</a></li>
                <li><a href="#contact">Newsletter</a></li>
              </ul>
            </div>
          </div>
          <hr className="gains-rule" style={{ margin: "var(--gains-space-2xl) 0 var(--gains-space-lg)" }} />
          <div className="gains-footer-bottom">
            <p className="gains-caption">&copy; 2026 GAINS Institute. All rights reserved.</p>
            <div className="gains-footer-legal">
              <a href="#" className="gains-caption">Privacy Policy</a>
              <a href="#" className="gains-caption">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
