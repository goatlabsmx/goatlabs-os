import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { format, startOfDay, addDays, subDays } from 'date-fns'
import { es } from 'date-fns/locale'
import Topbar from '../components/layout/Topbar'
import { useAuth } from '../hooks/useAuth'
import { useProjects } from '../hooks/useProjects'
import { useAllTasks, useCreateTask, useUpdateTask } from '../hooks/useTasks'
import type { Task, TaskArea } from '../types'

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
  accentDim: 'rgba(0, 212, 216, 0.12)',
  green: '#22c55e',
  amber: '#f59e0b',
  red: '#ef4444',
  blue: '#3b82f6',
}

const statusBadgeColors: Record<string, { bg: string; color: string }> = {
  Pendiente: { bg: 'rgba(107,107,126,0.15)', color: c.muted },
  'En progreso': { bg: 'rgba(59,130,246,0.12)', color: c.blue },
  Bloqueado: { bg: 'rgba(239,68,68,0.12)', color: c.red },
  Done: { bg: 'rgba(34,197,94,0.12)', color: c.green },
}

function getGreeting(): string {
  const h = new Date().getHours()
  return h < 12 ? 'Buenos días' : 'Buenas tardes'
}

function extractName(email: string): string {
  const local = email.split('@')[0]
  const part = local.split('.')[0]
  return part.charAt(0).toUpperCase() + part.slice(1)
}

