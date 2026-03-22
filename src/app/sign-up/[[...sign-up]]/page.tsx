import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="auth-page">
      <div className="auth-logo">
        open<span>signl</span>
      </div>
      <SignUp
        appearance={{
          variables: {
            colorPrimary: '#fb923c',
            colorBackground: '#1e1a16',
            colorInputBackground: '#161310',
            colorInputText: '#faf6f2',
            colorText: '#faf6f2',
            colorTextSecondary: '#b5a99e',
            borderRadius: '8px',
            fontFamily: 'Geist, system-ui, sans-serif',
          },
          elements: {
            card: {
              background: '#1e1a16',
              border: '1px solid #2c2420',
              borderRadius: '12px',
              boxShadow: 'none',
            },
            formButtonPrimary: {
              background: '#fb923c',
              '&:hover': { opacity: 0.9 },
            },
            footerActionLink: { color: '#fdba74' },
          },
        }}
      />
    </div>
  )
}
