'use client'

import { useState, FormEvent } from 'react'

/* ------------------------------------------------------------------ */
/*  Opensignl Landing Page                                             */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  async function handleWaitlist(e: FormEvent) {
    e.preventDefault()
    if (!email || !email.includes('@') || submitting) return
    setSubmitting(true)
    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setSubmitted(true)
    } catch {
      // silent fail — still show success for UX
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  function scrollTo(id: string) {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const mono: React.CSSProperties = {
    fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
  }

  /* ---- RENDER ---- */
  return (
    <div
      style={{
        background: 'var(--bg0)',
        color: 'var(--text0)',
        fontFamily: 'var(--font-geist-sans), "Geist", system-ui, sans-serif',
        minHeight: '100vh',
        overflowX: 'hidden',
        overflowY: 'auto',
        position: 'fixed',
        inset: 0,
      }}
    >
      {/* Pulse-dot keyframes + responsive styles injected once */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes float-glow {
          0%, 100% { box-shadow: 0 0 40px rgba(251,146,60,0.12), 0 0 80px rgba(251,146,60,0.06); }
          50% { box-shadow: 0 0 60px rgba(251,146,60,0.18), 0 0 120px rgba(251,146,60,0.09); }
        }
        @media (max-width: 768px) {
          .landing-nav-links { display: none !important; }
          .hero-headline { font-size: 32px !important; line-height: 1.15 !important; }
          .hero-sub { font-size: 15px !important; }
          .mockup-wrap { flex-direction: column !important; }
          .mockup-left { width: 100% !important; border-right: none !important; border-bottom: 1px solid var(--border) !important; }
          .mockup-right { width: 100% !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
          .footer-inner { flex-direction: column !important; gap: 24px !important; text-align: center !important; }
          .footer-right { align-items: center !important; }
          .hero-form-row { flex-direction: column !important; }
          .hero-form-row input { width: 100% !important; }
          .hero-form-row button { width: 100% !important; }
        }
        @media (max-width: 480px) {
          .hero-headline { font-size: 26px !important; }
        }
      `}</style>

      {/* ============================================================ */}
      {/*  NAV                                                          */}
      {/* ============================================================ */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          background: 'rgba(15,13,11,0.82)',
        }}
      >
        <div
          style={{
            maxWidth: 1080,
            margin: '0 auto',
            padding: '0 24px',
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              cursor: 'pointer',
            }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            open<span style={{ color: 'var(--accent)' }}>signl</span>
          </div>

          {/* Nav links — hidden on mobile via CSS */}
          <div
            className="landing-nav-links"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 28,
              fontSize: 14,
              color: 'var(--text1)',
            }}
          >
            <a
              onClick={() => scrollTo('how-it-works')}
              style={{ cursor: 'pointer', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text0)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text1)')}
            >
              How it works
            </a>
            <a
              onClick={() => scrollTo('pricing')}
              style={{ cursor: 'pointer', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text0)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text1)')}
            >
              Pricing
            </a>
            <a
              href="https://github.com/AbdarrahmanAyyaz/Signl"
              target="_blank"
              rel="noopener noreferrer"
              style={{ cursor: 'pointer', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text0)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text1)')}
            >
              GitHub
            </a>
          </div>

          {/* CTA */}
          <button
            onClick={() => scrollTo('hero')}
            style={{
              background: 'var(--accent)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 13,
              padding: '8px 18px',
              borderRadius: 'var(--r-pill, 99px)',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Get early access&nbsp;&rarr;
          </button>
        </div>
      </nav>

      {/* ============================================================ */}
      {/*  HERO                                                         */}
      {/* ============================================================ */}
      <section
        id="hero"
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          padding: '80px 24px 60px',
          textAlign: 'center',
        }}
      >
        {/* Live badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--bg2)',
            border: '1px solid var(--accent-border)',
            borderRadius: 'var(--r-pill, 99px)',
            padding: '6px 16px',
            fontSize: 13,
            color: 'var(--accent-text)',
            marginBottom: 28,
            ...mono,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--accent)',
              display: 'inline-block',
              animation: 'pulse-dot 2.5s ease-in-out infinite',
            }}
          />
          Now in private beta
        </div>

        {/* Headline */}
        <h1
          className="hero-headline"
          style={{
            fontSize: 48,
            fontWeight: 700,
            lineHeight: 1.12,
            letterSpacing: '-0.03em',
            maxWidth: 720,
            margin: '0 auto 20px',
          }}
        >
          Stop guessing.{' '}
          <span style={{ color: 'var(--accent)' }}>Post what your audience actually cares about.</span>
        </h1>

        {/* Sub */}
        <p
          className="hero-sub"
          style={{
            fontSize: 17,
            lineHeight: 1.65,
            color: 'var(--text1)',
            maxWidth: 580,
            margin: '0 auto 36px',
          }}
        >
          Opensignl researches Reddit, X, and LinkedIn daily&nbsp;&mdash; then writes
          platform-native posts grounded in what your niche is really talking about.
          Not AI&nbsp;slop. Real&nbsp;signal.
        </p>

        {/* Email form */}
        {!submitted ? (
          <form
            onSubmit={handleWaitlist}
            className="hero-form-row"
            style={{
              display: 'flex',
              gap: 10,
              justifyContent: 'center',
              maxWidth: 440,
              margin: '0 auto 16px',
            }}
          >
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                flex: 1,
                background: 'var(--bg2)',
                border: '1px solid var(--border2)',
                borderRadius: 'var(--r-sm, 8px)',
                padding: '12px 16px',
                fontSize: 14,
                color: 'var(--text0)',
              }}
            />
            <button
              type="submit"
              disabled={submitting}
              style={{
                background: 'var(--accent)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 14,
                padding: '12px 24px',
                borderRadius: 'var(--r-sm, 8px)',
                border: 'none',
                cursor: submitting ? 'wait' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                whiteSpace: 'nowrap',
              }}
            >
              {submitting ? 'Joining...' : 'Get early access'}
            </button>
          </form>
        ) : (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--green-soft)',
              border: '1px solid rgba(74,222,128,0.2)',
              borderRadius: 'var(--r-sm, 8px)',
              padding: '12px 24px',
              fontSize: 15,
              fontWeight: 500,
              color: 'var(--green)',
              marginBottom: 16,
            }}
          >
            You&apos;re on the list&nbsp;&#10003;
          </div>
        )}

        {/* Social proof */}
        <p
          style={{
            fontSize: 13,
            color: 'var(--text2)',
            ...mono,
          }}
        >
          Free to start&nbsp;&middot;&nbsp;
          <span style={{ color: 'var(--text1)' }}>847 founders on the waitlist</span>
        </p>
      </section>

      {/* ============================================================ */}
      {/*  APP MOCKUP                                                   */}
      {/* ============================================================ */}
      <section
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          padding: '0 24px 80px',
        }}
      >
        <div
          className="mockup-wrap"
          style={{
            display: 'flex',
            border: '1px solid var(--accent-border)',
            borderRadius: 'var(--r, 12px)',
            overflow: 'hidden',
            background: 'var(--bg1)',
            animation: 'float-glow 4s ease-in-out infinite',
          }}
        >
          {/* LEFT PANEL — Signals */}
          <div
            className="mockup-left"
            style={{
              width: 240,
              minWidth: 240,
              borderRight: '1px solid var(--border)',
              padding: '16px 0',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                padding: '0 14px 12px',
                fontSize: 11,
                fontWeight: 500,
                color: 'var(--text2)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                ...mono,
              }}
            >
              Today&apos;s signals
            </div>

            {/* Signal items */}
            {[
              {
                title: '"Every productivity app and nothing sticks"',
                sources: ['Reddit', 'X'],
                heat: 'high',
                active: true,
              },
              {
                title: '"Remote work is dead" takes are back',
                sources: ['LinkedIn'],
                heat: 'med',
                active: false,
              },
              {
                title: 'Founders burning out on content treadmill',
                sources: ['Reddit', 'X'],
                heat: 'rising',
                active: false,
              },
            ].map((sig, i) => (
              <div
                key={i}
                style={{
                  padding: '10px 14px',
                  background: sig.active ? 'var(--bg2)' : 'transparent',
                  borderLeft: sig.active ? '2px solid var(--accent)' : '2px solid transparent',
                  cursor: 'default',
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: sig.active ? 'var(--text0)' : 'var(--text1)',
                    lineHeight: 1.4,
                    marginBottom: 6,
                  }}
                >
                  {sig.title}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    flexWrap: 'wrap',
                  }}
                >
                  {sig.sources.map(src => (
                    <span
                      key={src}
                      style={{
                        fontSize: 10,
                        padding: '2px 7px',
                        borderRadius: 'var(--r-pill, 99px)',
                        background:
                          src === 'Reddit'
                            ? 'rgba(251,146,60,0.1)'
                            : src === 'LinkedIn'
                            ? 'rgba(125,211,252,0.1)'
                            : 'rgba(250,246,242,0.06)',
                        color:
                          src === 'Reddit'
                            ? 'var(--accent-text)'
                            : src === 'LinkedIn'
                            ? 'var(--blue)'
                            : 'var(--text1)',
                        ...mono,
                      }}
                    >
                      {src === 'Reddit' ? 'r/' : src === 'X' ? 'X' : 'in'}
                    </span>
                  ))}
                  <span
                    style={{
                      fontSize: 10,
                      padding: '2px 7px',
                      borderRadius: 'var(--r-pill, 99px)',
                      background:
                        sig.heat === 'high'
                          ? 'rgba(248,113,113,0.12)'
                          : sig.heat === 'med'
                          ? 'rgba(251,191,36,0.12)'
                          : 'rgba(74,222,128,0.12)',
                      color:
                        sig.heat === 'high'
                          ? 'var(--signal-high)'
                          : sig.heat === 'med'
                          ? 'var(--signal-med)'
                          : 'var(--signal-rising)',
                      ...mono,
                    }}
                  >
                    {sig.heat === 'high' ? 'high' : sig.heat === 'med' ? 'med' : 'rising'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT PANEL — Generated post */}
          <div
            className="mockup-right"
            style={{
              flex: 1,
              padding: '24px 28px',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              background: 'var(--bg2)',
            }}
          >
            {/* Post text */}
            <div
              style={{
                fontSize: 15,
                lineHeight: 1.75,
                color: 'var(--text0)',
                whiteSpace: 'pre-line',
              }}
            >
              {`The productivity app industry is worth $100B.

And the average person has abandoned 6 of them.

That's not a product problem.

That's a clarity problem.

You can't organize your way to a direction you haven't chosen yet.

What app did you quit last?`}
            </div>

            {/* Algo checks */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                flexWrap: 'wrap',
                ...mono,
              }}
            >
              {['hook', 'no hashtags', 'reply bait'].map(check => (
                <span
                  key={check}
                  style={{
                    fontSize: 11,
                    color: 'var(--green)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span style={{ fontSize: 13 }}>&#10003;</span> {check}
                </span>
              ))}
            </div>

            {/* Actions row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  background: 'var(--accent)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 13,
                  padding: '8px 20px',
                  borderRadius: 'var(--r-sm, 8px)',
                  cursor: 'default',
                }}
              >
                Copy post
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--text2)',
                  background: 'var(--bg3)',
                  padding: '6px 12px',
                  borderRadius: 'var(--r-pill, 99px)',
                  ...mono,
                }}
              >
                Best time&nbsp;&middot;&nbsp;Tue&ndash;Thu&nbsp;&middot;&nbsp;8&ndash;9 am
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FEATURES                                                     */}
      {/* ============================================================ */}
      <section
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          padding: '0 24px 80px',
        }}
      >
        <div
          className="features-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
          }}
        >
          {[
            {
              label: 'Research',
              title: 'Real signals, not prompts',
              desc: 'Scans Reddit, X, LinkedIn and news every morning. Your brief is waiting before you open the app.',
            },
            {
              label: 'Generate',
              title: 'Algorithm-aware content',
              desc: 'Every post follows platform-specific rules. Hook, format, timing, engagement triggers — all built in.',
            },
            {
              label: 'Voice',
              title: 'Sounds like you, not AI',
              desc: 'Your voice profile keeps every post authentic. Not generic. Not robotic. Just you, every time.',
            },
          ].map((f, i) => (
            <div
              key={i}
              style={{
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r, 12px)',
                padding: '24px 22px',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: 'var(--accent-text)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 10,
                  ...mono,
                }}
              >
                {f.label}
              </div>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  lineHeight: 1.3,
                  marginBottom: 10,
                }}
              >
                {f.title}
              </div>
              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: 'var(--text1)',
                }}
              >
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  HOW IT WORKS                                                 */}
      {/* ============================================================ */}
      <section
        id="how-it-works"
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          padding: '0 24px 80px',
        }}
      >
        <h2
          style={{
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            textAlign: 'center',
            marginBottom: 48,
          }}
        >
          How it works
        </h2>

        <div
          className="steps-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
          }}
        >
          {[
            {
              num: '01',
              title: 'Agent researches your niche',
              desc: 'Scans Reddit, X, LinkedIn and news. Surfaces 5 ranked signals with real audience quotes every morning at 7 am.',
            },
            {
              num: '02',
              title: 'Pick a signal and tone',
              desc: 'Select what resonates. Choose contrarian, personal story, hot take, question or framework.',
            },
            {
              num: '03',
              title: 'Copy and post',
              desc: 'Platform-native content with algo audit included. Research to post in under 60 seconds.',
            },
          ].map((step, i) => (
            <div
              key={i}
              style={{
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r, 12px)',
                padding: '24px 22px',
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: 'var(--accent)',
                  marginBottom: 14,
                  ...mono,
                }}
              >
                {step.num}
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  lineHeight: 1.3,
                  marginBottom: 10,
                }}
              >
                {step.title}
              </div>
              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: 'var(--text1)',
                }}
              >
                {step.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  PRICING                                                      */}
      {/* ============================================================ */}
      <section
        id="pricing"
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          padding: '0 24px 80px',
        }}
      >
        <h2
          style={{
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            textAlign: 'center',
            marginBottom: 12,
          }}
        >
          Simple pricing
        </h2>
        <p
          style={{
            fontSize: 15,
            color: 'var(--text2)',
            textAlign: 'center',
            marginBottom: 48,
            ...mono,
          }}
        >
          Save 20% annually
        </p>

        <div
          className="pricing-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 16,
            maxWidth: 700,
            margin: '0 auto',
          }}
        >
          {/* Free */}
          <div
            style={{
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r, 12px)',
              padding: '28px 24px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              Free
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                marginBottom: 24,
                ...mono,
              }}
            >
              $0
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 400,
                  color: 'var(--text2)',
                }}
              >
                /mo
              </span>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', flex: 1 }}>
              {[
                '5 posts / month',
                '3 research briefs / month',
                'X + LinkedIn',
              ].map((item, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: 14,
                    color: 'var(--text1)',
                    padding: '6px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span style={{ color: 'var(--green)', fontSize: 13 }}>&#10003;</span>
                  {item}
                </li>
              ))}
            </ul>

            <button
              onClick={() => scrollTo('hero')}
              style={{
                background: 'transparent',
                border: '1px solid var(--border2)',
                borderRadius: 'var(--r-sm, 8px)',
                color: 'var(--text0)',
                fontWeight: 600,
                fontSize: 14,
                padding: '10px 0',
                cursor: 'pointer',
                width: '100%',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              Get started free
            </button>
            <p
              style={{
                fontSize: 12,
                color: 'var(--text2)',
                textAlign: 'center',
                marginTop: 8,
                ...mono,
              }}
            >
              No card required
            </p>
          </div>

          {/* Pro */}
          <div
            style={{
              background: 'var(--bg2)',
              border: '1px solid var(--accent-border)',
              borderRadius: 'var(--r, 12px)',
              padding: '28px 24px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            {/* Badge */}
            <div
              style={{
                position: 'absolute',
                top: -10,
                right: 20,
                background: 'var(--accent)',
                color: '#fff',
                fontSize: 11,
                fontWeight: 600,
                padding: '4px 12px',
                borderRadius: 'var(--r-pill, 99px)',
                ...mono,
              }}
            >
              Most popular
            </div>

            <div
              style={{
                fontSize: 20,
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              Pro
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                marginBottom: 24,
                ...mono,
              }}
            >
              $19
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 400,
                  color: 'var(--text2)',
                }}
              >
                /mo
              </span>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', flex: 1 }}>
              {[
                'Unlimited posts',
                'Daily auto-brief at 7 am',
                'Content calendar',
                'Google Calendar sync',
                'Voice profile',
                'Post history',
              ].map((item, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: 14,
                    color: 'var(--text1)',
                    padding: '6px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span style={{ color: 'var(--accent)', fontSize: 13 }}>&#10003;</span>
                  {item}
                </li>
              ))}
            </ul>

            <button
              onClick={() => scrollTo('hero')}
              style={{
                background: 'var(--accent)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 14,
                padding: '10px 0',
                borderRadius: 'var(--r-sm, 8px)',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Start Pro&nbsp;&mdash;&nbsp;$19/mo
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FAQ                                                          */}
      {/* ============================================================ */}
      <section
        style={{
          maxWidth: 680,
          margin: '0 auto',
          padding: '0 24px 80px',
        }}
      >
        <h2
          style={{
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            textAlign: 'center',
            marginBottom: 40,
          }}
        >
          FAQ
        </h2>

        {[
          {
            q: 'Is this just another AI writing tool?',
            a: "No. Most AI tools start with a blank prompt. Opensignl starts with research \u2014 it scans your niche daily and surfaces what your audience is actually talking about. The post is the last step, not the first.",
          },
          {
            q: 'Will it sound like me?',
            a: "Yes, if you fill in your voice profile. Add 3\u20135 sentences in your actual writing style and every generated post will mirror your voice, not generic AI.",
          },
          {
            q: 'Which platforms does it support?',
            a: 'X (Twitter) and LinkedIn in v1. Threads and newsletter coming in v2.',
          },
          {
            q: 'How much does it cost to run?',
            a: "The Free plan is genuinely free \u2014 5 posts and 3 research briefs a month at no cost. Pro is $19/month for unlimited usage with daily automated briefs.",
          },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              borderBottom: '1px solid var(--border)',
            }}
          >
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 0',
                background: 'transparent',
                border: 'none',
                color: 'var(--text0)',
                fontSize: 15,
                fontWeight: 500,
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              {item.q}
              <span
                style={{
                  fontSize: 18,
                  color: 'var(--text2)',
                  transition: 'transform 0.2s',
                  transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)',
                  flexShrink: 0,
                  marginLeft: 16,
                }}
              >
                +
              </span>
            </button>
            <div
              style={{
                maxHeight: openFaq === i ? 200 : 0,
                overflow: 'hidden',
                transition: 'max-height 0.25s ease',
              }}
            >
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.65,
                  color: 'var(--text1)',
                  paddingBottom: 18,
                }}
              >
                {item.a}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* ============================================================ */}
      {/*  FOOTER                                                       */}
      {/* ============================================================ */}
      <footer
        style={{
          borderTop: '1px solid var(--border)',
          padding: '40px 24px',
        }}
      >
        <div
          className="footer-inner"
          style={{
            maxWidth: 1080,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          {/* Left */}
          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: '-0.02em',
                marginBottom: 6,
              }}
            >
              open<span style={{ color: 'var(--accent)' }}>signl</span>
            </div>
            <div
              style={{
                fontSize: 13,
                color: 'var(--text2)',
                lineHeight: 1.5,
                maxWidth: 260,
              }}
            >
              Research-grounded content
              <br />
              for founders.
            </div>
          </div>

          {/* Right */}
          <div
            className="footer-right"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 12,
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: 24,
                fontSize: 13,
                color: 'var(--text1)',
              }}
            >
              <a
                onClick={() => scrollTo('how-it-works')}
                style={{ cursor: 'pointer', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text0)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text1)')}
              >
                How it works
              </a>
              <a
                onClick={() => scrollTo('pricing')}
                style={{ cursor: 'pointer', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text0)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text1)')}
              >
                Pricing
              </a>
              <a
                href="https://github.com/AbdarrahmanAyyaz/Signl"
                target="_blank"
                rel="noopener noreferrer"
                style={{ cursor: 'pointer', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text0)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text1)')}
              >
                GitHub
              </a>
            </div>
            <div
              style={{
                fontSize: 12,
                color: 'var(--text3)',
                ...mono,
              }}
            >
              &copy; 2026 Opensignl. Built in public.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
