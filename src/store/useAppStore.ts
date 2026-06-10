import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { uid } from '@/lib/id'
import type {
  EducationItem,
  ExperienceItem,
  GapAnalysis,
  JobOffer,
  LanguageItem,
  ProjectItem,
  Recommendation,
  SkillItem,
  TemplateKind,
  Toast,
  ToastKind,
  UserProfile,
  View,
} from '@/types'

/* ---------- Estado inicial ---------- */

function emptyProfile(): UserProfile {
  return {
    contact: {
      fullName: '',
      headline: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
      github: '',
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    languages: [],
    projects: [],
  }
}

function emptyJob(): JobOffer {
  return {
    source: 'text',
    rawText: '',
    url: '',
    title: '',
    company: '',
    keywords: [],
    updatedAt: 0,
  }
}

/* ---------- Factories de items ---------- */

export function newExperience(): ExperienceItem {
  return {
    id: uid('exp'),
    company: '',
    role: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    bullets: [''],
  }
}

export function newEducation(): EducationItem {
  return {
    id: uid('edu'),
    institution: '',
    degree: '',
    field: '',
    location: '',
    startDate: '',
    endDate: '',
    details: '',
  }
}

export function newSkill(name = ''): SkillItem {
  return { id: uid('sk'), name, level: 'avanzado' }
}

export function newLanguage(): LanguageItem {
  return { id: uid('lng'), name: '', level: '' }
}

export function newProject(): ProjectItem {
  return { id: uid('prj'), name: '', description: '', link: '' }
}

/* ---------- Tipado del store ---------- */

interface AppState {
  view: View
  ollamaModel: string
  profile: UserProfile
  job: JobOffer
  template: TemplateKind
  recommendation: Recommendation | null
  gap: GapAnalysis | null
  coverLetter: string
  toasts: Toast[]

  // navegación
  setView: (view: View) => void

  // configuración IA
  setOllamaModel: (model: string) => void

  // oferta
  setJob: (patch: Partial<JobOffer>) => void
  resetJob: () => void

  // plantilla
  setTemplate: (template: TemplateKind) => void

  // análisis
  setRecommendation: (rec: Recommendation | null) => void
  setGap: (gap: GapAnalysis | null) => void

  // carta de presentación
  setCoverLetter: (text: string) => void

  // perfil — contacto/resumen
  updateContact: (patch: Partial<UserProfile['contact']>) => void
  setSummary: (summary: string) => void

  // experiencia
  addExperience: () => void
  updateExperience: (id: string, patch: Partial<ExperienceItem>) => void
  removeExperience: (id: string) => void
  setExperienceBullets: (id: string, bullets: string[]) => void

  // educación
  addEducation: () => void
  updateEducation: (id: string, patch: Partial<EducationItem>) => void
  removeEducation: (id: string) => void

  // skills / idiomas / proyectos
  addSkill: (name?: string) => void
  updateSkill: (id: string, patch: Partial<SkillItem>) => void
  removeSkill: (id: string) => void
  addLanguage: () => void
  updateLanguage: (id: string, patch: Partial<LanguageItem>) => void
  removeLanguage: (id: string) => void
  addProject: () => void
  updateProject: (id: string, patch: Partial<ProjectItem>) => void
  removeProject: (id: string) => void

  // toasts
  pushToast: (kind: ToastKind, message: string) => void
  dismissToast: (id: string) => void

  // utilidades
  loadSampleProfile: () => void
  resetAll: () => void
}

/* ---------- Store ---------- */

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      view: 'job',
      ollamaModel: 'llama3',
      profile: emptyProfile(),
      job: emptyJob(),
      template: 'ats',
      recommendation: null,
      gap: null,
      coverLetter: '',
      toasts: [],

      setView: (view) => set({ view }),

      setOllamaModel: (ollamaModel) => set({ ollamaModel }),

      setJob: (patch) =>
        set((s) => ({ job: { ...s.job, ...patch, updatedAt: Date.now() } })),
      resetJob: () => set({ job: emptyJob(), recommendation: null, gap: null, coverLetter: '' }),

      setTemplate: (template) => set({ template }),

      setRecommendation: (recommendation) => set({ recommendation }),
      setGap: (gap) => set({ gap }),

      setCoverLetter: (coverLetter) => set({ coverLetter }),

      updateContact: (patch) =>
        set((s) => ({ profile: { ...s.profile, contact: { ...s.profile.contact, ...patch } } })),
      setSummary: (summary) => set((s) => ({ profile: { ...s.profile, summary } })),

      addExperience: () =>
        set((s) => ({
          profile: { ...s.profile, experience: [...s.profile.experience, newExperience()] },
        })),
      updateExperience: (id, patch) =>
        set((s) => ({
          profile: {
            ...s.profile,
            experience: s.profile.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)),
          },
        })),
      removeExperience: (id) =>
        set((s) => ({
          profile: { ...s.profile, experience: s.profile.experience.filter((e) => e.id !== id) },
        })),
      setExperienceBullets: (id, bullets) =>
        set((s) => ({
          profile: {
            ...s.profile,
            experience: s.profile.experience.map((e) => (e.id === id ? { ...e, bullets } : e)),
          },
        })),

      addEducation: () =>
        set((s) => ({
          profile: { ...s.profile, education: [...s.profile.education, newEducation()] },
        })),
      updateEducation: (id, patch) =>
        set((s) => ({
          profile: {
            ...s.profile,
            education: s.profile.education.map((e) => (e.id === id ? { ...e, ...patch } : e)),
          },
        })),
      removeEducation: (id) =>
        set((s) => ({
          profile: { ...s.profile, education: s.profile.education.filter((e) => e.id !== id) },
        })),

      addSkill: (name) =>
        set((s) => ({ profile: { ...s.profile, skills: [...s.profile.skills, newSkill(name)] } })),
      updateSkill: (id, patch) =>
        set((s) => ({
          profile: {
            ...s.profile,
            skills: s.profile.skills.map((k) => (k.id === id ? { ...k, ...patch } : k)),
          },
        })),
      removeSkill: (id) =>
        set((s) => ({
          profile: { ...s.profile, skills: s.profile.skills.filter((k) => k.id !== id) },
        })),

      addLanguage: () =>
        set((s) => ({
          profile: { ...s.profile, languages: [...s.profile.languages, newLanguage()] },
        })),
      updateLanguage: (id, patch) =>
        set((s) => ({
          profile: {
            ...s.profile,
            languages: s.profile.languages.map((l) => (l.id === id ? { ...l, ...patch } : l)),
          },
        })),
      removeLanguage: (id) =>
        set((s) => ({
          profile: { ...s.profile, languages: s.profile.languages.filter((l) => l.id !== id) },
        })),

      addProject: () =>
        set((s) => ({
          profile: { ...s.profile, projects: [...s.profile.projects, newProject()] },
        })),
      updateProject: (id, patch) =>
        set((s) => ({
          profile: {
            ...s.profile,
            projects: s.profile.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
          },
        })),
      removeProject: (id) =>
        set((s) => ({
          profile: { ...s.profile, projects: s.profile.projects.filter((p) => p.id !== id) },
        })),

      pushToast: (kind, message) =>
        set((s) => ({ toasts: [...s.toasts, { id: uid('t'), kind, message }] })),
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      loadSampleProfile: () => set({ profile: sampleProfile() }),

      resetAll: () => {
        const model = get().ollamaModel
        set({
          view: 'job',
          ollamaModel: model,
          profile: emptyProfile(),
          job: emptyJob(),
          template: 'ats',
          recommendation: null,
          gap: null,
          coverLetter: '',
        })
      },
    }),
    {
      name: 'cv-forge:v1',
      partialize: (s) => ({
        ollamaModel: s.ollamaModel,
        profile: s.profile,
        job: s.job,
        template: s.template,
        recommendation: s.recommendation,
        gap: s.gap,
        coverLetter: s.coverLetter,
      }),
    },
  ),
)

