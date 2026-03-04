import { useAllTaskCounts } from '../../hooks/useTasks'

export default function TaskCountChips({ projectId }: { projectId: string }) {
  const { data: counts } = useAllTaskCounts()
  const entry = counts?.[projectId]

  if (!entry) return <span style={{ fontSize: 10, color: '#3a3a48' }}>—</span>

  const overdueStyle = entry.hasOverdue
    ? { background: 'rgba(239,68,68,0.12)', color: '#ef4444' }
    : { background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }

  const chip: React.CSSProperties = {
    padding: '1px 6px',
    borderRadius: 3,
    fontSize: 10,
    fontFamily: 'monospace',
    whiteSpace: 'nowrap',
  }

  return (
    <span style={{ display: 'inline-flex', gap: 4 }}>
      {entry.gtm > 0 && (
        <span style={{ ...chip, background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}>
          GTM {entry.gtm}
        </span>
      )}
      {entry.dev > 0 && (
        <span style={{ ...chip, ...overdueStyle }}>
          Dev {entry.dev}{entry.hasOverdue ? ' ⚠' : ''}
        </span>
      )}
    </span>
  )
}
