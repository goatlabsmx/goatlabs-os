import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

const ADMIN_EMAIL = 'danielsal.neg@gmail.com'
const TIMEOUT_MS = 8000

export default function AllowlistGuard({ children }: { children: ReactNode }) {
  const { user, loading: authLoading, signOut } = useAuth()
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const checkedRef = useRef(false)

  useEffect(() => {
    if (authLoading || !user?.email || checkedRef.current) return
    checkedRef.current = true

    const timer = setTimeout(() => {
      if (allowed !== null) return
      signOut()
      toast.error('Tiempo de espera agotado — intenta de nuevo')
    }, TIMEOUT_MS)

    supabase
      .from('allowed_users')
      .select('id')
      .ilike('email', user.email.toLowerCase())
      .then(({ data, error }) => {
        clearTimeout(timer)

        if (error) {
          signOut()
          toast.error('Error al verificar acceso')
          return
        }

        if (data && data.length > 0) {
          setAllowed(true)
        } else {
          signOut()
          toast.error(`Acceso restringido — solicita invitación a ${ADMIN_EMAIL}`)
        }
      })

    return () => clearTimeout(timer)
  }, [authLoading, user, signOut, allowed])

  if (authLoading || (user && allowed === null)) {
    return (
      <div
        style={{
          background: '#0a0a0b',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: '3px solid #1e1e24',
            borderTopColor: '#00D4D8',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (!user) return <Navigate to="/auth" replace />

  return <>{children}</>
}
