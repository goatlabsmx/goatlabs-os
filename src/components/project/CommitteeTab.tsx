import { useState } from 'react'
import { useCommittee } from '../../hooks/useCommittee'
import { useCommitteeSessions } from '../../hooks/useCommitteeSessions'
import type { Project } from '../../types'

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
}

interface Props {
  project: Project
}

export default function CommitteeTab({ project }: Props) {
  useCommitteeSessions(project.id)
  const { sessions, currentSession, loading, openSession, askQuestion, setCurrentSession } = useCommittee(project)
  const [objective, setObjective] = useState('')
  const [question, setQuestion] = useState('')
  const [view, setView] = useState<'new' | 'session' | 'history'>('new')

  const handleOpenSession = async () => {
    if (!objective.trim()) return
    setView('session')
    await openSession(objective)
    setObjective('')
  }

  const handleAskQuestion = async () => {
    if (!question.trim()) return
    await askQuestion(question)
    setQuestion('')
  }

  const memberColors: Record<string, string> = {
    'Chair': c.accent,
    'CFO': c.green,
    'CMO': '#c026d3',
    'CTO': c.amber,
    'Usuario': '#3b82f6',
    "Devil's Advocate": c.red,
    'Investor': '#10b981',
    'Historiador': '#8b5cf6',
  }

  return (
    <div style={{ padding: '22px 26px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: c.text }}>AI Committee</div>
          <div style={{ fontSize: 12, color: c.muted, marginTop: 2 }}>8 expertos analizan tu proyecto en tiempo real</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setView('new')}
            style={{
              padding: '6px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 500,
              background: view === 'new' ? 'rgba(0,212,216,0.1)' : 'transparent',
              border: `1px solid ${view === 'new' ? 'rgba(0,212,216,0.3)' : c.border}`,
              color: view === 'new' ? c.accent : c.muted
            }}
          >
            + Nueva sesión
          </button>
          {sessions.length > 0 && (
            <button
              onClick={() => setView('history')}
              style={{
                padding: '6px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 500,
                background: view === 'history' ? 'rgba(0,212,216,0.1)' : 'transparent',
                border: `1px solid ${view === 'history' ? 'rgba(0,212,216,0.3)' : c.border}`,
                color: view === 'history' ? c.accent : c.muted
              }}
            >
              Historial ({sessions.length})
            </button>
          )}
        </div>
      </div>

      {/* NEW SESSION VIEW */}
      {view === 'new' && (
        <div style={{ maxWidth: 600 }}>
          <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: c.text, marginBottom: 6 }}>¿Cuál es el objetivo de esta sesión?</div>
            <div style={{ fontSize: 11, color: c.muted, marginBottom: 16 }}>
              Sé específico. Ej: "¿Debo cobrar $99 o $49/mes?", "¿Cómo adquirir mis primeros 100 usuarios?", "¿Vale la pena construir esta feature?"
            </div>
            <textarea
              value={objective}
              onChange={e => setObjective(e.target.value)}
              placeholder="Describe el problema o pregunta que quieres resolver hoy..."
              rows={4}
              style={{
                width: '100%', background: c.surface2, border: `1px solid ${c.border2}`,
                borderRadius: 8, color: c.text, padding: '10px 12px', fontSize: 13,
                fontFamily: 'inherit', outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                marginBottom: 14
              }}
              onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleOpenSession() }}
            />
            <button
              onClick={handleOpenSession}
              disabled={!objective.trim() || loading}
              style={{
                width: '100%', padding: '10px 0', background: objective.trim() ? c.accent : c.dim,
                color: objective.trim() ? c.bg : c.muted, border: 'none', borderRadius: 8,
                fontSize: 13, fontWeight: 600, cursor: objective.trim() ? 'pointer' : 'not-allowed',
                transition: 'background 0.2s'
              }}
            >
              Abrir sesión del Committee
            </button>

            {/* Members preview */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${c.border}` }}>
              <div style={{ fontSize: 10, fontFamily: 'monospace', color: c.dim, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Miembros del committee</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[
                  { name: 'Chair', emoji: '🎯' },
                  { name: 'CFO', emoji: '💰' },
                  { name: 'CMO', emoji: '📣' },
                  { name: 'CTO', emoji: '⚙️' },
                  { name: 'Usuario', emoji: '👤' },
                  { name: "Devil's Advocate", emoji: '😈' },
                  { name: 'Investor', emoji: '📈' },
                  { name: 'Historiador', emoji: '📚' },
                ].map(m => (
                  <div key={m.name} style={{
                    display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px',
                    background: c.surface2, border: `1px solid ${c.border}`, borderRadius: 20,
                    fontSize: 11, color: c.muted
                  }}>
                    <span>{m.emoji}</span>
                    <span>{m.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SESSION VIEW */}
      {view === 'session' && currentSession && (
        <div>
          {/* Session header */}
          <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 11, fontFamily: 'monospace', color: c.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Objetivo de la sesión</div>
              <div style={{ fontSize: 13, color: c.text, fontWeight: 500, marginTop: 2 }}>{currentSession.objective}</div>
            </div>
            <div style={{
              padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, fontFamily: 'monospace',
              background: currentSession.status === 'open' ? 'rgba(34,197,94,0.12)' : 'rgba(107,107,126,0.12)',
              color: currentSession.status === 'open' ? c.green : c.muted
            }}>
              {currentSession.status === 'open' ? '● En sesión' : '✓ Cerrada'}
            </div>
          </div>

          {/* Loading indicator */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(0,212,216,0.06)', border: `1px solid rgba(0,212,216,0.2)`, borderRadius: 10, marginBottom: 16 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.accent, animation: 'pulse 1s infinite' }} />
              <span style={{ fontSize: 12, color: c.accent }}>El committee está deliberando...</span>
            </div>
          )}

          {/* Messages */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            {currentSession.messages.map(msg => {
              const color = memberColors[msg.member] || c.muted
              return (
                <div key={msg.id} style={{
                  background: c.surface, border: `1px solid ${c.border}`,
                  borderLeft: `3px solid ${color}`, borderRadius: '0 10px 10px 0',
                  padding: '12px 16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 16 }}>{msg.emoji}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color }}>{msg.member}</span>
                    <span style={{ fontSize: 10, color: c.dim, fontFamily: 'monospace' }}>{msg.role}</span>
                  </div>
                  <div style={{ fontSize: 13, color: c.text, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Ask a question */}
          {!loading && (
            <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 11, color: c.muted, marginBottom: 8 }}>Pregunta al committee o da más contexto:</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  placeholder="¿Tienen alguna recomendación sobre...?"
                  style={{
                    flex: 1, background: c.surface2, border: `1px solid ${c.border2}`,
                    borderRadius: 6, color: c.text, padding: '8px 12px', fontSize: 12,
                    fontFamily: 'inherit', outline: 'none'
                  }}
                  onKeyDown={e => { if (e.key === 'Enter') handleAskQuestion() }}
                />
                <button
                  onClick={handleAskQuestion}
                  disabled={!question.trim()}
                  style={{
                    padding: '8px 16px', background: question.trim() ? c.accent : c.dim,
                    color: question.trim() ? c.bg : c.muted, border: 'none', borderRadius: 6,
                    fontSize: 12, fontWeight: 600, cursor: question.trim() ? 'pointer' : 'not-allowed'
                  }}
                >
                  Enviar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* HISTORY VIEW */}
      {view === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sessions.map(session => (
            <div
              key={session.id}
              onClick={() => { setCurrentSession(session); setView('session') }}
              style={{
                background: c.surface, border: `1px solid ${c.border}`, borderRadius: 10,
                padding: '14px 16px', cursor: 'pointer', transition: 'border-color 0.15s'
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = c.border2)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = c.border)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{session.objective}</div>
                <div style={{
                  padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, fontFamily: 'monospace',
                  background: session.status === 'open' ? 'rgba(34,197,94,0.12)' : 'rgba(107,107,126,0.12)',
                  color: session.status === 'open' ? c.green : c.muted
                }}>
                  {session.status === 'open' ? '● Abierta' : '✓ Cerrada'}
                </div>
              </div>
              <div style={{ fontSize: 11, color: c.dim }}>
                {session.messages.length} mensajes · {session.createdAt.toLocaleDateString('es-MX')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}