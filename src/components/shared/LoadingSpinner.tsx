'use client'

export default function LoadingSpinner({ size = 20 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: '2px solid var(--border2)',
        borderTopColor: 'var(--accent)',
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite',
      }}
    />
  )
}
