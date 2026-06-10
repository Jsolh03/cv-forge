/* =========================================================================
   CV Forge · Modelo de dominio (tipado estricto)
   ========================================================================= */

export type ID = string

/* ---------- Perfil del candidato ---------- */

export interface ContactInfo {
  fullName: string
  headline: string // p.ej. "Ingeniero de Software Senior"
  email: string
  phone: string
  location: string
  website: string
  linkedin: string
  github: string
}

export interface ExperienceItem {
  id: ID
  company: string
  role: string
  location: string
  startDate: string // "2021-03" o texto libre
  endDate: string // "" => actual
  current: boolean
  bullets: string[] // logros (idealmente formato X-Y-Z)
}

export interface EducationItem {
  id: ID
  institution: string
  degree: string
  field: string
  location: string
  startDate: string
  endDate: string
  details: string // honores, GPA, tesis
}

export type SkillLevel = 'basico' | 'intermedio' | 'avanzado' | 'experto'

export interface SkillItem {
  id: ID
  name: string
  level: SkillLevel
}

export interface LanguageItem {
  id: ID
  name: string
  level: string // p.ej. "C1", "Nativo"
}

export interface ProjectItem {
  id: ID
  name: string
  description: string
  link: string
}

export interface UserProfile {
  contact: ContactInfo
  summary: string
  experience: ExperienceItem[]
  education: EducationItem[]
  skills: SkillItem[]
  languages: LanguageItem[]
  projects: ProjectItem[]
}

/* ---------- Oferta de trabajo ---------- */

export type JobSource = 'text' | 'url' | 'image'

export interface JobOffer {
  source: JobSource
  rawText: string
  url: string
  title: string
  company: string
  keywords: string[]
  updatedAt: number
}

/* ---------- Análisis y recomendación ---------- */

export type TemplateKind = 'harvard' | 'ats'

export interface KeywordMatch {
  keyword: string
  present: boolean
  weight: number
}

export interface Recommendation {
  template: TemplateKind
  score: number // 0..100 confianza hacia la plantilla recomendada
  atsSignals: string[]
  harvardSignals: string[]
  rationale: string
  aiEnhanced: boolean
}

export interface GapAnalysis {
  matched: string[]
  missing: string[]
  coverage: number // 0..100 porcentaje de keywords cubiertas
  suggestions: string[]
  aiEnhanced: boolean
}

/* ---------- Estados de IA / OCR ---------- */

export type AiProvider = 'ollama' | 'transformers' | 'heuristic'

export interface AiStatus {
  ollamaAvailable: boolean
  ollamaModel: string
  models: string[]
  checkedAt: number
  checking: boolean
  error: string | null
}

export type AsyncState = 'idle' | 'loading' | 'success' | 'error'

/* ---------- Navegación ---------- */

export type View = 'job' | 'profile' | 'analyze' | 'build' | 'cover' | 'export'

export interface ViewMeta {
  id: View
  label: string
  description: string
  step: number
}

/* ---------- Toast ---------- */

export type ToastKind = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: ID
  kind: ToastKind
  message: string
}
