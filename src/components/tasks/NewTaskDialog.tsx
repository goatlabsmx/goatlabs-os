import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useProjects } from '../../hooks/useProjects'
import { useCreateTask } from '../../hooks/useTasks'
import type { TaskArea, TaskStatus } from '../../types'

const c = {
  bg: '#0a0a0b',
  surface: '#111114',
  surface2: '#18181d',
  border: '#1e1e24',
  border2: '#2a2a33',
  text: '#e8e8f0',
  muted: '#6b6b7e',
  accent: '#00D4D8',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 10, fontFamily: 'monospace', color: c.muted,
  textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5,
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 10px', background: c.surface2, border: `1px solid ${c.border}`,
  borderRadius: 6, color: c.text, fontSize: 12.5, outline: 'none', boxSizing: 'border-box',
}

const gtmTypes = ['Email', 'Redes', 'Promo', 'Partnerships', 'Otro']
const devTypes = ['Bug', 'Improvement', 'Feature', 'Roadmap']

export default function NewTaskDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: projects } = useProjects()
  const createTask = useCreateTask()
  const titleRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [projectId, setProjectId] = useState('')
  const [area, setArea] = useState<TaskArea>('Dev')
  const [type, setType] = useState('')
  const [status, setStatus] = useState<TaskStatus>('Pendiente')
  const [dueDate, setDueDate] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (open) setTimeout(() => titleRef.current?.focus(), 50)
  }, [open])

  useEffect(() => {
    if (open && projects?.length && !projectId) setProjectId(projects[0].id)
  }, [open, projects, projectId])

  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !projectId) return
    try {
      await createTask.mutateAsync({
        title: title.trim(),
        project_id: projectId,
        area,
        type: type || null,
        status,
        priority: 'Media',
        due_date: dueDate || null,
        description: description.trim() || null,
      })
      toast.success('Tarea creada')
      setTitle(''); setType(''); setDueDate(''); setDescription(''); setStatus('Pendiente')
      onClose()
    } catch {
      toast.error('Error al crear tarea')
    }
  }

  const focusH = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { e.currentTarget.style.borderColor = c.accent }
  const blurH = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { e.currentTarget.style.borderColor = c.border }
  const typeOptions = area === 'GTM' ? gtmTypes : devTypes

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 12, padding: 22, width: 480, maxWidth: '90vw', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: c.text, marginBottom: 18 }}>Nueva tarea</div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Título *</label>
            <input ref={titleRef} value={title} onChange={e => setTitle(e.target.value)} required placeholder="Título de la tarea" style={inputStyle} onFocus={focusH} onBlur={blurH} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Proyecto *</label>
            <select value={projectId} onChange={e => setProjectId(e.target.value)} required style={inputStyle} onFocus={focusH as any} onBlur={blurH as any}>
              {projects?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div>
              <label style={labelStyle}>Área</label>
              <div style={{ display: 'flex', gap: 4 }}>
                {(['GTM', 'Dev'] as TaskArea[]).map(a => (
                  <button key={a} type="button" onClick={() => { setArea(a); setType('') }}
                    style={{ flex: 1, padding: '7px 0', background: area === a ? 'rgba(0,212,216,0.12)' : 'transparent', color: area === a ? c.accent : c.muted, border: `1px solid ${area === a ? 'rgba(0,212,216,0.3)' : c.border}`, borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Tipo</label>
              <select value={type} onChange={e => setType(e.target.value)} style={inputStyle} onFocus={focusH as any} onBlur={blurH as any}>
                <option value="">Sin tipo</option>
                {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div>
              <label style={labelStyle}>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as TaskStatus)} style={inputStyle} onFocus={focusH as any} onBlur={blurH as any}>
                <option value="Pendiente">Pendiente</option>
                <option value="En progreso">En progreso</option>
                <option value="Bloqueado">Bloqueado</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Fecha límite</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={inputStyle} onFocus={focusH} onBlur={blurH} />
            </div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Descripción</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Opcional" style={{ ...inputStyle, resize: 'vertical' }} onFocus={focusH as any} onBlur={blurH as any} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" onClick={onClose} style={{ padding: '7px 16px', background: 'transparent', color: c.muted, border: `1px solid ${c.border2}`, borderRadius: 6, fontSize: 12.5, cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" disabled={createTask.isPending} style={{ padding: '7px 16px', background: c.accent, color: c.bg, border: 'none', borderRadius: 6, fontSize: 12.5, fontWeight: 600, cursor: createTask.isPending ? 'not-allowed' : 'pointer', opacity: createTask.isPending ? 0.6 : 1 }}>
              {createTask.isPending ? 'Creando…' : 'Crear tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
