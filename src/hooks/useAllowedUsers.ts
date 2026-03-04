import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { AllowedUser } from '../types'

export function useAllowedUsers() {
  return useQuery<AllowedUser[]>({
    queryKey: ['allowed-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('allowed_users')
        .select('*')
      if (error) throw error
      return data
    },
  })
}

export function useAddAllowedUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (email: string) => {
      const { data, error } = await supabase
        .from('allowed_users')
        .insert({ email })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['allowed-users'] }),
  })
}

export function useRemoveAllowedUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('allowed_users')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['allowed-users'] }),
  })
}
