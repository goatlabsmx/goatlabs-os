import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useProjects } from '../../hooks/useProjects'
import { useAllTaskCounts } from '../../hooks/useTasks'
import type { ProjectStatus } from '../../types'

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
  green: '#22c55e',
  amber: '#f59e0b',
  red: '#ef4444',
  blue: '#3b82f6',
}

const statusColors: Record<ProjectStatus, string> = {
  Activo: c.green,
  Validando: c.blue,
  Pausado: c.amber,
  Descontinuado: c.muted,
}

const ClockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
)
const GridIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
  </svg>
)
const ListIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
)
const CalendarIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)
const LogoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

const navItems = [
  { label: 'Hoy', path: '/', icon: ClockIcon },
  { label: 'Portfolio', path: '/portfolio', icon: GridIcon },
  { label: 'Todas las tareas', path: '/tasks', icon: ListIcon },
  { label: 'Calendario', path: '/calendar', icon: CalendarIcon },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut } = useAuth()
  const { data: projects } = useProjects()
  const { data: taskCounts } = useAllTaskCounts()
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)
  const [hoveredProject, setHoveredProject] = useState<string | null>(null)
  const [showLogout, setShowLogout] = useState(false)

  const overdueTaskCount = taskCounts
    ? Object.values(taskCounts).reduce((sum, c) => {
        return sum + (c.hasOverdue ? c.gtm + c.dev : 0)
      }, 0)
    : 0

  const userEmail = user?.email ?? ''
  const initial = userEmail.charAt(0).toUpperCase()

  return (
    <aside
      style={{
        width: 216,
        minWidth: 216,
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: c.surface,
        borderRight: `1px solid ${c.border}`,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: `1px solid ${c.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <img
          src="/goatlabs-logo.jpeg"
          alt="GoatLabs"
          style={{ height: 32, objectFit: 'contain', borderRadius: 6 }}
        />
        <span style={{ color: c.accent, fontFamily: 'monospace', fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
          OS
        </span>
      </div>

      {/* Nav */}
      <div style={{ padding: '12px 10px 4px' }}>
        <div style={{ fontSize: 9, fontWeight: 600, color: c.dim, textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: 1.2, padding: '0 8px', marginBottom: 6 }}>
          Vista
        </div>
        {navItems.map(item => {
          const active = location.pathname === item.path
          const hovered = hoveredNav === item.path
          const Icon = item.icon
          return (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              onMouseEnter={() => setHoveredNav(item.path)}
              onMouseLeave={() => setHoveredNav(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 8px',
                borderRadius: 6,
                fontSize: 12.5,
                cursor: 'pointer',
                color: active ? c.accent : hovered ? c.text : c.muted,
                background: active ? 'rgba(0,212,216,0.1)' : hovered ? c.surface2 : 'transparent',
                transition: 'all 0.12s',
                marginBottom: 1,
                position: 'relative',
              }}
            >
              <Icon />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.path === '/tasks' && overdueTaskCount > 0 && (
                <span
                  style={{
                    background: c.red,
                    color: '#fff',
                    fontSize: 9,
                    fontWeight: 700,
                    borderRadius: 8,
                    padding: '1px 5px',
                    minWidth: 14,
                    textAlign: 'center',
                    lineHeight: '14px',
                  }}
                >
                  {overdueTaskCount}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Projects */}
      <div style={{ padding: '8px 10px 4px' }}>
        <div style={{ fontSize: 9, fontWeight: 600, color: c.dim, textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: 1.2, padding: '0 8px', marginBottom: 6 }}>
          Proyectos
        </div>
        {projects?.map(p => {
          const active = location.pathname === `/project/${p.id}`
          const hovered = hoveredProject === p.id
          return (
            <div
              key={p.id}
              onClick={() => navigate(`/project/${p.id}`)}
              onMouseEnter={() => setHoveredProject(p.id)}
              onMouseLeave={() => setHoveredProject(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 8px',
                borderRadius: 6,
                fontSize: 12,
                cursor: 'pointer',
                color: active || hovered ? c.text : c.muted,
                background: active ? c.surface2 : hovered ? c.surface2 : 'transparent',
                transition: 'all 0.12s',
                marginBottom: 1,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: statusColors[p.status] ?? c.muted,
                  flexShrink: 0,
                }}
              />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.name}
              </span>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 'auto', borderTop: `1px solid ${c.border}`, padding: '10px 12px' }}>
        {userEmail === ADMIN_EMAIL && (
          <div
            onClick={() => navigate('/invitations')}
            style={{
              fontSize: 11,
              color: c.accent,
              cursor: 'pointer',
              padding: '4px 6px',
              marginBottom: 6,
              borderRadius: 4,
            }}
          >
            Invitaciones
          </div>
        )}
        <div
          onMouseEnter={() => setShowLogout(true)}
          onMouseLeave={() => setShowLogout(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 4px',
            borderRadius: 6,
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: c.accent,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {initial}
          </div>
          <span
            style={{
              flex: 1,
              fontSize: 11,
              color: c.muted,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {userEmail}
          </span>
          {showLogout && (
            <button
              onClick={e => { e.stopPropagation(); signOut() }}
              style={{
                background: 'none',
                border: 'none',
                color: c.muted,
                cursor: 'pointer',
                padding: 2,
                display: 'flex',
                flexShrink: 0,
              }}
            >
              <LogoutIcon />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