export default function Today() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: projects } = useProjects()
  const { data: allTasks } = useAllTasks()
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()

  const [captureTitle, setCaptureTitle] = useState('')
  const [captureProjectId, setCaptureProjectId] = useState('')
  const [captureArea, setCaptureArea] = useState<TaskArea>('Dev')

  const today = startOfDay(new Date())
  const todayStr = format(today, 'yyyy-MM-dd')

  const projectMap = useMemo(() => {
    const m: Record<string, string> = {}
    projects?.forEach(p => { m[p.id] = p.name })
    return m
  }, [projects])

  const overdueTasks = useMemo(() => {
    if (!allTasks) return []
    return allTasks
      .filter(t => t.status !== 'Done' && t.due_date && t.due_date <= todayStr)
      .sort((a, b) => {
        const aOver = a.due_date! < todayStr ? 0 : 1
        const bOver = b.due_date! < todayStr ? 0 : 1
        if (aOver !== bOver) return aOver - bOver
        return (a.due_date ?? '').localeCompare(b.due_date ?? '')
      })
      .slice(0, 10)
  }, [allTasks, todayStr])

  const overdueCount = allTasks?.filter(t => t.status !== 'Done' && t.due_date && t.due_date < todayStr).length ?? 0
  const blockerProjects = projects?.filter(p => p.main_blocker) ?? []

  const momentum = useMemo(() => {
    if (!allTasks || !projects) return null
    const weekAgo = format(subDays(today, 7), 'yyyy-MM-dd')
    const counts: Record<string, number> = {}
    for (const t of allTasks) {
      if (t.status === 'Done' && t.updated_at >= weekAgo) {
        counts[t.project_id] = (counts[t.project_id] || 0) + 1
      }
    }
    let bestId = ''
    let bestCount = 0
    for (const [pid, cnt] of Object.entries(counts)) {
      if (cnt > bestCount) { bestId = pid; bestCount = cnt }
    }
    if (!bestId) return null
    return { id: bestId, name: projectMap[bestId] ?? 'Proyecto', count: bestCount }
  }, [allTasks, projects, today, projectMap])

  const upcomingTasks = useMemo(() => {
    if (!allTasks) return []
    const tomorrow = format(addDays(today, 1), 'yyyy-MM-dd')
    const weekOut = format(addDays(today, 7), 'yyyy-MM-dd')
    return allTasks
      .filter(t => t.status !== 'Done' && t.due_date && t.due_date >= tomorrow && t.due_date <= weekOut)
      .slice(0, 5)
  }, [allTasks, today])

  const mrrTotal = projects?.reduce((s, p) => s + (p.mrr ?? 0), 0) ?? 0
  const usersTotal = projects?.reduce((s, p) => s + (p.active_users ?? 0), 0) ?? 0
  const activeCount = projects?.filter(p => p.status === 'Activo' || p.status === 'Validando').length ?? 0
  const doneToday = allTasks?.filter(t => t.status === 'Done' && t.updated_at && t.updated_at.startsWith(todayStr)).length ?? 0

  const handleCapture = async () => {
    if (!captureTitle.trim()) return
    if (!captureProjectId && projects?.length) {
      setCaptureProjectId(projects[0].id)
    }
    const pid = captureProjectId || projects?.[0]?.id
    if (!pid) { toast.error('Selecciona un proyecto'); return }

    try {
      await createTask.mutateAsync({
        title: captureTitle.trim(),
        project_id: pid,
        area: captureArea,
        status: 'Pendiente',
      })
      setCaptureTitle('')
      toast.success('Tarea creada')
    } catch {
      toast.error('Error al crear tarea')
    }
  }

  const toggleDone = (task: Task) => {
    updateTask.mutate({
      id: task.id,
      status: task.status === 'Done' ? 'Pendiente' : 'Done',
    })
  }

  const firstName = extractName(user?.email ?? '')
  const dateStr = format(new Date(), "EEEE d 'de' MMMM", { locale: es })

  return (
    <div>
      <Topbar
        title="Hoy"
        rightContent={
          <>
            <span style={{ fontSize: 12, color: c.muted, textTransform: 'capitalize' }}>{dateStr}</span>
            <button
              onClick={() => { /* will be wired later */ }}
              style={{
                background: c.accent,
                color: c.bg,
                border: 'none',
                borderRadius: 6,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              + Nueva tarea
            </button>
          </>
        }
      />

      <div style={{ padding: '22px 26px', maxWidth: 1200 }}>
        {/* Greeting */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 300, letterSpacing: -0.3, color: c.text }}>
            {getGreeting()}, {firstName}.
          </div>
          <div style={{ fontSize: 13, color: c.muted, marginTop: 4 }}>
            {overdueCount > 0 || blockerProjects.length > 0
              ? `Tienes ${overdueCount} tarea${overdueCount !== 1 ? 's' : ''} vencida${overdueCount !== 1 ? 's' : ''} y ${blockerProjects.length} bloqueo${blockerProjects.length !== 1 ? 's' : ''} activo${blockerProjects.length !== 1 ? 's' : ''}.`
              : 'Todo en orden — sigue así.'}
          </div>
        </div>

        {/* Quick Capture */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            background: c.surface2,
            border: `1px dashed ${c.border2}`,
            borderRadius: 8,
            marginBottom: 20,
          }}
        >
          <span style={{ color: c.dim, fontSize: 16, flexShrink: 0 }}>+</span>
          <input
            value={captureTitle}
            onChange={e => setCaptureTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCapture()}
            placeholder="Capturar tarea rápida..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: c.text,
              fontSize: 13,
              outline: 'none',
            }}
          />
          <select
            value={captureProjectId || projects?.[0]?.id || ''}
            onChange={e => setCaptureProjectId(e.target.value)}
            style={{
              background: c.surface,
              color: c.muted,
              border: `1px solid ${c.border}`,
              borderRadius: 5,
              padding: '4px 8px',
              fontSize: 11,
              outline: 'none',
              cursor: 'pointer',
              maxWidth: 130,
            }}
          >
            {projects?.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {(['GTM', 'Dev'] as TaskArea[]).map(area => (
            <button
              key={area}
              onClick={() => setCaptureArea(area)}
              style={{
                background: captureArea === area ? c.accentDim : 'transparent',
                color: captureArea === area ? c.accent : c.dim,
                border: `1px solid ${captureArea === area ? 'rgba(0,212,216,0.3)' : c.border}`,
                borderRadius: 5,
                padding: '3px 10px',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {area}
            </button>
          ))}
        </div>

        {/* Two column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Vencidas & Hoy */}
            <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 10, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: c.text }}>⚠ Vencidas &amp; Hoy</span>
                <span style={{ fontSize: 11, color: c.muted }}>{overdueTasks.length} tarea{overdueTasks.length !== 1 ? 's' : ''}</span>
              </div>

              {overdueTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: c.muted, fontSize: 13 }}>
                  Todo al día 🎉
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {overdueTasks.map(task => {
                    const isOverdue = task.due_date! < todayStr
                    const badge = statusBadgeColors[task.status] ?? statusBadgeColors.Pendiente
                    return (
                      <div
                        key={task.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '7px 8px',
                          borderRadius: 6,
                          fontSize: 12.5,
                        }}
                      >
                        {/* Checkbox */}
                        <div
                          onClick={() => toggleDone(task)}
                          style={{
                            width: 17,
                            height: 17,
                            borderRadius: 4,
                            border: `1.5px solid ${task.status === 'Done' ? c.green : c.border2}`,
                            background: task.status === 'Done' ? c.green : 'transparent',
                            cursor: 'pointer',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {task.status === 'Done' && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        {/* Title */}
                        <span style={{
                          flex: 1,
                          fontWeight: 500,
                          color: task.status === 'Done' ? c.dim : c.text,
                          textDecoration: task.status === 'Done' ? 'line-through' : 'none',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {task.title}
                        </span>
                        {/* Project chip */}
                        <span style={{
                          background: c.surface2,
                          border: `1px solid ${c.border}`,
                          borderRadius: 4,
                          padding: '1px 6px',
                          fontSize: 10,
                          color: c.muted,
                          fontFamily: 'monospace',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}>
                          {projectMap[task.project_id] ?? '—'}
                        </span>
                        {/* Type badge */}
                        {task.type && (
                          <span style={{ fontSize: 10, color: c.dim }}>{task.type}</span>
                        )}
                        {/* Due date */}
                        {task.due_date && (
                          <span style={{ fontSize: 10, color: isOverdue ? c.red : c.muted, flexShrink: 0 }}>
                            {format(new Date(task.due_date + 'T00:00:00'), 'd MMM', { locale: es })}
                          </span>
                        )}
                        {/* Overdue pill */}
                        {isOverdue && (
                          <span style={{
                            background: 'rgba(239,68,68,0.1)',
                            color: c.red,
                            fontSize: 9,
                            fontWeight: 600,
                            padding: '1px 6px',
                            borderRadius: 4,
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                          }}>
                            ⚠ Vencida
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
                        }}>
                          {task.status}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Blockers */}
            {blockerProjects.length > 0 && (
              <div style={{
                background: 'rgba(239,68,68,0.05)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 10,
                padding: 16,
              }}>
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
                  <div key={p.id} style={{ display: 'flex', gap: 10, padding: '5px 0', fontSize: 12.5, lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 600, color: c.muted, minWidth: 120, flexShrink: 0 }}>{p.name}</span>
                    <span style={{ color: c.text }}>{p.main_blocker}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Momentum */}
            {momentum && (
              <div style={{
                background: 'rgba(0,212,216,0.06)',
                border: '1px solid rgba(0,212,216,0.18)',
                borderRadius: 10,
                padding: 16,
              }}>
                <div style={{ fontSize: 11, color: c.accent, fontWeight: 600, marginBottom: 8 }}>
                  🔥 Mejor momentum esta semana
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: c.text }}>{momentum.name}</div>
                <div style={{ fontSize: 12, color: c.muted, marginTop: 2 }}>{momentum.count} tarea{momentum.count !== 1 ? 's' : ''} completada{momentum.count !== 1 ? 's' : ''}</div>
                <button
                  onClick={() => navigate(`/project/${momentum.id}`)}
                  style={{
                    marginTop: 10,
                    background: 'transparent',
                    color: c.accent,
                    border: 'none',
                    padding: 0,
                    fontSize: 12,
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  Ver proyecto →
                </button>
              </div>
            )}

            {/* Próximos 7 días */}
            <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: c.text, marginBottom: 10 }}>
                Próximos 7 días
              </div>
              {upcomingTasks.length === 0 ? (
                <div style={{ fontSize: 12, color: c.muted, padding: '8px 0' }}>Sin tareas próximas</div>
              ) : (
                upcomingTasks.map(t => (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', fontSize: 12 }}>
                    <span style={{ color: c.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: 8 }}>
                      {t.title}
                    </span>
                    <span style={{ color: c.muted, fontSize: 11, flexShrink: 0 }}>
                      {t.due_date && format(new Date(t.due_date + 'T00:00:00'), 'd MMM', { locale: es })}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Snapshot GoatLabs */}
            <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: c.text, marginBottom: 12 }}>
                Snapshot GoatLabs
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <StatBox label="MRR Total" value={`$${mrrTotal.toLocaleString()}`} color={c.accent} />
                <StatBox label="Usuarios totales" value={String(usersTotal)} color={c.text} />
                <StatBox label="Proyectos activos" value={String(activeCount)} color={c.green} />
                <StatBox label="Tareas done hoy" value={String(doneToday)} color={c.accent} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      background: '#18181d',
      borderRadius: 8,
      padding: '10px 12px',
    }}>
      <div style={{ fontSize: 18, fontWeight: 700, color, letterSpacing: -0.5 }}>{value}</div>
      <div style={{ fontSize: 10, color: '#6b6b7e', marginTop: 2 }}>{label}</div>
    </div>
  )
}
