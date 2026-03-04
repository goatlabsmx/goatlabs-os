import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import Topbar from '../components/layout/Topbar'
import EditableField from '../components/project/EditableField'
import StatusPicker from '../components/project/StatusPicker'
import TaskList from '../components/project/TaskList'
import ContentList from '../components/project/ContentList'
import EditProjectDialog from '../components/project/EditProjectDialog'
import { useProject, useUpdateProject } from '../hooks/useProjects'
import { useTasks } from '../hooks/useTasks'
import { useContentItems } from '../hooks/useContentItems'
import type { TaskArea, ProjectStatus, ValidationStatus, ProjectAccount } from '../types'

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

const tabs = ['Pulse', 'Build', 'Contenido', 'Crecimiento', 'Finanzas', 'Notas & Cuentas'] as const
type Tab = typeof tabs[number]

const cardStyle: React.CSSProperties = {
  background: c.surface,
  border: `1px solid ${c.border}`,
  borderRadius: 10,
  padding: 16,
}

const sectionLabel: React.CSSProperties = {
  fontSize: 9.5,
  fontFamily: 'monospace',
  color: c.dim,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  marginBottom: 8,
}

const validationOptions: ValidationStatus[] = ['Sin validar', 'Validada parcialmente', 'Validada', 'Descartada']

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: project, isLoading } = useProject(id!)
  const updateProject = useUpdateProject()
  const { data: tasks } = useTasks(id!)
  const { data: contentItems } = useContentItems(id!)

  const [activeTab, setActiveTab] = useState<Tab>('Pulse')
  const [editOpen, setEditOpen] = useState(false)
  const [buildArea, setBuildArea] = useState<TaskArea>('Dev')

  const activeTasks = tasks?.filter(t => t.status !== 'Done').length ?? 0
  const contentCount = contentItems?.length ?? 0

  const save = (field: string, value: string | number | null) => {
    if (!project) return
    updateProject.mutate({ id: project.id, [field]: value })
  }

  if (isLoading || !project) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: 28, height: 28, border: `3px solid ${c.border}`, borderTopColor: c.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <div>
      {/* Topbar */}
      <Topbar
        title=""
        rightContent={
          <button
            onClick={() => setEditOpen(true)}
            style={{ border: `1px solid ${c.border2}`, background: 'transparent', color: c.muted, borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.background = c.surface2; e.currentTarget.style.color = c.text }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = c.muted }}
          >
            ✎ Editar
          </button>
        }
      />

      {/* Project header */}
      <div style={{ padding: '10px 26px 0', borderBottom: `1px solid ${c.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <button
            onClick={() => navigate('/portfolio')}
            style={{ background: 'none', border: 'none', color: c.muted, cursor: 'pointer', fontSize: 16, padding: 0, lineHeight: 1 }}
          >
            ←
          </button>
          <div style={{ fontSize: 18, fontWeight: 700, flex: 1 }}>
            <EditableField
              value={project.name}
              onSave={val => save('name', val)}
              placeholder="Nombre del proyecto"
            />
          </div>
          <StatusPicker
            status={project.status}
            onSelect={s => save('status', s)}
          />
        </div>
        {project.url && (
          <a
            href={project.url.startsWith('http') ? project.url : `https://${project.url}`}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 11, color: c.muted, textDecoration: 'none', marginLeft: 26, display: 'inline-block', marginBottom: 10 }}
          >
            {project.url} ↗
          </a>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginTop: 6 }}>
          {tabs.map(tab => {
            const active = activeTab === tab
            let badge: number | null = null
            if (tab === 'Build') badge = activeTasks || null
            if (tab === 'Contenido') badge = contentCount || null

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: `2px solid ${active ? c.accent : 'transparent'}`,
                  color: active ? c.text : c.muted,
                  padding: '10px 14px',
                  fontSize: 12.5,
                  cursor: 'pointer',
                  fontWeight: active ? 600 : 400,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  transition: 'color 0.12s',
                }}
              >
                {tab}
                {badge && (
                  <span style={{
                    background: 'rgba(0,212,216,0.12)',
                    color: c.accent,
                    fontSize: 9,
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: 6,
                    lineHeight: '14px',
                  }}>
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ padding: '18px 26px', maxWidth: 1100 }}>
        {activeTab === 'Pulse' && <PulseTab project={project} save={save} />}
        {activeTab === 'Build' && (
          <div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
              {(['GTM', 'Dev'] as TaskArea[]).map(a => (
                <button
                  key={a}
                  onClick={() => setBuildArea(a)}
                  style={{
                    background: buildArea === a ? 'rgba(0,212,216,0.12)' : 'transparent',
                    color: buildArea === a ? c.accent : c.muted,
                    border: `1px solid ${buildArea === a ? 'rgba(0,212,216,0.3)' : c.border}`,
                    borderRadius: 6,
                    padding: '5px 14px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
            <div style={cardStyle}>
              <TaskList projectId={project.id} area={buildArea} />
            </div>
          </div>
        )}
        {activeTab === 'Contenido' && (
          <div style={cardStyle}>
            <ContentList projectId={project.id} />
          </div>
        )}
        {activeTab === 'Crecimiento' && (
          <div style={{ ...cardStyle, textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: c.text, marginBottom: 8 }}>Módulo de Crecimiento — disponible en V2</div>
            <div style={{ fontSize: 12, color: c.muted, lineHeight: 1.6 }}>
              Gráfica de crecimiento de usuarios, retención D7/D30, canales de adquisición
            </div>
          </div>
        )}
        {activeTab === 'Finanzas' && (
          <div style={{ ...cardStyle, textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: c.text, marginBottom: 8 }}>Módulo de Finanzas — disponible en V2</div>
            <div style={{ fontSize: 12, color: c.muted, lineHeight: 1.6 }}>
              Historial de MRR, unit economics, integración con Stripe
            </div>
          </div>
        )}
        {activeTab === 'Notas & Cuentas' && <NotasTab project={project} save={save} />}
      </div>

      {editOpen && <EditProjectDialog project={project} open={editOpen} onClose={() => setEditOpen(false)} />}
    </div>
  )
}

/* ─── Pulse Tab ─── */

function PulseTab({ project, save }: { project: any; save: (f: string, v: any) => void }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
      {/* Left */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Identidad */}
        <div style={{ ...cardS, padding: 16 }}>
          <div style={secLabel}>Identidad</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <div style={{ minWidth: 0, wordWrap: 'break-word', overflowWrap: 'break-word', maxWidth: '100%', paddingRight: 20 }}>
              <div style={fieldLabel}>Descripción</div>
              <div style={{ fontSize: 12.5, maxWidth: '100%' }}>
                <EditableField value={project.description} onSave={v => save('description', v)} placeholder="¿Qué hace?" multiline />
              </div>
            </div>
            <div style={{ minWidth: 0, wordWrap: 'break-word', overflowWrap: 'break-word', maxWidth: '100%', paddingRight: 20 }}>
              <div style={fieldLabel}>Misión</div>
              <div style={{ fontSize: 12.5, fontStyle: 'italic', color: '#9b9bae', maxWidth: '100%' }}>
                <EditableField value={project.mission} onSave={v => save('mission', v)} placeholder="¿Por qué existe?" />
              </div>
            </div>
            <div style={{ minWidth: 0, wordWrap: 'break-word', overflowWrap: 'break-word', maxWidth: '100%' }}>
              <div style={fieldLabel}>Visión</div>
              <div style={{ fontSize: 12.5, fontStyle: 'italic', color: '#9b9bae', maxWidth: '100%' }}>
                <EditableField value={project.vision} onSave={v => save('vision', v)} placeholder="¿Dónde quiere llegar?" />
              </div>
            </div>
          </div>
        </div>

        {/* Estado operativo */}
        <div style={{ ...cardS, padding: 16 }}>
          <div style={secLabel}>Estado operativo</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <div style={fieldLabel}>🚨 Bloqueo principal</div>
              <div style={{ fontSize: 12.5, color: project.main_blocker ? '#ef4444' : undefined }}>
                <EditableField value={project.main_blocker} onSave={v => save('main_blocker', v || null)} placeholder="Sin bloqueos" />
              </div>
            </div>
            <div>
              <div style={fieldLabel}>🎯 Próximo hito</div>
              <div style={{ fontSize: 12.5 }}>
                <EditableField value={project.next_milestone} onSave={v => save('next_milestone', v || null)} placeholder="Sin definir" />
              </div>
            </div>
            <div>
              <div style={fieldLabel}>💡 Hipótesis</div>
              <div style={{ fontSize: 12.5 }}>
                <EditableField value={project.hypothesis} onSave={v => save('hypothesis', v || null)} placeholder="Sin definir" />
              </div>
            </div>
          </div>
        </div>

        {/* Validación */}
        <div style={{ ...cardS, padding: 16 }}>
          <div style={secLabel}>Validación</div>
          <div style={{ marginBottom: 10 }}>
            <div style={fieldLabel}>Estado de validación</div>
            <select
              value={project.validation_status}
              onChange={e => save('validation_status', e.target.value)}
              style={{
                background: '#18181d',
                border: '1px solid #1e1e24',
                borderRadius: 5,
                color: '#e8e8f0',
                padding: '5px 8px',
                fontSize: 12,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {validationOptions.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <div style={fieldLabel}>Evidencia de validación</div>
            <div style={{ fontSize: 12.5 }}>
              <EditableField value={project.validation_evidence} onSave={v => save('validation_evidence', v || null)} placeholder="Sin evidencia aún" multiline />
            </div>
          </div>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Métricas */}
        <div style={{ ...cardS, padding: 16 }}>
          <div style={secLabel}>Métricas</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <MetricRow label="Usuarios activos" value={project.active_users} color="#e8e8f0" field="active_users" save={save} />
            <MetricRow label="MRR" value={project.mrr} color="#00D4D8" field="mrr" save={save} prefix="$" />
            <div>
              <div style={fieldLabel}>North Star Metric</div>
              <div style={{ fontSize: 12 }}>
                <EditableField value={project.north_star_metric} onSave={v => save('north_star_metric', v || null)} placeholder="ej. Órdenes semanales" />
              </div>
            </div>
            <MetricRow label="North Star Value" value={project.north_star_value} color="#00D4D8" field="north_star_value" save={save} />
            <div>
              <div style={fieldLabel}>Fase actual</div>
              <div style={{ fontSize: 12 }}>
                <EditableField value={project.current_phase} onSave={v => save('current_phase', v || null)} placeholder="ej. MVP" />
              </div>
            </div>
          </div>
        </div>

        {/* Contenido mini */}
        <div style={{ ...cardS, padding: 16 }}>
          <div style={secLabel}>Contenido & Crecimiento</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div>
              <div style={fieldLabel}>Audiencia objetivo</div>
              <div style={{ fontSize: 12 }}>
                <EditableField value={project.target_audience} onSave={v => save('target_audience', v || null)} placeholder="Sin definir" />
              </div>
            </div>
            <div>
              <div style={fieldLabel}>Canal principal</div>
              <div style={{ fontSize: 12 }}>
                <EditableField value={project.main_channel} onSave={v => save('main_channel', v || null)} placeholder="Sin definir" />
              </div>
            </div>
            <div>
              <div style={fieldLabel}>Tipo de contenido</div>
              <div style={{ fontSize: 12 }}>
                <EditableField value={project.content_type} onSave={v => save('content_type', v || null)} placeholder="Sin definir" />
              </div>
            </div>
            <div>
              <div style={fieldLabel}>KPI de contenido</div>
              <div style={{ fontSize: 12 }}>
                <EditableField value={project.content_kpi} onSave={v => save('content_kpi', v || null)} placeholder="Sin definir" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricRow({ label, value, color, field, save, prefix }: {
  label: string; value: number; color: string; field: string; save: (f: string, v: any) => void; prefix?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(value))

  const commit = () => {
    setEditing(false)
    const num = Number(draft) || 0
    if (num !== value) save(field, num)
  }

  return (
    <div>
      <div style={fieldLabel}>{label}</div>
      {editing ? (
        <input
          autoFocus
          type="number"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setEditing(false); setDraft(String(value)) } }}
          style={{ background: '#18181d', border: '1px solid #00D4D8', borderRadius: 4, color: '#e8e8f0', padding: '3px 6px', fontSize: 20, fontWeight: 700, width: 120, outline: 'none' }}
        />
      ) : (
        <div
          onClick={() => { setDraft(String(value)); setEditing(true) }}
          style={{ fontSize: 22, fontWeight: 700, color, letterSpacing: -0.5, cursor: 'pointer' }}
        >
          {prefix}{value.toLocaleString()}
        </div>
      )}
    </div>
  )
}

/* ─── Notas & Cuentas Tab ─── */

function NotasTab({ project, save }: { project: any; save: (f: string, v: any) => void }) {
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesDraft, setNotesDraft] = useState(project.notes ?? '')
  const [showAccountForm, setShowAccountForm] = useState(false)
  const [accType, setAccType] = useState('')
  const [accId, setAccId] = useState('')
  const [accNote, setAccNote] = useState('')
  const [accUrl, setAccUrl] = useState('')

  const accounts: ProjectAccount[] = project.accounts ?? []

  const saveNotes = () => {
    save('notes', notesDraft.trim() || null)
    setEditingNotes(false)
    toast.success('Notas guardadas')
  }

  const addAccount = () => {
    if (!accType.trim() || !accId.trim()) return
    const newAcc: ProjectAccount = {
      id: crypto.randomUUID(),
      type: accType.trim(),
      identifier: accId.trim(),
      note: accNote.trim() || undefined,
      url: accUrl.trim() || undefined,
    }
    save('accounts', [...accounts, newAcc])
    setAccType(''); setAccId(''); setAccNote(''); setAccUrl('')
    setShowAccountForm(false)
    toast.success('Cuenta agregada')
  }

  const removeAccount = (accId: string) => {
    save('accounts', accounts.filter(a => a.id !== accId))
  }

  const inputStyle: React.CSSProperties = {
    background: '#18181d',
    border: '1px solid #1e1e24',
    borderRadius: 5,
    color: '#e8e8f0',
    padding: '6px 8px',
    fontSize: 12,
    outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Notas */}
      <div style={{ ...cardS, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={secLabel as any}>Notas</div>
          <button
            onClick={() => { setNotesDraft(project.notes ?? ''); setEditingNotes(true) }}
            style={{ background: 'none', border: 'none', color: '#6b6b7e', cursor: 'pointer', fontSize: 11 }}
          >
            ✎ Editar
          </button>
        </div>
        {editingNotes ? (
          <div>
            <textarea
              autoFocus
              value={notesDraft}
              onChange={e => setNotesDraft(e.target.value)}
              rows={8}
              style={{ ...inputStyle, width: '100%', resize: 'vertical', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <button onClick={saveNotes} style={{ background: '#00D4D8', color: '#0a0a0b', border: 'none', borderRadius: 5, padding: '5px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Guardar</button>
              <button onClick={() => setEditingNotes(false)} style={{ background: 'none', border: 'none', color: '#6b6b7e', cursor: 'pointer', fontSize: 11 }}>Cancelar</button>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 12.5, color: project.notes ? '#e8e8f0' : '#3a3a48', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {project.notes || 'Sin notas'}
          </div>
        )}
      </div>

      {/* Cuentas */}
      <div style={{ ...cardS, padding: 16 }}>
        <div style={secLabel}>Cuentas &amp; Accesos</div>
        <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)', borderRadius: 6, padding: '8px 12px', fontSize: 11, color: '#f59e0b', marginBottom: 12 }}>
          ⚠ No guardes contraseñas aquí — usa 1Password
        </div>

        {accounts.length === 0 && !showAccountForm && (
          <div style={{ fontSize: 12, color: '#6b6b7e', padding: '8px 0' }}>Sin cuentas registradas</div>
        )}

        {accounts.map(acc => (
          <AccountRow key={acc.id} account={acc} onDelete={() => removeAccount(acc.id)} />
        ))}

        {showAccountForm ? (
          <div style={{ display: 'flex', gap: 6, padding: '8px 0', flexWrap: 'wrap', alignItems: 'center' }}>
            <input value={accType} onChange={e => setAccType(e.target.value)} placeholder="Tipo (ej. Hosting)" style={{ ...inputStyle, width: 100 }} />
            <input value={accId} onChange={e => setAccId(e.target.value)} placeholder="Identificador" style={{ ...inputStyle, flex: 1, minWidth: 120 }} />
            <input value={accNote} onChange={e => setAccNote(e.target.value)} placeholder="Nota" style={{ ...inputStyle, width: 120 }} />
            <input value={accUrl} onChange={e => setAccUrl(e.target.value)} placeholder="URL" style={{ ...inputStyle, width: 140 }} />
            <button onClick={addAccount} style={{ background: '#00D4D8', color: '#0a0a0b', border: 'none', borderRadius: 5, padding: '5px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Agregar</button>
            <button onClick={() => setShowAccountForm(false)} style={{ background: 'none', border: 'none', color: '#6b6b7e', cursor: 'pointer', fontSize: 11 }}>Cancelar</button>
          </div>
        ) : (
          <button onClick={() => setShowAccountForm(true)} style={{ background: 'none', border: 'none', color: '#00D4D8', cursor: 'pointer', fontSize: 12, padding: '6px 0', marginTop: 4 }}>
            + Agregar cuenta
          </button>
        )}
      </div>
    </div>
  )
}

function AccountRow({ account, onDelete }: { account: ProjectAccount; onDelete: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid #1e1e24', fontSize: 12 }}
    >
      <span style={{ fontWeight: 600, color: '#6b6b7e', minWidth: 80 }}>{account.type}</span>
      <span style={{ color: '#e8e8f0', flex: 1 }}>{account.identifier}</span>
      {account.note && <span style={{ color: '#3a3a48', fontSize: 11 }}>{account.note}</span>}
      {account.url && (
        <a href={account.url.startsWith('http') ? account.url : `https://${account.url}`} target="_blank" rel="noreferrer" style={{ color: '#6b6b7e', fontSize: 11, textDecoration: 'none' }}>
          ↗
        </a>
      )}
      {hovered && (
        <button onClick={onDelete} style={{ background: 'none', border: 'none', color: '#3a3a48', cursor: 'pointer', fontSize: 14, padding: '0 2px', lineHeight: 1 }}>
          ×
        </button>
      )}
    </div>
  )
}

/* ─── Shared styles ─── */

const cardS: React.CSSProperties = {
  background: '#111114',
  border: '1px solid #1e1e24',
  borderRadius: 10,
}

const secLabel: React.CSSProperties = {
  fontSize: 9.5,
  fontFamily: 'monospace',
  color: '#3a3a48',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  marginBottom: 10,
  fontWeight: 600,
}

const fieldLabel: React.CSSProperties = {
  fontSize: 10,
  fontFamily: 'monospace',
  color: '#6b6b7e',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: 4,
}
