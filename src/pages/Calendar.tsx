import { useState, useMemo } from 'react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isValid } from 'date-fns'
import { es } from 'date-fns/locale'
import Topbar from '../components/layout/Topbar'
import NewContentDialog from '../components/content/NewContentDialog'
import { useProjects } from '../hooks/useProjects'
import { useAllContentItems, useDeleteContentItem } from '../hooks/useContentItems'
import type { ContentStatus } from '../types'

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

const statusChipColors: Record<ContentStatus, string> = {
  Idea: c.muted,
  'En producción': c.blue,
  Programado: c.amber,
  Publicado: c.green,
}

const channelColors: Record<string, string> = {
  Instagram: '#c026d3', TikTok: '#14b8a6', Email: '#3b82f6', Blog: '#22c55e', YouTube: '#ef4444', 'Twitter/X': '#6b6b7e',
}

const DAY_HEADERS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function safeFormat(date: Date, pattern: string, options?: { locale?: typeof es }): string {
  try {
    if (!date || !isValid(date)) return '—'
    return format(date, pattern, options)
  } catch {
    return '—'
  }
}

function safeDateFromStr(str: string | null | undefined): Date | null {
  if (!str) return null
  try {
    const d = new Date(str + 'T00:00:00')
    return isValid(d) ? d : null
  } catch {
    return null
  }
}

type View = 'calendar' | 'list'

