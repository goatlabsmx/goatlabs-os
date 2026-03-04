import { useState } from 'react'
import { toast } from 'sonner'
import Topbar from '../components/layout/Topbar'
import { useAuth } from '../hooks/useAuth'
import { useAllowedUsers, useAddAllowedUser, useRemoveAllowedUser } from '../hooks/useAllowedUsers'
import { format } from 'date-fns'

const ADMIN_EMAIL = 'danielsal.neg@gmail.com'

const c = {
  bg: '#0a0a0b',
  surface: '#111114',
  surface2: '#18181d',
  border: '#1e1e24',
  border2: '#2a2a33',
  text: '#e8e8f0',
  muted: '#6b6b7e',
  dim: '#3a3a48',
  accent: '#00D4D8',
  red: '#ef4444',
}

export default function Invitations() {
  const { user } = useAuth()
  const { data: users } = useAllowedUsers()
  const addUser = useAddAllowedUser()
  const removeUser = useRemoveAllowedUser()

  const [email, setEmail] = useState('')
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  if (user?.email !== ADMIN_EMAIL) {
    return (
      <div>
        <Topbar title="Invitaciones" />
        <div style={{ padding: '60px 26px', textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: c.text, marginBottom: 8 }}>Acceso restringido</div>
          <div style={{ fontSize: 13, color: c.muted }}>Solo el administrador puede gestionar invitaciones.</div>
        </div>
      </div>
    )
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim().toLowerCase()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error('Ingresa un email válido')
      return
    }
    if (users?.some(u => u.email.toLowerCase() === trimmed)) {
      toast.error('Este email ya tiene acceso')
      return
    }
    try {
      await addUser.mutateAsync(trimmed)
      toast.success(`Acceso concedido a ${trimmed}`)
      setEmail('')
    } catch {
      toast.error('Error al agregar usuario')
    }
  }

  const handleRemove = (id: string, targetEmail: string) => {
    if (targetEmail.toLowerCase() === ADMIN_EMAIL) {
      toast.error('No puedes eliminar tu propio acceso')
      return
    }
    if (!confirm(`¿Eliminar acceso a ${targetEmail}?`)) return
    removeUser.mutate(id, {
      onSuccess: () => toast.success(`Acceso eliminado para ${targetEmail}`),
      onError: () => toast.error('Error al eliminar'),
    })
  }

  const thStyle: React.CSSProperties = {
    fontSize: 9.5, fontFamily: 'monospace', color: c.dim, textTransform: 'uppercase',
    letterSpacing: '0.07em', padding: '10px 13px', borderBottom: `1px solid ${c.border}`, textAlign: 'left', fontWeight: 600,
  }

  return (
    <div>
      <Topbar title="Invitaciones" />
      <div style={{ padding: '22px 26px', maxWidth: 700 }}>
        {/* Add user */}
        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 10, padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontFamily: 'monospace', color: c.dim, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10, fontWeight: 600 }}>
            Agregar usuario
          </div>
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8 }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@ejemplo.com"
              required
              style={{
                flex: 1, padding: '8px 10px', background: c.surface2, border: `1px solid ${c.border}`,
                borderRadius: 6, color: c.text, fontSize: 12.5, outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = c.accent)}
              onBlur={e => (e.currentTarget.style.borderColor = c.border)}
            />
            <button
              type="submit"
              disabled={addUser.isPending}
              style={{
                background: c.accent, color: c.bg, border: 'none', borderRadius: 6,
                padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: addUser.isPending ? 'not-allowed' : 'pointer',
                opacity: addUser.isPending ? 0.6 : 1,
              }}
            >
              {addUser.isPending ? 'Agregando…' : 'Agregar'}
            </button>
          </form>
        </div>

        {/* Users list */}
        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '12px 13px 0', fontSize: 10, fontFamily: 'monospace', color: c.dim, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
            Usuarios con acceso ({users?.length ?? 0})
          </div>
          {!users || users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: c.muted, fontSize: 13 }}>
              Sin usuarios registrados
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
              <thead>
                <tr>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Fecha de acceso</th>
                  <th style={{ ...thStyle, width: 40 }} />
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  const isLast = i === users.length - 1
                  const hovered = hoveredId === u.id
                  const isAdmin = u.email.toLowerCase() === ADMIN_EMAIL
                  return (
                    <tr
                      key={u.id}
                      onMouseEnter={() => setHoveredId(u.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      style={{ borderBottom: isLast ? 'none' : `1px solid ${c.border}`, background: hovered ? c.surface2 : 'transparent' }}
                    >
                      <td style={{ padding: '10px 13px', fontSize: 12.5, color: c.text }}>
                        {u.email}
                        {isAdmin && <span style={{ fontSize: 9, color: c.accent, marginLeft: 6, fontFamily: 'monospace' }}>ADMIN</span>}
                      </td>
                      <td style={{ padding: '10px 13px', fontSize: 11, color: c.muted }}>
                        {u.created_at ? format(new Date(u.created_at), 'dd/MM/yyyy') : '—'}
                      </td>
                      <td style={{ padding: '10px 13px', textAlign: 'center' }}>
                        {hovered && !isAdmin && (
                          <button
                            onClick={() => handleRemove(u.id, u.email)}
                            style={{ background: 'none', border: 'none', color: c.red, cursor: 'pointer', fontSize: 14, lineHeight: 1 }}
                          >
                            ×
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
