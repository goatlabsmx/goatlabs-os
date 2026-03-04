import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../hooks/useAuth'

const c = {
  bg: '#0a0a0b',
  surface: '#111114',
  border: '#1e1e24',
  text: '#e8e8f0',
  muted: '#6b6b7e',
  accent: '#00D4D8',
}

export default function Auth() {
  const { user, loading, signInWithGoogle, signInWithMagicLink } = useAuth()
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  if (loading) {
    return (
      <div style={{ background: c.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            width: 32,
            height: 32,
            border: `3px solid ${c.border}`,
            borderTopColor: c.accent,
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (user) return <Navigate to="/" replace />

  const handleGoogle = async () => {
    const { error } = await signInWithGoogle()
    if (error) toast.error(error.message)
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setSending(true)
    const { error } = await signInWithMagicLink(email.trim())
    setSending(false)
    if (error) {
      toast.error(error.message)
    } else {
      setMagicLinkSent(true)
    }
  }

  return (
    <div
      style={{
        background: c.bg,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          background: c.surface,
          border: `1px solid ${c.border}`,
          borderRadius: 16,
          padding: '48px 40px',
          width: '100%',
          maxWidth: 400,
          margin: '0 16px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img
            src="/goatlabs-logo.jpeg"
            alt="GoatLabs"
            style={{ height: 52, objectFit: 'contain', borderRadius: 10, marginBottom: 12 }}
          />
          <div style={{ fontSize: 28, fontWeight: 700, color: c.text, marginBottom: 4 }}>
            GoatLabs OS
          </div>
          <div style={{ fontSize: 14, color: c.muted }}>One-Man Unicorn OS</div>
        </div>

        {magicLinkSent ? (
          <div
            style={{
              background: 'rgba(0, 212, 216, 0.08)',
              border: '1px solid rgba(0, 212, 216, 0.2)',
              borderRadius: 10,
              padding: '20px 16px',
              textAlign: 'center',
              color: c.text,
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            Revisa tu correo — te enviamos un link de acceso
          </div>
        ) : (
          <>
            <button
              onClick={handleGoogle}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: c.text,
                color: c.bg,
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: 24,
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Continuar con Google
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 24,
              }}
            >
              <div style={{ flex: 1, height: 1, background: c.border }} />
              <span style={{ fontSize: 12, color: c.muted, textTransform: 'uppercase', letterSpacing: 1 }}>
                o
              </span>
              <div style={{ flex: 1, height: 1, background: c.border }} />
            </div>

            <form onSubmit={handleMagicLink}>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: c.bg,
                  color: c.text,
                  border: `1px solid ${c.border}`,
                  borderRadius: 10,
                  fontSize: 14,
                  outline: 'none',
                  marginBottom: 12,
                  boxSizing: 'border-box',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = c.accent)}
                onBlur={e => (e.currentTarget.style.borderColor = c.border)}
              />
              <button
                type="submit"
                disabled={sending}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: c.accent,
                  color: '#0a0a0b',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: sending ? 'not-allowed' : 'pointer',
                  opacity: sending ? 0.6 : 1,
                  transition: 'opacity 0.15s',
                }}
              >
                {sending ? 'Enviando…' : 'Enviar magic link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
