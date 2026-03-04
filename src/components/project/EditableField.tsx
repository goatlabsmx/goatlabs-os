import { useState, useRef, useEffect } from 'react'

const c = {
  surface2: '#18181d',
  border: '#1e1e24',
  text: '#e8e8f0',
  dim: '#3a3a48',
  accent: '#00D4D8',
}

interface EditableFieldProps {
  value: string | null
  onSave: (value: string) => void
  placeholder?: string
  multiline?: boolean
  label?: string
}

export default function EditableField({ value, onSave, placeholder = 'Sin definir', multiline, label }: EditableFieldProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')
  const [hovered, setHovered] = useState(false)
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editing) ref.current?.focus()
  }, [editing])

  useEffect(() => {
    setDraft(value ?? '')
  }, [value])

  const commit = () => {
    setEditing(false)
    if (draft !== (value ?? '')) onSave(draft)
  }

  const cancel = () => {
    setEditing(false)
    setDraft(value ?? '')
  }

  const sharedStyle: React.CSSProperties = {
    width: '100%',
    background: c.surface2,
    border: `1px solid ${c.accent}`,
    borderRadius: 4,
    color: c.text,
    padding: '4px 8px',
    fontSize: 'inherit',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
    resize: multiline ? 'vertical' : 'none',
  }

  if (editing) {
    const props = {
      ref: ref as any,
      value: draft,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(e.target.value),
      onBlur: commit,
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') cancel()
        if (e.key === 'Enter' && !multiline) commit()
      },
      style: sharedStyle,
    }

    return (
      <div>
        {label && <div style={{ fontSize: 9.5, fontFamily: 'monospace', color: '#6b6b7e', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>}
        {multiline
          ? <textarea {...props} rows={3} />
          : <input {...props} />
        }
      </div>
    )
  }

  return (
    <div
      onClick={() => setEditing(true)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: 'pointer',
        padding: '3px 6px',
        borderRadius: 4,
        border: `1px solid ${hovered ? c.border : 'transparent'}`,
        transition: 'border-color 0.12s',
        minHeight: 20,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 6,
      }}
    >
      {label && <div style={{ fontSize: 9.5, fontFamily: 'monospace', color: '#6b6b7e', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4, width: '100%' }}>{label}</div>}
      <span style={{
        flex: 1,
        color: value ? c.text : c.dim,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        fontSize: 'inherit',
      }}>
        {value || placeholder}
      </span>
      {hovered && <span style={{ color: c.dim, fontSize: 12, flexShrink: 0 }}>✎</span>}
    </div>
  )
}
