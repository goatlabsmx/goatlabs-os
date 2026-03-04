export type ProjectStatus = 'Activo' | 'Validando' | 'Pausado' | 'Descontinuado'
export type Priority = 'Alta' | 'Media' | 'Baja'
export type TaskArea = 'GTM' | 'Dev'
export type TaskStatus = 'Pendiente' | 'En progreso' | 'Bloqueado' | 'Done'
export type ContentStatus = 'Idea' | 'En producción' | 'Programado' | 'Publicado'
export type ValidationStatus = 'Sin validar' | 'Validada parcialmente' | 'Validada' | 'Descartada'

export type ProjectAccount = {
  id: string
  type: string
  identifier: string
  note?: string
  url?: string
}

export interface Project {
  id: string
  name: string
  url: string | null
  status: ProjectStatus
  priority: Priority
  description: string | null
  mission: string | null
  vision: string | null
  north_star_metric: string | null
  north_star_value: number
  current_phase: string | null
  main_blocker: string | null
  next_milestone: string | null
  hypothesis: string | null
  validation_status: ValidationStatus
  validation_evidence: string | null
  active_users: number
  revenue: number
  mrr: number
  target_audience: string | null
  main_channel: string | null
  content_type: string | null
  content_kpi: string | null
  notes: string | null
  accounts: ProjectAccount[]
  stripe_product_id: string | null
  analytics_property_id: string | null
  github_repo: string | null
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  project_id: string
  title: string
  description: string | null
  area: TaskArea
  type: string | null
  status: TaskStatus
  priority: Priority
  due_date: string | null
  assignee_email: string | null
  links: string | null
  created_by_email: string | null
  created_at: string
  updated_at: string
}

export interface ContentItem {
  id: string
  project_id: string
  title: string
  description: string | null
  channel: string
  format: string | null
  status: ContentStatus
  scheduled_date: string | null
  published_date: string | null
  url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface MetricsSnapshot {
  id: string
  project_id: string
  date: string
  active_users: number | null
  revenue: number | null
  mrr: number | null
  north_star_value: number | null
  notes: string | null
}

export interface AllowedUser {
  id: string
  email: string
  added_by_email: string | null
  created_at: string
}
