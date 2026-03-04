import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface CommitteeSessionRow {
  id: string
  project_id: string
  objective: string
  status: 'open' | 'closed'
  messages: any[]
  summary?: string
  created_at: string
}

export function useCommitteeSessions(projectId: string) {
  return useQuery<CommitteeSessionRow[]>({
    queryKey: ['committee-sessions', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('committee_sessions')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    enabled: !!projectId,
  })
}

export function useSaveCommitteeSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (row: {
      id: string
      project_id: string
      objective: string
      status: 'open' | 'closed'
      messages: any[]
      summary?: string | null
      created_at?: string
      updated_at?: string
    }) => {
      const now = new Date().toISOString()
      const payload: Record<string, unknown> = {
        id: row.id,
        project_id: row.project_id,
        objective: row.objective,
        status: row.status,
        messages: row.messages,
        summary: row.summary ?? null,
        updated_at: row.updated_at ?? now,
      }
      if (row.created_at) payload.created_at = row.created_at
      const { data, error } = await supabase
        .from('committee_sessions')
        .upsert(payload, { onConflict: 'id' })
        .select()
      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['committee-sessions', variables.project_id] })
    },
  })
}
