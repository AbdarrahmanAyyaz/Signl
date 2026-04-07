import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="auth-page">
      <div className="auth-logo">
        open<span>signl</span>
      </div>
      <SignIn
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
            headerTitle: { color: '#faf6f2' },
            headerSubtitle: { color: '#b5a99e' },
            formFieldLabel: { color: '#b5a99e' },
            formFieldInput: { color: '#faf6f2', background: '#161310', borderColor: '#2c2420' },
            dividerLine: { borderColor: '#2c2420' },
            dividerText: { color: '#6e5f56' },
            formButtonPrimary: {
              background: '#fb923c',
              color: '#0f0d0b',
              '&:hover': { opacity: 0.9 },
            },
            socialButtonsBlockButton: {
              background: '#161310',
              border: '1px solid #2c2420',
              color: '#faf6f2',
              '&:hover': { background: '#1e1a16' },
            },
            socialButtonsBlockButtonText: { color: '#faf6f2' },
            footerActionText: { color: '#b5a99e' },
            footerActionLink: { color: '#fdba74' },
            footer: { color: '#6e5f56' },
            footerPages: { color: '#6e5f56' },
            footerPagesLink: { color: '#6e5f56' },
            identityPreview: { background: '#161310', border: '1px solid #2c2420' },
            identityPreviewText: { color: '#faf6f2' },
            identityPreviewEditButton: { color: '#fdba74' },
            alternativeMethodsBlockButton: { color: '#b5a99e', border: '1px solid #2c2420' },
            otpCodeFieldInput: { color: '#faf6f2', borderColor: '#2c2420' },
          },
        }}
      />
    </div>
  )
}
