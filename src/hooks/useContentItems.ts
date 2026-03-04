import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { ContentItem } from '../types'

export function useContentItems(projectId: string) {
  return useQuery<ContentItem[]>({
    queryKey: ['content', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!projectId,
  })
}

export function useAllContentItems() {
  return useQuery<ContentItem[]>({
    queryKey: ['content-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useCreateContentItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (item: Partial<ContentItem>) => {
      const { data, error } = await supabase
        .from('content_items')
        .insert(item)
        .select()
        .single()
      if (error) throw error
      return data as ContentItem
    },
    onSuccess: (_data, variables) => {
      if (variables.project_id) {
        qc.invalidateQueries({ queryKey: ['content', variables.project_id] })
      }
      qc.invalidateQueries({ queryKey: ['content-all'] })
    },
  })
}

export function useUpdateContentItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ContentItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('content_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as ContentItem
    },
    onSuccess: (data) => {
      if (data.project_id) {
        qc.invalidateQueries({ queryKey: ['content', data.project_id] })
      }
      qc.invalidateQueries({ queryKey: ['content-all'] })
    },
  })
}

export function useDeleteContentItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const { error } = await supabase.from('content_items').delete().eq('id', id)
      if (error) throw error
      return { projectId }
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['content', variables.projectId] })
      qc.invalidateQueries({ queryKey: ['content-all'] })
    },
  })
}
