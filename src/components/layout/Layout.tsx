import type { ReactNode } from 'react'
import Sidebar from './Sidebar'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0b', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0, overflowX: 'hidden' }}>
        {children}
      </main>
    </div>
  )
}
