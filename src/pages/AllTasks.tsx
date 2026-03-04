import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import Topbar from '../components/layout/Topbar'
import NewTaskDialog from '../components/tasks/NewTaskDialog'
import { useProjects } from '../hooks/useProjects'
import { useAllTasks, useUpdateTask, useDeleteTask } from '../hooks/useTasks'
import type { Task, TaskArea, TaskStatus } from '../types'

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

const statusBadge: Record<TaskStatus, { bg: string; color: string }> = {
  Pendiente: { bg: 'rgba(107,107,126,0.15)', color: c.muted },
  'En progreso': { bg: 'rgba(59,130,246,0.12)', color: c.blue },
  Bloqueado: { bg: 'rgba(239,68,68,0.12)', color: c.red },
  Done: { bg: 'rgba(34,197,94,0.12)', color: c.green },
}

const areaColors: Record<TaskArea, { bg: string; color: string }> = {
  GTM: { bg: 'rgba(59,130,246,0.12)', color: c.blue },
  Dev: { bg: 'rgba(245,158,11,0.12)', color: c.amber },
}

type StatusFilter = 'Todos' | TaskStatus
type AreaFilter = 'Todos' | TaskArea

export default function AllTasks() {
  const navigate = useNavigate()
  const { data: projects } = useProjects()
  const { data: allTasks } = useAllTasks()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [projectFilter, setProjectFilter] = useState('all')
  const [areaFilter, setAreaFilter] = useState<AreaFilter>('Todos')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Todos')
  const [showDone, setShowDone] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const today = format(new Date(), 'yyyy-MM-dd')
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd')
  const weekOut = format(addDays(new Date(), 7), 'yyyy-MM-dd')

  const projectMap = useMemo(() => {
    const m: Record<string, string> = {}
    projects?.forEach(p => { m[p.id] = p.name })
    return m
  }, [projects])

  const filtered = useMemo(() => {
    if (!allTasks) return []
    return allTasks.filter(t => {
      if (projectFilter !== 'all' && t.project_id !== projectFilter) return false
      if (areaFilter !== 'Todos' && t.area !== areaFilter) return false
      if (statusFilter !== 'Todos' && t.status !== statusFilter) return false
      return true
    })
  }, [allTasks, projectFilter, areaFilter, statusFilter])

  const sections = useMemo(() => {
    const overdue: Task[] = []
    const todayTasks: Task[] = []
    const week: Task[] = []
    const later: Task[] = []
    const done: Task[] = []

    for (const t of filtered) {
      if (t.status === 'Done') { done.push(t); continue }
      if (t.due_date && t.due_date < today) overdue.push(t)
      else if (t.due_date === today) todayTasks.push(t)
      else if (t.due_date && t.due_date >= tomorrow && t.due_date <= weekOut) week.push(t)
      else later.push(t)
    }
    return { overdue, todayTasks, week, later, done }
  }, [filtered, today, tomorrow, weekOut])

  const toggleDone = (task: Task) => {
    updateTask.mutate({ id: task.id, status: task.status === 'Done' ? 'Pendiente' : 'Done' })
  }

  const totalActive = sections.overdue.length + sections.todayTasks.length + sections.week.length + sections.later.length

  const chipStyle: React.CSSProperties = {
    padding: '3px 8px', borderRadius: 5, fontSize: 11, cursor: 'pointer', border: `1px solid ${c.border}`, background: 'transparent', color: c.muted, fontWeight: 500, transition: 'all 0.12s',
  }
  const activeChip: React.CSSProperties = {
    ...chipStyle, background: 'rgba(0,212,216,0.1)', color: c.accent, borderColor: 'rgba(0,212,216,0.3)',
  }

  const renderRow = (task: Task, isDone: boolean) => {
    const isOverdue = !isDone && task.due_date && task.due_date < today
    const badge = statusBadge[task.status]
    const aBadge = areaColors[task.area]
    const hovered = hoveredId === task.id

    return (
      <div
        key={task.id}
        onMouseEnter={() => setHoveredId(task.id)}
        onMouseLeave={() => setHoveredId(null)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 6,
          opacity: isDone ? 0.4 : 1, background: hovered ? c.surface2 : 'transparent', transition: 'background 0.1s',
        }}
      >
        <div onClick={() => toggleDone(task)} style={{
          width: 17, height: 17, borderRadius: 4, border: `1.5px solid ${isDone ? c.green : c.border2}`,
          background: isDone ? c.green : 'transparent', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {isDone && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
        </div>
        <span style={{ flex: 1, fontSize: 12.5, fontWeight: 500, color: isDone ? c.dim : c.text, textDecoration: isDone ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {task.title}
        </span>
        <span onClick={e => { e.stopPropagation(); navigate(`/project/${task.project_id}`) }} style={{
          background: c.surface2, border: `1px solid ${c.border}`, borderRadius: 4, padding: '1px 6px',
          fontSize: 10, color: c.muted, fontFamily: 'monospace', whiteSpace: 'nowrap', flexShrink: 0, cursor: 'pointer',
        }}>
          {projectMap[task.project_id] ?? '—'}
        </span>
        {task.type && <span style={{ fontSize: 10, color: c.dim, flexShrink: 0 }}>{task.type}</span>}
        <span style={{ ...aBadge, padding: '1px 6px', borderRadius: 3, fontSize: 10, fontFamily: 'monospace', flexShrink: 0 }}>{task.area}</span>
        {task.due_date && (
          <span style={{ fontSize: 10, color: isOverdue ? c.red : c.muted, flexShrink: 0 }}>
            {format(new Date(task.due_date + 'T00:00:00'), 'd MMM', { locale: es })}
          </span>
        )}
        <span style={{ background: badge.bg, color: badge.color, fontSize: 10, fontWeight: 500, padding: '1px 7px', borderRadius: 4, whiteSpace: 'nowrap', flexShrink: 0 }}>
          {task.status}
        </span>
        {hovered && (
          <button onClick={() => deleteTask.mutate({ id: task.id, projectId: task.project_id })} style={{ background: 'none', border: 'none', color: c.dim, cursor: 'pointer', fontSize: 14, padding: '0 2px', flexShrink: 0, lineHeight: 1 }}>×</button>
        )}
      </div>
    )
  }

  const renderSection = (label: string, tasks: Task[], color?: string) => {
    if (tasks.length === 0) return null
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, fontFamily: 'monospace', color: color ?? c.dim, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '4px 8px', marginBottom: 4 }}>
          {label} ({tasks.length})
        </div>
        {tasks.map(t => renderRow(t, false))}
      </div>
    )
  }

  return (
    <div>
      <Topbar
        title="Todas las tareas"
        rightContent={
          <button onClick={() => setDialogOpen(true)} style={{ background: c.accent, color: c.bg, border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            + Nueva tarea
          </button>
        }
      />

      {/* Filters */}
      <div style={{ padding: '12px 26px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', borderBottom: `1px solid ${c.border}` }}>
        <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} style={{ background: c.surface2, border: `1px solid ${c.border}`, borderRadius: 5, color: c.muted, padding: '4px 8px', fontSize: 11, outline: 'none', cursor: 'pointer' }}>
          <option value="all">Todos los proyectos</option>
          {projects?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        {(['Todos', 'GTM', 'Dev'] as AreaFilter[]).map(a => (
          <button key={a} onClick={() => setAreaFilter(a)} style={areaFilter === a ? activeChip : chipStyle}>
            {a === 'Todos' ? 'GTM + Dev' : a}
          </button>
        ))}

        <div style={{ width: 1, height: 16, background: c.border, margin: '0 2px' }} />

        {(['Todos', 'Pendiente', 'En progreso', 'Bloqueado', 'Done'] as StatusFilter[]).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={statusFilter === s ? activeChip : chipStyle}>
            {s}
          </button>
        ))}

        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: c.muted, cursor: 'pointer', marginLeft: 'auto' }}>
          <input type="checkbox" checked={showDone} onChange={e => setShowDone(e.target.checked)} style={{ accentColor: c.accent }} />
          Ver completadas
        </label>
      </div>

      <div style={{ padding: '18px 26px', maxWidth: 1100 }}>
        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 10, padding: 14 }}>
          {totalActive === 0 && (!showDone || sections.done.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '28px 0', color: c.muted, fontSize: 13 }}>
              No hay tareas — ¡todo al día! 🎉
            </div>
          ) : (
            <>
              {renderSection('⚠ Vencidas', sections.overdue, c.red)}
              {renderSection('Hoy', sections.todayTasks)}
              {renderSection('Esta semana', sections.week)}
              {renderSection('Más adelante', sections.later)}
              {showDone && sections.done.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, fontFamily: 'monospace', color: c.dim, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '4px 8px', marginBottom: 4 }}>
                    Completadas ({sections.done.length})
                  </div>
                  {sections.done.map(t => renderRow(t, true))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <NewTaskDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  )
}