export default function Calendar() {
  const { data: projects } = useProjects()
  const { data: allContent } = useAllContentItems()
  const deleteItem = useDeleteContentItem()

  const now = useMemo(() => new Date(), [])
  const [currentMonth, setCurrentMonth] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1))
  const [view, setView] = useState<View>('calendar')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogDate, setDialogDate] = useState<string | undefined>()
  const [projectFilter, setProjectFilter] = useState('all')
  const [hoveredDay, setHoveredDay] = useState<string | null>(null)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<{ id: string; x: number; y: number } | null>(null)

  const projectMap = useMemo(() => {
    const m: Record<string, string> = {}
    projects?.forEach(p => { m[p.id] = p.name })
    return m
  }, [projects])

  const filtered = useMemo(() => {
    if (!allContent) return []
    return allContent.filter(item => {
      if (projectFilter !== 'all' && item.project_id !== projectFilter) return false
      return true
    })
  }, [allContent, projectFilter])

  const itemsByDate = useMemo(() => {
    const map: Record<string, typeof filtered> = {}
    for (const item of filtered) {
      if (!item.scheduled_date) continue
      const key = item.scheduled_date
      if (!map[key]) map[key] = []
      map[key].push(item)
    }
    return map
  }, [filtered])

  const calendarDays = useMemo(() => {
    try {
      const anchor = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      if (!isValid(anchor)) return []
      const monthStart = startOfMonth(anchor)
      const monthEnd = endOfMonth(anchor)
      const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
      const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
      if (!isValid(calStart) || !isValid(calEnd)) return []

      const result: Date[] = []
      let day = new Date(calStart.getTime())
      for (let i = 0; i < 42; i++) {
        if (!isValid(day)) break
        if (day.getTime() > calEnd.getTime()) break
        result.push(new Date(day.getTime()))
        day = addDays(day, 1)
      }
      return result
    } catch {
      return []
    }
  }, [currentMonth])

  const openNew = (dateStr?: string) => {
    setDialogDate(dateStr)
    setDialogOpen(true)
  }

  const monthLabel = safeFormat(currentMonth, 'MMMM yyyy', { locale: es })

  const chipStyle = (active: boolean): React.CSSProperties => ({
    padding: '4px 10px', borderRadius: 5, fontSize: 11, cursor: 'pointer', fontWeight: 500,
    border: `1px solid ${active ? 'rgba(0,212,216,0.3)' : c.border}`,
    background: active ? 'rgba(0,212,216,0.1)' : 'transparent',
    color: active ? c.accent : c.muted,
  })

  return (
    <div>
      <Topbar
        title="Calendario"
        rightContent={
          <button onClick={() => openNew()} style={{ background: c.accent, color: c.bg, border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            + Nuevo contenido
          </button>
        }
      />

      {/* Controls */}
      <div style={{ padding: '12px 26px', display: 'flex', gap: 8, alignItems: 'center', borderBottom: `1px solid ${c.border}`, flexWrap: 'wrap' }}>
        <button onClick={() => setCurrentMonth(prev => subMonths(prev, 1))} style={{ background: 'none', border: `1px solid ${c.border}`, borderRadius: 5, color: c.muted, cursor: 'pointer', padding: '3px 8px', fontSize: 14 }}>←</button>
        <span style={{ fontSize: 13, fontWeight: 600, color: c.text, minWidth: 140, textAlign: 'center', textTransform: 'capitalize' }}>{monthLabel}</span>
        <button onClick={() => setCurrentMonth(prev => addMonths(prev, 1))} style={{ background: 'none', border: `1px solid ${c.border}`, borderRadius: 5, color: c.muted, cursor: 'pointer', padding: '3px 8px', fontSize: 14 }}>→</button>

        <div style={{ width: 1, height: 16, background: c.border, margin: '0 4px' }} />

        <button onClick={() => setView('calendar')} style={chipStyle(view === 'calendar')}>Calendario</button>
        <button onClick={() => setView('list')} style={chipStyle(view === 'list')}>Lista</button>

        <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} style={{ marginLeft: 'auto', background: c.surface2, border: `1px solid ${c.border}`, borderRadius: 5, color: c.muted, padding: '4px 8px', fontSize: 11, outline: 'none', cursor: 'pointer' }}>
          <option value="all">Todos los proyectos</option>
          {projects?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div style={{ padding: '18px 26px' }}>
        {view === 'calendar' ? (
          <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 10, overflow: 'hidden' }}>
            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: `1px solid ${c.border}` }}>
              {DAY_HEADERS.map(d => (
                <div key={d} style={{ padding: '8px 0', textAlign: 'center', fontSize: 10, fontFamily: 'monospace', color: c.dim, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                  {d}
                </div>
              ))}
            </div>
            {/* Day cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {calendarDays.map((day, i) => {
                if (!isValid(day)) return <div key={i} />
                const dateStr = safeFormat(day, 'yyyy-MM-dd')
                if (dateStr === '—') return <div key={i} />
                const inMonth = isSameMonth(day, currentMonth)
                const isNow = isSameDay(day, now)
                const events = itemsByDate[dateStr] ?? []
                const dayHovered = hoveredDay === dateStr

                return (
                  <div
                    key={i}
                    onMouseEnter={() => setHoveredDay(dateStr)}
                    onMouseLeave={() => setHoveredDay(null)}
                    style={{
                      minHeight: 80,
                      padding: '4px 6px',
                      borderRight: (i + 1) % 7 !== 0 ? `1px solid ${c.border}` : 'none',
                      borderBottom: i < calendarDays.length - 7 ? `1px solid ${c.border}` : 'none',
                      background: isNow ? 'rgba(0,212,216,0.04)' : 'transparent',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                      <span style={{
                        fontSize: 11, fontWeight: isNow ? 700 : 400,
                        color: !inMonth ? c.dim : isNow ? c.accent : c.muted,
                        width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '50%', background: isNow ? 'rgba(0,212,216,0.15)' : 'transparent',
                      }}>
                        {safeFormat(day, 'd')}
                      </span>
                      {dayHovered && inMonth && (
                        <button onClick={() => openNew(dateStr)} style={{ background: 'none', border: 'none', color: c.accent, cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0 }}>+</button>
                      )}
                    </div>
                    {events.slice(0, 3).map(ev => {
                      const evColor = statusChipColors[ev.status] ?? c.muted
                      return (
                        <div
                          key={ev.id}
                          onClick={e => { e.stopPropagation(); setTooltip(tooltip?.id === ev.id ? null : { id: ev.id, x: e.clientX, y: e.clientY }) }}
                          style={{
                            background: `${evColor}20`, color: evColor, fontSize: 9, fontWeight: 500,
                            padding: '1px 4px', borderRadius: 3, marginBottom: 2,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            cursor: 'pointer', borderLeft: `2px solid ${evColor}`,
                          }}
                        >
                          {ev.title}
                        </div>
                      )
                    })}
                    {events.length > 3 && (
                      <div style={{ fontSize: 9, color: c.dim }}>+{events.length - 3} más</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          /* List view */
          <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 10, padding: 14 }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px 0', color: c.muted, fontSize: 13 }}>Sin contenido programado</div>
            ) : (
              filtered.map(item => {
                const chColor = channelColors[item.channel] ?? c.muted
                const sBadge = statusChipColors[item.status] ?? c.muted
                const hovered = hoveredItem === item.id
                const dateObj = safeDateFromStr(item.scheduled_date)
                const dateLabel = dateObj ? safeFormat(dateObj, 'd MMM yyyy', { locale: es }) : '—'

                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 6px', borderRadius: 6, background: hovered ? c.surface2 : 'transparent', transition: 'background 0.1s' }}
                  >
                    <span style={{ background: `${chColor}18`, color: chColor, padding: '1px 7px', borderRadius: 4, fontSize: 10, fontWeight: 600, fontFamily: 'monospace', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {item.channel}
                    </span>
                    <span style={{ background: c.surface2, border: `1px solid ${c.border}`, borderRadius: 4, padding: '1px 6px', fontSize: 10, color: c.muted, fontFamily: 'monospace', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {projectMap[item.project_id] ?? '—'}
                    </span>
                    <span style={{ flex: 1, fontSize: 12.5, color: c.text, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title}
                    </span>
                    {item.format && <span style={{ fontSize: 10, color: c.dim }}>{item.format}</span>}
                    <span style={{ fontSize: 10, color: c.muted, flexShrink: 0 }}>{dateLabel}</span>
                    <span style={{ background: `${sBadge}20`, color: sBadge, fontSize: 10, fontWeight: 500, padding: '1px 7px', borderRadius: 4, whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {item.status}
                    </span>
                    {hovered && (
                      <button onClick={() => deleteItem.mutate({ id: item.id, projectId: item.project_id })} style={{ background: 'none', border: 'none', color: c.dim, cursor: 'pointer', fontSize: 14, padding: '0 2px', flexShrink: 0, lineHeight: 1 }}>×</button>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* Tooltip */}
      {tooltip && (() => {
        const item = filtered.find(i => i.id === tooltip.id)
        if (!item) return null
        return (
          <div
            onClick={() => setTooltip(null)}
            style={{
              position: 'fixed', top: tooltip.y + 8, left: tooltip.x, background: c.surface2, border: `1px solid ${c.border2}`,
              borderRadius: 8, padding: '10px 12px', zIndex: 60, boxShadow: '0 8px 24px rgba(0,0,0,0.5)', maxWidth: 220,
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, color: c.text, marginBottom: 4 }}>{item.title}</div>
            <div style={{ fontSize: 10, color: c.muted }}>{item.channel} · {item.status}</div>
            {item.format && <div style={{ fontSize: 10, color: c.dim, marginTop: 2 }}>{item.format}</div>}
          </div>
        )
      })()}

      <NewContentDialog open={dialogOpen} onClose={() => { setDialogOpen(false); setDialogDate(undefined) }} defaultDate={dialogDate} />
    </div>
  )
}
