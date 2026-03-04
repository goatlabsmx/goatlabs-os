import { useState } from 'react'
import type { Project } from '../types'

export interface CommitteeMessage {
  id: string
  member: string
  role: string
  emoji?: string
  content: string
  timestamp: Date
}

export interface CommitteeSession {
  id: string
  objective: string
  status: 'open' | 'closed'
  messages: CommitteeMessage[]
  summary?: string
  createdAt: Date
}

const MEMBERS = [
  {
    name: 'Chair',
    role: 'Facilitador del Committee',
    emoji: '[Chair]',
    systemPrompt: (project: Project) => `Eres el Chair de un comité de expertos para el proyecto "${project.name}". 
Tu trabajo es orquestar la sesión, presentar el contexto del proyecto a los miembros, dirigir preguntas al experto correcto, y al final sintetizar los insights en 3 acciones concretas.
Siempre te anuncias como "**Chair:**" al inicio de tu mensaje.
Contexto del proyecto:
- Descripción: ${project.description || 'No definida'}
- Misión: ${project.mission || 'No definida'}
- Visión: ${project.vision || 'No definida'}
- Fase actual: ${project.current_phase || 'No definida'}
- Usuarios activos: ${project.active_users || 0}
- MRR: $${project.mrr || 0}
- Bloqueo principal: ${project.main_blocker || 'Ninguno'}
- Próximo hito: ${project.next_milestone || 'No definido'}
- Hipótesis: ${project.hypothesis || 'No definida'}
Sé directo, conciso y orientado a acción. Máximo 150 palabras por mensaje.`
  },
  {
    name: 'CFO',
    role: 'Finanzas & Unit Economics',
    emoji: '[CFO]',
    systemPrompt: (project: Project) => `Eres el CFO del comité para el proyecto "${project.name}".
Tu perspectiva es financiera: unit economics, pricing, runway, CAC, LTV, breakeven.
Siempre te anuncias como "**CFO:**" al inicio de tu mensaje.
Eres directo y un poco escéptico — los números no mienten.
Contexto: MRR actual $${project.mrr || 0}, usuarios: ${project.active_users || 0}, fase: ${project.current_phase || 'desconocida'}.
Máximo 120 palabras. Ve directo al punto financiero.`
  },
  {
    name: 'CMO',
    role: 'Growth & Marketing',
    emoji: '[CMO]',
    systemPrompt: (project: Project) => `Eres el CMO del comité para el proyecto "${project.name}".
Tu perspectiva es growth: canales de adquisición, posicionamiento, contenido, retención.
Siempre te anuncias como "**CMO:**" al inicio de tu mensaje.
Canal principal actual: ${project.main_channel || 'no definido'}. Audiencia: ${project.target_audience || 'no definida'}.
Eres creativo pero orientado a métricas. Máximo 120 palabras.`
  },
  {
    name: 'CTO',
    role: 'Tecnología & Producto',
    emoji: '[CTO]',
    systemPrompt: (project: Project) => `Eres el CTO del comité para el proyecto "${project.name}".
Tu perspectiva es técnica y de producto: stack, deuda técnica, AI, roadmap, qué construir primero.
Siempre te anuncias como "**CTO:**" al inicio de tu mensaje.
Eres pragmático — prefieres ship rápido sobre perfección. Máximo 120 palabras.`
  },
  {
    name: 'Usuario',
    role: 'Voz del Cliente',
    emoji: '[Usuario]',
    systemPrompt: (project: Project) => `Eres un usuario representativo del proyecto "${project.name}".
Hablas desde la perspectiva del cliente final. Qué dolores tienes, qué valoras, qué te frenaría de pagar o usar el producto.
Siempre te anuncias como "**Usuario:**" al inicio de tu mensaje.
Audiencia objetivo: ${project.target_audience || 'no definida'}.
Sé honesto, a veces incómodo. Máximo 100 palabras.`
  },
  {
    name: 'Devil\'s Advocate',
    role: 'Crítico & Escéptico',
    emoji: '[DA]',
    systemPrompt: (project: Project) => `Eres el Devil's Advocate del comité para "${project.name}".
Tu trabajo es destruir ideas, encontrar los hoyos, hacer las preguntas incómodas que nadie quiere hacer.
Siempre te anuncias como "**Devil's Advocate:**" al inicio de tu mensaje.
No eres negativo por ser negativo — eres el filtro de realidad. Si una idea sobrevive tu análisis, es sólida.
Bloqueo actual: ${project.main_blocker || 'ninguno'}.
Sé brutal pero constructivo. Máximo 120 palabras.`
  },
  {
    name: 'Investor',
    role: 'Perspectiva de Inversión',
    emoji: '[Investor]',
    systemPrompt: (project: Project) => `Eres un angel investor evaluando el proyecto "${project.name}".
Tu perspectiva: ¿vale la pena seguir? ¿Es escalable? ¿Cuál es el exit? ¿Qué métricas importan ahora?
Siempre te anuncias como "**Investor:**" al inicio de tu mensaje.
MRR: $${project.mrr || 0}, usuarios: ${project.active_users || 0}.
Eres frío, orientado a retorno. Máximo 120 palabras.`
  },
  {
    name: 'Historiador',
    role: 'Contexto & Patrones',
    emoji: '[Hist]',
    systemPrompt: (project: Project) => `Eres el Historiador del comité para "${project.name}".
Tu trabajo es traer contexto: qué han hecho empresas similares, qué patrones se repiten en startups en esta fase, qué errores son comunes.
Siempre te anuncias como "**Historiador:**" al inicio de tu mensaje.
Fase actual: ${project.current_phase || 'desconocida'}. Hipótesis: ${project.hypothesis || 'no definida'}.
Citas casos reales cuando es relevante. Máximo 120 palabras.`
  }
]

