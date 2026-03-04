import { useState, useRef, useEffect } from 'react'
import StatusBadge from '../ui/StatusBadge'
import type { ProjectStatus } from '../../types'

const allStatuses: ProjectStatus[] = ['Activo', 'Validando', 'Pausado', 'Descontinuado']

export default function StatusPicker({ status, onSelect }: { status: ProjectStatus; onSelect: (s: ProjectStatus) => void }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <div onClick={() => setOpen(!open)} style={{ cursor: 'pointer' }}>
        <StatusBadge status={status} />
      </div>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 4,
            background: '#18181d',
            border: '1px solid #2a2a33',
            borderRadius: 8,
            padding: 4,
            minWidth: 160,
            zIndex: 50,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          }}
        >
          {allStatuses.map(s => (
            <div
              key={s}
              onClick={() => { onSelect(s); setOpen(false) }}
              style={{
                padding: '6px 8px',
                borderRadius: 5,
                cursor: 'pointer',
                background: s === status ? 'rgba(0,212,216,0.08)' : 'transparent',
              }}
              onMouseEnter={e => { if (s !== status) (e.currentTarget.style.background = '#111114') }}
              onMouseLeave={e => { if (s !== status) (e.currentTarget.style.background = 'transparent') }}
            >
              <StatusBadge status={s} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
