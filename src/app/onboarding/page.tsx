'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [topic, setTopic] = useState('')
  const [audience, setAudience] = useState('')
  const [voiceExamples, setVoiceExamples] = useState('')
  const [xHandle, setXHandle] = useState('')
  const [linkedinHandle, setLinkedinHandle] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const mono: React.CSSProperties = {
    fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
  }

  async function handleFinish() {
    setIsLoading(true)
    try {
      await fetch('/api/niche', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche: {
            name: topic,
            topic,
            audience,
            voiceExamples: voiceExamples.split('\n').filter(Boolean),
            xHandle: xHandle || undefined,
            linkedinHandle: linkedinHandle || undefined,
            toneDefault: 'contrarian',
          },
          refreshNow: true,
        }),
      })
      await fetch('/api/research', { method: 'POST' })
      if (xHandle || linkedinHandle) {
        fetch('/api/profile', { method: 'POST' })
      }
      router.push('/app')
    } catch {
      router.push('/app')
    }
  }

  function handleSkip() {
    handleFinish()
  }

  // Loading state
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--bg0)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: '3px solid var(--border2)',
            borderTopColor: 'var(--accent)',
            borderRadius: '50%',
            animation: 'spin 0.9s linear infinite',
          }}
        />
        <h3
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: 'var(--text0)',
          }}
        >
          Researching your niche
        </h3>
        <p
          style={{
            fontSize: 15,
            color: 'var(--text1)',
            ...mono,
          }}
        >
          Scanning Reddit &middot; X &middot; LinkedIn &middot; news
        </p>
        <p
          style={{
            fontSize: 13,
            color: 'var(--text2)',
            marginTop: 8,
          }}
        >
          This takes about 30 seconds. Only happens once a day after this.
        </p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  const progressDots = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
      }}
    >
      {[1, 2, 3].map(i => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: i <= step ? 'var(--accent)' : 'var(--border2)',
            transition: 'background 0.2s',
          }}
        />
      ))}
      <span
        style={{
          fontSize: 12,
          color: 'var(--text2)',
          marginLeft: 8,
          ...mono,
        }}
      >
        Step {step} of 3
      </span>
    </div>
  )

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '36px 32px',
    width: '100%',
    maxWidth: 480,
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--text0)',
    marginBottom: 8,
    display: 'block',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg1)',
    border: '1px solid var(--border2)',
    borderRadius: 8,
    padding: '12px 14px',
    fontSize: 14,
    color: 'var(--text0)',
    outline: 'none',
  }

  const btnPrimary: React.CSSProperties = {
    background: 'var(--accent)',
    color: '#fff',
    fontWeight: 600,
    fontSize: 14,
    padding: '10px 24px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
  }

  const btnSecondary: React.CSSProperties = {
    background: 'transparent',
    color: 'var(--text1)',
    fontWeight: 500,
    fontSize: 14,
    padding: '10px 18px',
    borderRadius: 8,
    border: '1px solid var(--border2)',
    cursor: 'pointer',
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg0)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        gap: 24,
      }}
    >
      {/* Logo mark */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #fb923c, #ea580c)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 16,
          fontWeight: 600,
          fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
        }}
      >
        S
      </div>

      {/* Step 1 — Your niche */}
      {step === 1 && (
        <div style={cardStyle}>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--text0)',
              marginBottom: 6,
            }}
          >
            Welcome to Opensignl
          </h2>
          <p
            style={{
              fontSize: 14,
              color: 'var(--text1)',
              marginBottom: 24,
              lineHeight: 1.5,
            }}
          >
            Set up your research brief. Takes about 60 seconds.
          </p>

          {progressDots}
          <p
            style={{
              fontSize: 13,
              color: 'var(--text2)',
              marginBottom: 24,
              ...mono,
            }}
          >
            Your niche
          </p>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>What do you post about?</label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. AI tools for developers, B2B SaaS growth, personal finance..."
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>Who&apos;s your audience?</label>
            <input
              type="text"
              value={audience}
              onChange={e => setAudience(e.target.value)}
              placeholder="Be specific — the more precise, the better your signals"
              style={inputStyle}
            />
          </div>

          <button
            onClick={() => {
              if (topic && audience) setStep(2)
            }}
            style={{
              ...btnPrimary,
              width: '100%',
              opacity: topic && audience ? 1 : 0.5,
              cursor: topic && audience ? 'pointer' : 'not-allowed',
            }}
          >
            Continue &rarr;
          </button>
        </div>
      )}

      {/* Step 2 — Your voice */}
      {step === 2 && (
        <div style={cardStyle}>
          {progressDots}
          <p
            style={{
              fontSize: 13,
              color: 'var(--text2)',
              marginBottom: 24,
              ...mono,
            }}
          >
            Your voice
          </p>

          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--text0)',
              marginBottom: 8,
            }}
          >
            How do you actually write?
          </h2>
          <p
            style={{
              fontSize: 14,
              color: 'var(--text1)',
              marginBottom: 24,
              lineHeight: 1.5,
            }}
          >
            Add 2&ndash;3 sentences from something you&apos;ve written that you&apos;re proud of.
            These teach Opensignl how you sound &mdash; not how you think you sound.
          </p>

          <textarea
            value={voiceExamples}
            onChange={e => setVoiceExamples(e.target.value)}
            placeholder={"Paste a sentence or two from a post, email, or message you wrote that felt natural and true to how you actually write..."}
            rows={6}
            style={{
              ...inputStyle,
              resize: 'vertical',
              minHeight: 140,
              lineHeight: 1.6,
              marginBottom: 12,
            }}
          />
          <p
            style={{
              fontSize: 12,
              color: 'var(--text2)',
              lineHeight: 1.5,
              marginBottom: 28,
            }}
          >
            The more specific and honest, the better. Generic descriptions like
            &ldquo;professional but friendly&rdquo; don&apos;t help &mdash; real examples do.
          </p>

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setStep(1)} style={btnSecondary}>
              &larr; Back
            </button>
            <button
              onClick={() => setStep(3)}
              style={{
                ...btnPrimary,
                flex: 1,
              }}
            >
              Continue &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Your accounts (optional) */}
      {step === 3 && (
        <div style={cardStyle}>
          {progressDots}
          <p
            style={{
              fontSize: 13,
              color: 'var(--text2)',
              marginBottom: 24,
              ...mono,
            }}
          >
            Your accounts (optional)
          </p>

          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--text0)',
              marginBottom: 8,
            }}
          >
            Connect your accounts
          </h2>
          <p
            style={{
              fontSize: 14,
              color: 'var(--text1)',
              marginBottom: 24,
              lineHeight: 1.5,
            }}
          >
            So Opensignl can write in continuity with your existing content &mdash; matching
            your style and avoiding what you&apos;ve already said.
          </p>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>X (Twitter) handle</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              <div
                style={{
                  background: 'var(--bg3)',
                  border: '1px solid var(--border2)',
                  borderRight: 'none',
                  borderRadius: '8px 0 0 8px',
                  padding: '12px 12px',
                  fontSize: 14,
                  color: 'var(--text2)',
                  ...mono,
                }}
              >
                @
              </div>
              <input
                type="text"
                value={xHandle}
                onChange={e => setXHandle(e.target.value)}
                placeholder="yourhandle"
                style={{
                  ...inputStyle,
                  borderRadius: '0 8px 8px 0',
                  flex: 1,
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>LinkedIn profile</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              <div
                style={{
                  background: 'var(--bg3)',
                  border: '1px solid var(--border2)',
                  borderRight: 'none',
                  borderRadius: '8px 0 0 8px',
                  padding: '12px 10px',
                  fontSize: 13,
                  color: 'var(--text2)',
                  whiteSpace: 'nowrap',
                  ...mono,
                }}
              >
                linkedin.com/in/
              </div>
              <input
                type="text"
                value={linkedinHandle}
                onChange={e => setLinkedinHandle(e.target.value)}
                placeholder="your-name"
                style={{
                  ...inputStyle,
                  borderRadius: '0 8px 8px 0',
                  flex: 1,
                }}
              />
            </div>
          </div>

          <p
            style={{
              fontSize: 12,
              color: 'var(--text2)',
              marginBottom: 28,
              lineHeight: 1.5,
            }}
          >
            Opensignl only reads your public posts. No login required.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={() => setStep(2)} style={btnSecondary}>
              &larr; Back
            </button>
            {!(xHandle || linkedinHandle) ? (
              <button
                onClick={handleSkip}
                style={{
                  ...btnPrimary,
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid var(--accent-border)',
                  color: 'var(--accent-text)',
                }}
              >
                Skip for now &rarr;
              </button>
            ) : (
              <button
                onClick={handleFinish}
                style={{
                  ...btnPrimary,
                  flex: 1,
                }}
              >
                Finish setup &rarr;
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