async function callClaude(systemPrompt: string, conversationHistory: { role: 'user' | 'assistant', content: string }[], userMessage: string): Promise<string> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-client-side-allow': 'true'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: systemPrompt,
      messages: [
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ]
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'API error')
  }

  const data = await response.json()
  return data.content[0].text
}

export function useCommittee(project: Project) {
  const [sessions, setSessions] = useState<CommitteeSession[]>([])
  const [currentSession, setCurrentSession] = useState<CommitteeSession | null>(null)
  const [loading, setLoading] = useState(false)

  const openSession = async (objective: string) => {
    const session: CommitteeSession = {
      id: crypto.randomUUID(),
      objective,
      status: 'open',
      messages: [],
      createdAt: new Date()
    }
    setCurrentSession(session)
    setSessions(prev => [session, ...prev])
    setLoading(true)

    try {
      const chairPrompt = MEMBERS[0].systemPrompt(project)
      const openingMessage = await callClaude(
        chairPrompt,
        [],
        `Abre formalmente esta sesión del Committee. El objetivo de hoy es: "${objective}". Preséntate, presenta brevemente el contexto del proyecto y anuncia que vamos a escuchar a cada miembro del committee.`
      )

      const firstMessage: CommitteeMessage = {
        id: crypto.randomUUID(),
        member: 'Chair',
        role: 'Facilitador',
        emoji: '[Chair]',
        content: openingMessage,
        timestamp: new Date()
      }

      session.messages = [firstMessage]
      setCurrentSession({ ...session })
      setSessions(prev => prev.map(s => s.id === session.id ? { ...session } : s))

      // Each member gives their perspective
      const conversationSoFar: { role: 'user' | 'assistant', content: string }[] = [
        { role: 'assistant', content: openingMessage }
      ]

      for (let i = 1; i < MEMBERS.length; i++) {
        const member = MEMBERS[i]
        const memberPrompt = member.systemPrompt(project)
        
        const memberMessage = await callClaude(
          memberPrompt,
          conversationSoFar,
          `El Chair ha abierto la sesión con objetivo: "${objective}". Da tu perspectiva desde tu rol. Sé específico sobre este proyecto.`
        )

        conversationSoFar.push({ role: 'assistant', content: memberMessage })

        const msg: CommitteeMessage = {
          id: crypto.randomUUID(),
          member: member.name,
          role: member.role,
          emoji: member.emoji,
          content: memberMessage,
          timestamp: new Date()
        }

        session.messages = [...session.messages, msg]
        setCurrentSession({ ...session })
        setSessions(prev => prev.map(s => s.id === session.id ? { ...session } : s))
      }

      // Chair closes with synthesis
      const synthesis = await callClaude(
        MEMBERS[0].systemPrompt(project),
        conversationSoFar,
        `Has escuchado a todos los miembros. Sintetiza los insights más importantes y da exactamente 3 acciones concretas y priorizadas para el proyecto. Cierra la sesión formalmente.`
      )

      const synthMsg: CommitteeMessage = {
        id: crypto.randomUUID(),
        member: 'Chair',
        role: 'Síntesis final',
        emoji: '[Chair]',
        content: synthesis,
        timestamp: new Date()
      }

      session.messages = [...session.messages, synthMsg]
      session.status = 'closed'
      session.summary = synthesis
      setCurrentSession({ ...session })
      setSessions(prev => prev.map(s => s.id === session.id ? { ...session } : s))

    } catch (error) {
      console.error('Committee error:', error)
    } finally {
      setLoading(false)
    }
  }

  const askQuestion = async (question: string) => {
    if (!currentSession || loading) return
    setLoading(true)

    try {
      const conversationHistory = currentSession.messages.map(m => ({
        role: 'assistant' as const,
        content: m.content
      }))

      const chairResponse = await callClaude(
        MEMBERS[0].systemPrompt(project),
        conversationHistory,
        `El fundador pregunta: "${question}". Dirige esta pregunta al miembro más relevante del committee y luego deja que respondan.`
      )

      const chairMsg: CommitteeMessage = {
        id: crypto.randomUUID(),
        member: 'Chair',
        role: 'Facilitador',
        emoji: '[Chair]',
        content: chairResponse,
        timestamp: new Date()
      }

      const relevantMember = MEMBERS.slice(1).find(m => 
        chairResponse.toLowerCase().includes(m.name.toLowerCase())
      ) || MEMBERS[1]

      const memberResponse = await callClaude(
        relevantMember.systemPrompt(project),
        [...conversationHistory, { role: 'assistant', content: chairResponse }],
        `Responde a la pregunta del fundador: "${question}"`
      )

      const memberMsg: CommitteeMessage = {
        id: crypto.randomUUID(),
        member: relevantMember.name,
        role: relevantMember.role,
        emoji: relevantMember.emoji,
        content: memberResponse,
        timestamp: new Date()
      }

      const updatedSession = {
        ...currentSession,
        messages: [...currentSession.messages, chairMsg, memberMsg]
      }

      setCurrentSession(updatedSession)
      setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s))

    } catch (error) {
      console.error('Committee error:', error)
    } finally {
      setLoading(false)
    }
  }

  return { sessions, currentSession, loading, openSession, askQuestion, setCurrentSession }
}