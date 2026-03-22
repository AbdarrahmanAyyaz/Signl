'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'

// SVG icons for sidebar nav
function BriefIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

const NAV_ITEMS = [
  { href: '/app', icon: BriefIcon, label: 'Brief' },
  { href: '/app/history', icon: CalendarIcon, label: 'History' },
  { href: '/app/settings', icon: SettingsIcon, label: 'Settings' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      style={{
        width: 56,
        height: '100vh',
        background: 'var(--bg1)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 16,
        gap: 4,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        title="opensignl"
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #fb923c, #ea580c)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 14,
          fontWeight: 500,
          fontFamily: 'var(--font-geist-mono), "Geist Mono", monospace',
          marginBottom: 20,
        }}
      >
        S
      </div>

      {/* Nav items */}
      {NAV_ITEMS.map(item => {
        const isActive = item.href === '/app'
          ? pathname === '/app'
          : pathname.startsWith(item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isActive ? 'var(--accent)' : 'var(--text2)',
              background: isActive ? 'var(--accent-soft)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.15s',
            }}
          >
            <Icon />
          </Link>
        )
      })}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* User avatar */}
      <div style={{ paddingBottom: 16 }}>
        <UserButton
          appearance={{
            variables: {
              colorPrimary: '#fb923c',
              colorBackground: '#262119',
            },
            elements: {
              avatarBox: {
                width: '30px',
                height: '30px',
                borderRadius: '50%',
              },
            },
          }}
        />
      </div>
    </aside>
  )
}
