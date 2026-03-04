import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useUpdateProject } from '../../hooks/useProjects'
import type { Project, ProjectStatus, Priority, ValidationStatus } from '../../types'

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

const statuses: ProjectStatus[] = ['Activo', 'Validando', 'Pausado', 'Descontinuado']
const priorities: Priority[] = ['Alta', 'Media', 'Baja']
const validationStatuses: ValidationStatus[] = ['Sin validar', 'Validada parcialmente', 'Validada', 'Descartada']

export default function EditProjectDialog({ project, open, onClose }: { project: Project; open: boolean; onClose: () => void }) {
  const updateProject = useUpdateProject()

  const [name, setName] = useState(project.name)
  const [url, setUrl] = useState(project.url ?? '')
  const [status, setStatus] = useState<ProjectStatus>(project.status)
  const [priority, setPriority] = useState<Priority>(project.priority)
  const [northStarMetric, setNorthStarMetric] = useState(project.north_star_metric ?? '')
  const [currentPhase, setCurrentPhase] = useState(project.current_phase ?? '')
  const [activeUsers, setActiveUsers] = useState(String(project.active_users))
  const [mrr, setMrr] = useState(String(project.mrr))
  const [mainBlocker, setMainBlocker] = useState(project.main_blocker ?? '')
  const [nextMilestone, setNextMilestone] = useState(project.next_milestone ?? '')
  const [hypothesis, setHypothesis] = useState(project.hypothesis ?? '')
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>(project.validation_status)
  const [targetAudience, setTargetAudience] = useState(project.target_audience ?? '')
  const [mainChannel, setMainChannel] = useState(project.main_channel ?? '')
  const [contentType, setContentType] = useState(project.content_type ?? '')
  const [contentKpi, setContentKpi] = useState(project.content_kpi ?? '')

  useEffect(() => {
    if (open) {
      setName(project.name)
      setUrl(project.url ?? '')
      setStatus(project.status)
      setPriority(project.priority)
      setNorthStarMetric(project.north_star_metric ?? '')
      setCurrentPhase(project.current_phase ?? '')
      setActiveUsers(String(project.active_users))
      setMrr(String(project.mrr))
      setMainBlocker(project.main_blocker ?? '')
      setNextMilestone(project.next_milestone ?? '')
      setHypothesis(project.hypothesis ?? '')
      setValidationStatus(project.validation_status)
      setTargetAudience(project.target_audience ?? '')
      setMainChannel(project.main_channel ?? '')
      setContentType(project.content_type ?? '')
      setContentKpi(project.content_kpi ?? '')
    }
  }, [open, project])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateProject.mutateAsync({
        id: project.id,
        name: name.trim(),
        url: url.trim() || null,
        status,
        priority,
        north_star_metric: northStarMetric.trim() || null,
        current_phase: currentPhase.trim() || null,
        active_users: Number(activeUsers) || 0,
        mrr: Number(mrr) || 0,
        main_blocker: mainBlocker.trim() || null,
        next_milestone: nextMilestone.trim() || null,
        hypothesis: hypothesis.trim() || null,
        validation_status: validationStatus,
        target_audience: targetAudience.trim() || null,
        main_channel: mainChannel.trim() || null,
        content_type: contentType.trim() || null,
        content_kpi: contentKpi.trim() || null,
      })
      toast.success('Proyecto actualizado')
      onClose()
    } catch {
      toast.error('Error al actualizar')
    }
  }

  const focusH = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = c.accent }
  const blurH = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = c.border }

  const row = (lbl: string, input: React.ReactNode) => (
    <div style={{ marginBottom: 12 }}>
      <label style={labelStyle}>{lbl}</label>
      {input}
    </div>
  )

  const twoCol = (a: React.ReactNode, b: React.ReactNode) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>{a}{b}</div>
  )

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 12, padding: 22, width: 560, maxWidth: '90vw', maxHeight: '85vh', overflowY: 'auto' }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: c.text, marginBottom: 18 }}>Editar proyecto</div>

        <form onSubmit={handleSubmit}>
          {row('Nombre *', <input value={name} onChange={e => setName(e.target.value)} required style={inputStyle} onFocus={focusH} onBlur={blurH} />)}

          {twoCol(
            <div><label style={labelStyle}>URL</label><input value={url} onChange={e => setUrl(e.target.value)} style={inputStyle} onFocus={focusH} onBlur={blurH} /></div>,
            <div><label style={labelStyle}>North Star Metric</label><input value={northStarMetric} onChange={e => setNorthStarMetric(e.target.value)} style={inputStyle} onFocus={focusH} onBlur={blurH} /></div>,
          )}

          {twoCol(
            <div>
              <label style={labelStyle}>Estado</label>
              <select value={status} onChange={e => setStatus(e.target.value as ProjectStatus)} style={inputStyle} onFocus={focusH as any} onBlur={blurH as any}>
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>,
            <div>
              <label style={labelStyle}>Prioridad</label>
              <select value={priority} onChange={e => setPriority(e.target.value as Priority)} style={inputStyle} onFocus={focusH as any} onBlur={blurH as any}>
                {priorities.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>,
          )}

          {twoCol(
            <div><label style={labelStyle}>Usuarios activos</label><input type="number" value={activeUsers} onChange={e => setActiveUsers(e.target.value)} style={inputStyle} onFocus={focusH} onBlur={blurH} /></div>,
            <div><label style={labelStyle}>MRR</label><input type="number" value={mrr} onChange={e => setMrr(e.target.value)} style={inputStyle} onFocus={focusH} onBlur={blurH} /></div>,
          )}

          {row('Fase actual', <input value={currentPhase} onChange={e => setCurrentPhase(e.target.value)} style={inputStyle} onFocus={focusH} onBlur={blurH} />)}
          {row('Bloqueo principal', <input value={mainBlocker} onChange={e => setMainBlocker(e.target.value)} style={inputStyle} onFocus={focusH} onBlur={blurH} />)}
          {row('Próximo hito', <input value={nextMilestone} onChange={e => setNextMilestone(e.target.value)} style={inputStyle} onFocus={focusH} onBlur={blurH} />)}
          {row('Hipótesis', <input value={hypothesis} onChange={e => setHypothesis(e.target.value)} style={inputStyle} onFocus={focusH} onBlur={blurH} />)}

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Estado de validación</label>
            <select value={validationStatus} onChange={e => setValidationStatus(e.target.value as ValidationStatus)} style={inputStyle} onFocus={focusH as any} onBlur={blurH as any}>
              {validationStatuses.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          {twoCol(
            <div><label style={labelStyle}>Audiencia objetivo</label><input value={targetAudience} onChange={e => setTargetAudience(e.target.value)} style={inputStyle} onFocus={focusH} onBlur={blurH} /></div>,
            <div><label style={labelStyle}>Canal principal</label><input value={mainChannel} onChange={e => setMainChannel(e.target.value)} style={inputStyle} onFocus={focusH} onBlur={blurH} /></div>,
          )}

          {twoCol(
            <div><label style={labelStyle}>Tipo de contenido</label><input value={contentType} onChange={e => setContentType(e.target.value)} style={inputStyle} onFocus={focusH} onBlur={blurH} /></div>,
            <div><label style={labelStyle}>KPI de contenido</label><input value={contentKpi} onChange={e => setContentKpi(e.target.value)} style={inputStyle} onFocus={focusH} onBlur={blurH} /></div>,
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
            <button type="button" onClick={onClose} style={{ padding: '7px 16px', background: 'transparent', color: c.muted, border: `1px solid ${c.border2}`, borderRadius: 6, fontSize: 12.5, cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="submit" disabled={updateProject.isPending} style={{ padding: '7px 16px', background: c.accent, color: c.bg, border: 'none', borderRadius: 6, fontSize: 12.5, fontWeight: 600, cursor: updateProject.isPending ? 'not-allowed' : 'pointer', opacity: updateProject.isPending ? 0.6 : 1 }}>
              {updateProject.isPending ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
