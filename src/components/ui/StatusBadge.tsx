import type { ProjectStatus } from '../../types'

const config: Record<ProjectStatus, { bg: string; color: string; label: string }> = {
  Activo: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e', label: '● Activo' },
  Validando: { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6', label: '◉ Validando' },
  Pausado: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', label: '⏸ Pausado' },
  Descontinuado: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', label: '✕ Descontinuado' },
}

export default function StatusBadge({ status }: { status: ProjectStatus }) {
  const c = config[status]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 600,
        fontFamily: 'monospace',
        whiteSpace: 'nowrap',
        background: c.bg,
        color: c.color,
      }}
    >
      {c.label}
    </span>
  )
}
