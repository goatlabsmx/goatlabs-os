import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Task } from '../types'
import { format } from 'date-fns'

export function useTasks(projectId: string) {
  return useQuery<Task[]>({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!projectId,
  })
}

export function useAllTasks() {
  return useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useAllTaskCounts() {
  return useQuery<Record<string, { gtm: number; dev: number; hasOverdue: boolean }>>({
    queryKey: ['task-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('project_id, area, due_date, status')
        .neq('status', 'Done')
      if (error) throw error

      const today = format(new Date(), 'yyyy-MM-dd')
      const counts: Record<string, { gtm: number; dev: number; hasOverdue: boolean }> = {}

      for (const t of data) {
        if (!counts[t.project_id]) {
          counts[t.project_id] = { gtm: 0, dev: 0, hasOverdue: false }
        }
        const entry = counts[t.project_id]
        if (t.area === 'GTM') entry.gtm++
        else entry.dev++
        if (t.due_date && t.due_date < today) entry.hasOverdue = true
      }

      return counts
    },
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (task: Partial<Task>) => {
      const { project_id, title, description, area, type, status, priority, due_date, assignee_email, links, created_by_email } = task
      const payload = { project_id, title, description, area, type, status, priority, due_date, assignee_email, links, created_by_email }
      const { data, error } = await supabase
        .from('tasks')
        .insert([payload])
        .select()
      if (error) {
        console.error('Task insert error:', error)
        throw error
      }
      return (data?.[0] ?? data) as Task
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      if (variables.project_id) {
        qc.invalidateQueries({ queryKey: ['tasks', variables.project_id] })
      }
      qc.invalidateQueries({ queryKey: ['task-counts'] })
    },
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Task
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      if (data.project_id) {
        qc.invalidateQueries({ queryKey: ['tasks', data.project_id] })
      }
      qc.invalidateQueries({ queryKey: ['task-counts'] })
    },
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) throw error
      return { projectId }
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      qc.invalidateQueries({ queryKey: ['tasks', variables.projectId] })
      qc.invalidateQueries({ queryKey: ['task-counts'] })
    },
  })
}
