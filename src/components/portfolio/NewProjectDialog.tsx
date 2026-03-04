import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useCreateProject } from '../../hooks/useProjects'

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
  display: 'block',
  fontSize: 10,
  fontFamily: 'monospace',
  color: c.muted,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  marginBottom: 5,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  background: c.surface2,
  border: `1px solid ${c.border}`,
  borderRadius: 6,
  color: c.text,
  fontSize: 12.5,
  outline: 'none',
  boxSizing: 'border-box',
}

export default function NewProjectDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createProject = useCreateProject()
  const nameRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [mission, setMission] = useState('')
  const [vision, setVision] = useState('')
  const [northStarMetric, setNorthStarMetric] = useState('')

  useEffect(() => {
    if (open) {
      setTimeout(() => nameRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    try {
      await createProject.mutateAsync({
        name: name.trim(),
        url: url.trim() || null,
        description: description.trim() || null,
        mission: mission.trim() || null,
        vision: vision.trim() || null,
        north_star_metric: northStarMetric.trim() || null,
        status: 'Validando',
        priority: 'Media',
        validation_status: 'Sin validar',
        active_users: 0,
        revenue: 0,
        mrr: 0,
      })
      toast.success('Proyecto creado')
      setName(''); setUrl(''); setDescription(''); setMission(''); setVision(''); setNorthStarMetric('')
      onClose()
    } catch {
      toast.error('Error al crear proyecto')
    }
  }

  const focusHandler = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = c.accent
  }
  const blurHandler = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = c.border
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: c.surface,
          border: `1px solid ${c.border2}`,
          borderRadius: 12,
          padding: 22,
          width: 520,
          maxWidth: '90vw',
          maxHeight: '85vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: c.text, marginBottom: 18 }}>
          Nuevo proyecto
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Nombre *</label>
            <input
              ref={nameRef}
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="Mi proyecto"
              style={inputStyle}
              onFocus={focusHandler}
              onBlur={blurHandler}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>URL</label>
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="ej. miproyecto.mx"
              style={inputStyle}
              onFocus={focusHandler}
              onBlur={blurHandler}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Descripción</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
              onFocus={focusHandler as any}
              onBlur={blurHandler as any}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div>
              <label style={labelStyle}>Misión</label>
              <input
                value={mission}
                onChange={e => setMission(e.target.value)}
                placeholder="¿Por qué existe?"
                style={inputStyle}
                onFocus={focusHandler}
                onBlur={blurHandler}
              />
            </div>
            <div>
              <label style={labelStyle}>Visión</label>
              <input
                value={vision}
                onChange={e => setVision(e.target.value)}
                placeholder="¿Dónde quiere llegar?"
                style={inputStyle}
                onFocus={focusHandler}
                onBlur={blurHandler}
              />
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>North Star Metric</label>
            <input
              value={northStarMetric}
              onChange={e => setNorthStarMetric(e.target.value)}
              placeholder="ej. Órdenes semanales"
              style={inputStyle}
              onFocus={focusHandler}
              onBlur={blurHandler}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '7px 16px',
                background: 'transparent',
                color: c.muted,
                border: `1px solid ${c.border2}`,
                borderRadius: 6,
                fontSize: 12.5,
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createProject.isPending}
              style={{
                padding: '7px 16px',
                background: c.accent,
                color: c.bg,
                border: 'none',
                borderRadius: 6,
                fontSize: 12.5,
                fontWeight: 600,
                cursor: createProject.isPending ? 'not-allowed' : 'pointer',
                opacity: createProject.isPending ? 0.6 : 1,
              }}
            >
              {createProject.isPending ? 'Creando…' : 'Crear proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
