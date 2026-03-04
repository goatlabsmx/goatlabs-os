import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Topbar from '../components/layout/Topbar'
import StatusBadge from '../components/ui/StatusBadge'
import TaskCountChips from '../components/ui/TaskCountChips'
import NewProjectDialog from '../components/portfolio/NewProjectDialog'
import { useProjects } from '../hooks/useProjects'
import { useAllTaskCounts } from '../hooks/useTasks'
import type { ProjectStatus } from '../types'

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

const statusIconColor: Record<ProjectStatus, string> = {
  Activo: c.green,
  Validando: c.blue,
  Pausado: c.amber,
  Descontinuado: c.red,
}

export default function Portfolio() {
  const navigate = useNavigate()
  const { data: projects } = useProjects()
  const { data: taskCounts } = useAllTaskCounts()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [hoveredBtn, setHoveredBtn] = useState(false)

  const activeCount = projects?.filter(p => p.status === 'Activo' || p.status === 'Validando').length ?? 0
  const usersTotal = projects?.reduce((s, p) => s + (p.active_users ?? 0), 0) ?? 0
  const mrrTotal = projects?.reduce((s, p) => s + (p.mrr ?? 0), 0) ?? 0

  const { totalPending, totalOverdue } = useMemo(() => {
    if (!taskCounts) return { totalPending: 0, totalOverdue: 0 }
    let pending = 0
    let overdue = 0
    for (const entry of Object.values(taskCounts)) {
      pending += entry.gtm + entry.dev
      if (entry.hasOverdue) overdue++
    }
    return { totalPending: pending, totalOverdue: overdue }
  }, [taskCounts])

  const blockerProjects = projects?.filter(p => p.main_blocker) ?? []

  const kpis = [
    { label: 'Proyectos activos', value: String(activeCount), color: c.green, sub: null },
    { label: 'Tareas pendientes', value: String(totalPending), color: c.text, sub: totalOverdue > 0 ? `${totalOverdue} proyecto${totalOverdue !== 1 ? 's' : ''} con vencidas` : null, subColor: c.red },
    { label: 'Usuarios totales', value: String(usersTotal), color: c.text, sub: null },
    { label: 'MRR Total', value: `$${mrrTotal.toLocaleString()}`, color: c.accent, sub: null },
  ]

  const thStyle: React.CSSProperties = {
    fontSize: 9.5,
    fontFamily: 'monospace',
    color: c.dim,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    padding: '10px 13px',
    borderBottom: `1px solid ${c.border}`,
    textAlign: 'left',
    fontWeight: 600,
  }

  return (
    <div>
      <Topbar
        title="Portfolio"
        rightContent={
          <>
            <span style={{ fontSize: 12, color: c.muted }}>{projects?.length ?? 0} proyectos</span>
            <button
              onMouseEnter={() => setHoveredBtn(true)}
              onMouseLeave={() => setHoveredBtn(false)}
              onClick={() => setDialogOpen(true)}
              style={{
                border: `1px solid ${c.border2}`,
                background: hoveredBtn ? c.surface2 : 'transparent',
                color: hoveredBtn ? c.text : c.muted,
                borderRadius: 6,
                padding: '5px 12px',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.12s',
              }}
            >
              + Nuevo proyecto
            </button>
          </>
        }
      />

      <div style={{ padding: '22px 26px', maxWidth: 1200 }}>
        {/* KPI Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 11, marginBottom: 18 }}>
          {kpis.map(kpi => (
            <div
              key={kpi.label}
              style={{
                background: c.surface,
                border: `1px solid ${c.border}`,
                borderRadius: 10,
                padding: '13px 15px',
              }}
            >
              <div style={{ fontSize: 9.5, fontFamily: 'monospace', color: c.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                {kpi.label}
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -1, color: kpi.color, fontFamily: 'Georgia, serif' }}>
                {kpi.value}
              </div>
              {kpi.sub && (
                <div style={{ fontSize: 10, color: kpi.subColor ?? c.muted, marginTop: 3 }}>{kpi.sub}</div>
              )}
            </div>
          ))}
        </div>

        {/* Blockers */}
        {blockerProjects.length > 0 && (
          <div
            style={{
              background: 'rgba(239,68,68,0.05)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 10,
              padding: 16,
              marginBottom: 18,
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 10,
              fontSize: 10,
              fontWeight: 700,
              color: c.red,
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              letterSpacing: 0.8,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Bloqueos activos — {blockerProjects.length} proyecto{blockerProjects.length !== 1 ? 's' : ''}
            </div>
            {blockerProjects.map(p => (
              <div
                key={p.id}
                onClick={() => navigate(`/project/${p.id}`)}
                style={{ display: 'flex', gap: 10, padding: '5px 0', fontSize: 12.5, lineHeight: 1.5, cursor: 'pointer' }}
              >
                <span style={{ fontWeight: 600, color: c.muted, minWidth: 120, flexShrink: 0 }}>{p.name}</span>
                <span style={{ color: c.text }}>{p.main_blocker}</span>
              </div>
            ))}
          </div>
        )}

        {/* Projects table */}
        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 10, overflow: 'hidden' }}>
          {!projects || projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: c.muted, fontSize: 13 }}>
              No hay proyectos aún. Crea el primero →
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Proyecto</th>
                  <th style={thStyle}>Estado</th>
                  <th style={thStyle}>North Star</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Usuarios</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>MRR</th>
                  <th style={thStyle}>Tareas</th>
                  <th style={thStyle}>Próximo hito</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p, i) => {
                  const isLast = i === projects.length - 1
                  const hovered = hoveredRow === p.id
                  const iconColor = statusIconColor[p.status] ?? c.muted
                  return (
                    <tr
                      key={p.id}
                      onClick={() => navigate(`/project/${p.id}`)}
                      onMouseEnter={() => setHoveredRow(p.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{
                        borderBottom: isLast ? 'none' : `1px solid ${c.border}`,
                        cursor: 'pointer',
                        background: hovered ? c.surface2 : 'transparent',
                        transition: 'background 0.1s',
                      }}
                    >
                      {/* Proyecto */}
                      <td style={{ padding: '11px 13px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: 6,
                              background: `${iconColor}18`,
                              color: iconColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 12,
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: 12.5, fontWeight: 600, color: c.text }}>{p.name}</div>
                            {p.url && (
                              <div style={{ fontSize: 10, color: c.muted, marginTop: 1 }}>{p.url}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      {/* Estado */}
                      <td style={{ padding: '11px 13px', verticalAlign: 'middle' }}>
                        <StatusBadge status={p.status} />
                      </td>
                      {/* North Star */}
                      <td style={{ padding: '11px 13px', verticalAlign: 'middle', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, color: c.muted }}>
                        {p.north_star_metric ?? '—'}
                      </td>
                      {/* Usuarios */}
                      <td style={{ padding: '11px 13px', verticalAlign: 'middle', textAlign: 'right', fontFamily: 'monospace', fontSize: 12, color: c.text }}>
                        {p.active_users}
                      </td>
                      {/* MRR */}
                      <td style={{ padding: '11px 13px', verticalAlign: 'middle', textAlign: 'right', fontFamily: 'monospace', fontSize: 12, color: p.mrr > 0 ? c.text : c.muted }}>
                        ${p.mrr.toLocaleString()}
                      </td>
                      {/* Tareas */}
                      <td style={{ padding: '11px 13px', verticalAlign: 'middle' }}>
                        <TaskCountChips projectId={p.id} />
                      </td>
                      {/* Próximo hito */}
                      <td style={{ padding: '11px 13px', verticalAlign: 'middle', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 11, color: c.muted }}>
                        {p.next_milestone ?? '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <NewProjectDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  )
}
