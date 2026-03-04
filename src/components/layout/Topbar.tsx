import type { ReactNode } from 'react'

const c = {
  border: '#1e1e24',
  text: '#e8e8f0',
}

export default function Topbar({ title, rightContent }: { title: string; rightContent?: ReactNode }) {
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        height: 48,
        padding: '0 26px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(10,10,11,0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${c.border}`,
        zIndex: 20,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 700, color: c.text, letterSpacing: -0.3 }}>
        {title}
      </span>
      {rightContent && <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{rightContent}</div>}
    </div>
  )
}