/* ---------- Perfil de muestra (demo funcional, no placeholder) ---------- */

function sampleProfile(): UserProfile {
  return {
    contact: {
      fullName: 'Alex Rivera',
      headline: 'Ingeniero de Software Full-Stack',
      email: 'alex.rivera@email.com',
      phone: '+34 600 123 456',
      location: 'Madrid, España',
      website: 'alexrivera.dev',
      linkedin: 'linkedin.com/in/alexrivera',
      github: 'github.com/alexrivera',
    },
    summary:
      'Ingeniero de software con 6 años construyendo aplicaciones web escalables con React, Node.js y TypeScript. Enfocado en rendimiento, calidad de código y entrega de valor medible.',
    experience: [
      {
        id: uid('exp'),
        company: 'TechNova',
        role: 'Senior Frontend Engineer',
        location: 'Madrid',
        startDate: '2021-06',
        endDate: '',
        current: true,
        bullets: [
          'Reduje el tiempo de carga inicial en un 42% migrando a code-splitting y SSR con Vite y React.',
          'Lideré un equipo de 4 ingenieros en la entrega de un panel de analítica usado por 30.000 usuarios.',
        ],
      },
      {
        id: uid('exp'),
        company: 'DataLoop',
        role: 'Software Engineer',
        location: 'Remoto',
        startDate: '2018-09',
        endDate: '2021-05',
        current: false,
        bullets: [
          'Implementé una API REST en Node.js que procesa 2M de eventos diarios con 99,9% de disponibilidad.',
          'Automaticé el pipeline de CI/CD reduciendo el tiempo de despliegue de 25 a 6 minutos.',
        ],
      },
    ],
    education: [
      {
        id: uid('edu'),
        institution: 'Universidad Politécnica de Madrid',
        degree: 'Grado',
        field: 'Ingeniería Informática',
        location: 'Madrid',
        startDate: '2014-09',
        endDate: '2018-06',
        details: 'Mención en Ingeniería del Software. Proyecto final con matrícula de honor.',
      },
    ],
    skills: [
      newSkill('React'),
      newSkill('TypeScript'),
      newSkill('Node.js'),
      newSkill('GraphQL'),
      newSkill('Docker'),
      newSkill('AWS'),
    ],
    languages: [
      { id: uid('lng'), name: 'Español', level: 'Nativo' },
      { id: uid('lng'), name: 'Inglés', level: 'C1' },
    ],
    projects: [
      {
        id: uid('prj'),
        name: 'OpenMetrics',
        description: 'Librería open-source de observabilidad con 1.2k estrellas en GitHub.',
        link: 'github.com/alexrivera/openmetrics',
      },
    ],
  }
}
