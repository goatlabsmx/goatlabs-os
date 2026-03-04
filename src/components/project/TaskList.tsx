import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../../hooks/useTasks'
import EditableField from './EditableField'
import type { TaskArea, TaskStatus } from '../../types'

const c = {
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

const statusColors: Record<TaskStatus, { bg: string; color: string }> = {
  Pendiente: { bg: 'rgba(107,107,126,0.15)', color: c.muted },
  'En progreso': { bg: 'rgba(59,130,246,0.12)', color: c.blue },
  Bloqueado: { bg: 'rgba(239,68,68,0.12)', color: c.red },
  Done: { bg: 'rgba(34,197,94,0.12)', color: c.green },
}

const gtmTypes = ['Email', 'Redes', 'Promo', 'Partnerships', 'Otro']
const devTypes = ['Bug', 'Improvement', 'Feature', 'Roadmap']

export default function TaskList({ projectId, area }: { projectId: string; area: TaskArea }) {
  const { data: allTasks } = useTasks(projectId)
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()

  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState('')
  const [newDue, setNewDue] = useState('')
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const tasks = allTasks?.filter(t => t.area === area) ?? []
  const active = tasks.filter(t => t.status !== 'Done')
  const done = tasks.filter(t => t.status === 'Done')
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const typeOptions = area === 'GTM' ? gtmTypes : devTypes

  const handleCreate = async () => {
    if (!newTitle.trim()) return
    try {
      await createTask.mutateAsync({
        title: newTitle.trim(),
        project_id: projectId,
        area,
        type: newType || null,
        due_date: newDue || null,
        status: 'Pendiente',
        priority: 'Media',
      })
      setNewTitle(''); setNewType(''); setNewDue('')
      setShowForm(false)
      toast.success('Tarea creada')
    } catch {
      toast.error('Error al crear tarea')
    }
  }

  const toggleDone = (taskId: string, current: TaskStatus) => {
    updateTask.mutate({ id: taskId, status: current === 'Done' ? 'Pendiente' : 'Done' })
  }

  const inputStyle: React.CSSProperties = {
    background: c.surface2,
    border: `1px solid ${c.border}`,
    borderRadius: 5,
    color: c.text,
    padding: '6px 8px',
    fontSize: 12,
    outline: 'none',
    boxSizing: 'border-box',
  }

  const renderRow = (task: typeof tasks[0], isDone: boolean) => {
    const isOverdue = !isDone && task.due_date && task.due_date < todayStr
    const badge = statusColors[task.status]
    const hovered = hoveredId === task.id

    return (
      <div
        key={task.id}
        onMouseEnter={() => setHoveredId(task.id)}
        onMouseLeave={() => setHoveredId(null)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '7px 6px',
          borderRadius: 6,
          opacity: isDone ? 0.4 : 1,
          background: hovered ? c.surface2 : 'transparent',
          transition: 'background 0.1s',
        }}
      >
        {/* Checkbox */}
        <div
          onClick={() => toggleDone(task.id, task.status)}
          style={{
            width: 17,
            height: 17,
            borderRadius: 4,
            border: `1.5px solid ${isDone ? c.green : c.border2}`,
            background: isDone ? c.green : 'transparent',
            cursor: 'pointer',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isDone && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>

        {/* Title */}
        <div style={{ flex: 1, minWidth: 0, fontSize: 12.5 }}>
          <EditableField
            value={task.title}
            onSave={val => updateTask.mutate({ id: task.id, title: val })}
            placeholder="Sin título"
          />
        </div>

        {/* Type chip */}
        {task.type && (
          <span style={{
            background: c.surface2,
            border: `1px solid ${c.border}`,
            padding: '1px 6px',
            borderRadius: 3,
            fontSize: 10,
            fontFamily: 'monospace',
            color: c.muted,
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}>
            {task.type}
          </span>
        )}

        {/* Due date */}
        {task.due_date && (
          <span style={{ fontSize: 10, color: isOverdue ? c.red : c.muted, flexShrink: 0 }}>
            {format(new Date(task.due_date + 'T00:00:00'), 'd MMM', { locale: es })}
          </span>
        )}

        {/* Status badge */}
        <span style={{
          background: badge.bg,
          color: badge.color,
          fontSize: 10,
          fontWeight: 500,
          padding: '1px 7px',
          borderRadius: 4,
          whiteSpace: 'nowrap',
          flexShrink: 0,
          textDecoration: isDone ? 'line-through' : 'none',
        }}>
          {task.status}
        </span>

        {/* Delete */}
        {hovered && (
          <button
            onClick={() => deleteTask.mutate({ id: task.id, projectId })}
            style={{
              background: 'none',
              border: 'none',
              color: c.dim,
              cursor: 'pointer',
              fontSize: 14,
              padding: '0 2px',
              flexShrink: 0,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        )}
      </div>
    )
  }

  return (
    <div>
      {active.length === 0 && done.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '24px 0', color: c.muted, fontSize: 13 }}>
          Sin tareas de {area} aún
        </div>
      )}

      {active.map(t => renderRow(t, false))}

      {done.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 9.5, fontFamily: 'monospace', color: c.dim, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '4px 6px', marginBottom: 2 }}>
            Completadas ({done.length})
          </div>
          {done.map(t => renderRow(t, true))}
        </div>
      )}

      {/* New task form */}
      {showForm ? (
        <div style={{
          display: 'flex',
          gap: 6,
          alignItems: 'center',
          padding: '8px 6px',
          marginTop: 6,
          background: c.surface2,
          borderRadius: 6,
          flexWrap: 'wrap',
        }}>
          <input
            autoFocus
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setShowForm(false) }}
            placeholder="Título de la tarea"
            style={{ ...inputStyle, flex: 1, minWidth: 140 }}
          />
          <select
            value={newType}
            onChange={e => setNewType(e.target.value)}
            style={{ ...inputStyle, width: 110 }}
          >
            <option value="">Tipo</option>
            {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input
            type="date"
            value={newDue}
            onChange={e => setNewDue(e.target.value)}
            style={{ ...inputStyle, width: 130 }}
          />
          <button
            onClick={handleCreate}
            disabled={createTask.isPending}
            style={{
              background: c.accent,
              color: '#0a0a0b',
              border: 'none',
              borderRadius: 5,
              padding: '6px 12px',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Crear
          </button>
          <button
            onClick={() => setShowForm(false)}
            style={{ background: 'none', border: 'none', color: c.muted, cursor: 'pointer', fontSize: 12 }}
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          style={{
            background: 'none',
            border: 'none',
            color: c.accent,
            cursor: 'pointer',
            fontSize: 12,
            padding: '8px 6px',
            marginTop: 4,
          }}
        >
          + Nueva tarea
        </button>
      )}
    </div>
  )
}
