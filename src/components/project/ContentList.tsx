import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { useContentItems, useCreateContentItem, useDeleteContentItem } from '../../hooks/useContentItems'
import type { ContentStatus } from '../../types'

function safeDateLabel(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr + 'T00:00:00')
    if (isNaN(d.getTime())) return '—'
    return format(d, 'd MMM', { locale: es })
  } catch {
    return '—'
  }
}

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
  blue: '#3b82f6',
  red: '#ef4444',
}

const channelColors: Record<string, string> = {
  Instagram: '#c026d3',
  TikTok: '#14b8a6',
  Email: '#3b82f6',
  Blog: '#22c55e',
  YouTube: '#ef4444',
  'Twitter/X': '#6b6b7e',
}

const contentStatusStyles: Record<ContentStatus, { bg: string; color: string }> = {
  Idea: { bg: 'rgba(107,107,126,0.15)', color: c.muted },
  'En producción': { bg: 'rgba(59,130,246,0.12)', color: c.blue },
  Programado: { bg: 'rgba(245,158,11,0.12)', color: c.amber },
  Publicado: { bg: 'rgba(34,197,94,0.12)', color: c.green },
}

const channels = ['Instagram', 'TikTok', 'Email', 'Blog', 'YouTube', 'Twitter/X', 'Otro']
const formats = ['Video', 'Carrusel', 'Story', 'Newsletter', 'Artículo', 'Thread', 'Otro']
const statuses: ContentStatus[] = ['Idea', 'En producción', 'Programado', 'Publicado']

export default function ContentList({ projectId }: { projectId: string }) {
  const { data: items } = useContentItems(projectId)
  const createItem = useCreateContentItem()
  const deleteItem = useDeleteContentItem()

  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [channel, setChannel] = useState('Instagram')
  const [fmt, setFmt] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [status, setStatus] = useState<ContentStatus>('Idea')
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!title.trim()) return
    try {
      await createItem.mutateAsync({
        title: title.trim(),
        project_id: projectId,
        channel,
        format: fmt || null,
        scheduled_date: scheduledDate || null,
        status,
      })
      setTitle(''); setFmt(''); setScheduledDate(''); setStatus('Idea')
      setShowForm(false)
      toast.success('Contenido creado')
    } catch {
      toast.error('Error al crear contenido')
    }
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

  return (
    <div>
      {(!items || items.length === 0) && !showForm && (
        <div style={{ textAlign: 'center', padding: '24px 0', color: c.muted, fontSize: 13 }}>
          Sin contenido aún
        </div>
      )}

      {items?.map(item => {
        const hovered = hoveredId === item.id
        const chColor = channelColors[item.channel] ?? c.muted
        const sBadge = contentStatusStyles[item.status] ?? contentStatusStyles.Idea

        return (
          <div
            key={item.id}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 6px',
              borderRadius: 6,
              background: hovered ? c.surface2 : 'transparent',
              transition: 'background 0.1s',
            }}
          >
            {/* Channel chip */}
            <span style={{
              background: `${chColor}18`,
              color: chColor,
              padding: '1px 7px',
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 600,
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}>
              {item.channel}
            </span>

            {/* Title */}
            <span style={{ flex: 1, fontSize: 12.5, color: c.text, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.title}
            </span>

            {/* Format */}
            {item.format && (
              <span style={{ fontSize: 10, color: c.dim }}>{item.format}</span>
            )}

            {/* Date */}
            <span style={{ fontSize: 10, color: c.muted, flexShrink: 0 }}>
              {safeDateLabel(item.scheduled_date)}
            </span>

            {/* Status badge */}
            <span style={{
              background: sBadge.bg,
              color: sBadge.color,
              fontSize: 10,
              fontWeight: 500,
              padding: '1px 7px',
              borderRadius: 4,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}>
              {item.status}
            </span>

            {/* Delete */}
            {hovered && (
              <button
                onClick={() => deleteItem.mutate({ id: item.id, projectId })}
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
      })}

      {/* New content form */}
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
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setShowForm(false) }}
            placeholder="Título del contenido"
            style={{ ...inputStyle, flex: 1, minWidth: 140 }}
          />
          <select value={channel} onChange={e => setChannel(e.target.value)} style={{ ...inputStyle, width: 100 }}>
            {channels.map(ch => <option key={ch} value={ch}>{ch}</option>)}
          </select>
          <select value={fmt} onChange={e => setFmt(e.target.value)} style={{ ...inputStyle, width: 100 }}>
            <option value="">Formato</option>
            {formats.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} style={{ ...inputStyle, width: 130 }} />
          <select value={status} onChange={e => setStatus(e.target.value as ContentStatus)} style={{ ...inputStyle, width: 110 }}>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            onClick={handleCreate}
            disabled={createItem.isPending}
            style={{ background: c.accent, color: '#0a0a0b', border: 'none', borderRadius: 5, padding: '6px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
          >
            Crear
          </button>
          <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: c.muted, cursor: 'pointer', fontSize: 12 }}>
            Cancelar
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          style={{ background: 'none', border: 'none', color: c.accent, cursor: 'pointer', fontSize: 12, padding: '8px 6px', marginTop: 4 }}
        >
          + Nuevo contenido
        </button>
      )}
    </div>
  )
}
