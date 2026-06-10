/* =========================================================================
   Servicios de IA de alto nivel para perfil: embellecer resumen, sugerir
   keywords que encajan y generar carta de presentación. Todos con fallback
   heurístico determinista (funcionan sin Ollama).
   ========================================================================= */

import type { JobOffer, UserProfile } from '@/types'
import { generate } from './ollama'
import { sanitizeLine } from './optimizer'
import { profileToText } from './keywords'
import {
  coverLetterPrompt,
  fittingKeywordsPrompt,
  summaryPrompt,
  SYSTEM_CV_EXPERT,
} from './prompts'

export interface AiContext {
  available: boolean
  model: string
}

export interface EnhanceResult<T> {
  value: T
  aiUsed: boolean
}

/* ---------- Embellecer resumen ---------- */

export async function enhanceSummary(
  summary: string,
  job: JobOffer,
  ai: AiContext,
): Promise<EnhanceResult<string>> {
  const base = summary.trim()
  if (ai.available && base) {
    try {
      const out = await generate({
        model: ai.model,
        system: SYSTEM_CV_EXPERT,
        prompt: summaryPrompt(base, job),
        temperature: 0.5,
      })
      const text = out
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .join(' ')
        .replace(/^["'`]+|["'`]+$/g, '')
        .trim()
      if (text.length > 20) return { value: text, aiUsed: true }
    } catch {
      /* fallback */
    }
  }
  return { value: heuristicPolishSummary(base, job), aiUsed: false }
}

/** Pulido determinista: limpia, capitaliza y asegura que cite el puesto. */
export function heuristicPolishSummary(summary: string, job: JobOffer): string {
  let text = summary.replace(/\s+/g, ' ').trim()
  if (!text) {
    const role = job.title || 'profesional'
    return `Profesional orientado a resultados con experiencia en ${role}. Combino capacidad técnica y foco en el impacto medible para aportar valor desde el primer día.`
  }
  text = text.charAt(0).toUpperCase() + text.slice(1)
  if (!/[.!?]$/.test(text)) text += '.'
  // Si no menciona el puesto y lo conocemos, añade una frase de cierre alineada.
  if (job.title && !text.toLowerCase().includes(job.title.toLowerCase().split(' ')[0])) {
    text += ` Mi perfil encaja con el rol de ${job.title}, donde busco aportar resultados medibles.`
  }
  return text
}

/* ---------- Keywords que encajan con el perfil ---------- */

/**
 * De las keywords faltantes, devuelve las que plausiblemente encajan con el
 * perfil. Con IA pregunta al modelo; sin IA, hace coincidencia por raíz contra
 * el texto del perfil (conservador: solo las claramente relacionadas).
 */
export async function suggestFittingKeywords(
  missing: string[],
  profile: UserProfile,
  ai: AiContext,
): Promise<EnhanceResult<string[]>> {
  if (missing.length === 0) return { value: [], aiUsed: false }
  const profileText = profileToText(profile)

  if (ai.available) {
    try {
      const out = await generate({
        model: ai.model,
        system: SYSTEM_CV_EXPERT,
        prompt: fittingKeywordsPrompt(missing, profileText),
        temperature: 0.3,
      })
      const set = new Set(missing.map((m) => m.toLowerCase()))
      const picked = out
        .split('\n')
        .map((l) => sanitizeLine(l).toLowerCase())
        .filter((l) => set.has(l))
      if (picked.length > 0) {
        // Devuelve con la grafía original de `missing`.
        const value = missing.filter((m) => picked.includes(m.toLowerCase()))
        return { value, aiUsed: true }
      }
    } catch {
      /* fallback */
    }
  }

  // Heurística: pre-selecciona las que comparten raíz con habilidades existentes.
  const value = missing.filter((kw) => heuristicFits(kw, profileText))
  return { value, aiUsed: false }
}

function heuristicFits(keyword: string, profileText: string): boolean {
  const k = keyword.toLowerCase()
  const root = k.length > 4 ? k.slice(0, Math.ceil(k.length * 0.7)) : k
  return profileText.includes(root)
}

/* ---------- Carta de presentación ---------- */

export async function generateCoverLetter(
  profile: UserProfile,
  job: JobOffer,
  ai: AiContext,
): Promise<EnhanceResult<string>> {
  const topBullets = profile.experience.flatMap((e) => e.bullets).filter((b) => b.trim()).slice(0, 3)
  const skills = profile.skills.map((s) => s.name).slice(0, 8)

  if (ai.available) {
    try {
      const out = await generate({
        model: ai.model,
        system: SYSTEM_CV_EXPERT,
        prompt: coverLetterPrompt({
          fullName: profile.contact.fullName || 'El candidato',
          headline: profile.contact.headline,
          jobTitle: job.title || 'el puesto',
          company: job.company || 'la empresa',
          topBullets,
          skills,
          jobExcerpt: job.rawText,
        }),
        temperature: 0.6,
        timeoutMs: 70000,
      })
      const text = out.trim()
      if (text.length > 120) return { value: text, aiUsed: true }
    } catch {
      /* fallback */
    }
  }

  return { value: heuristicCoverLetter(profile, job, topBullets, skills), aiUsed: false }
}

/** Carta determinista a partir de plantilla, rellenada con datos reales. */
export function heuristicCoverLetter(
  profile: UserProfile,
  job: JobOffer,
  topBullets: string[],
  skills: string[],
): string {
  const name = profile.contact.fullName || 'El candidato'
  const role = job.title || 'el puesto ofertado'
  const company = job.company || 'su empresa'
  const headline = profile.contact.headline || 'profesional del sector'

  const achievements =
    topBullets.length > 0
      ? topBullets.map((b) => `• ${b.replace(/^[-•*\s]+/, '')}`).join('\n')
      : '• Trayectoria orientada a resultados y mejora continua.'

  const skillsLine = skills.length
    ? `Domino ${skills.slice(0, 6).join(', ')}, competencias directamente relevantes para esta posición.`
    : 'Aporto un conjunto de competencias técnicas alineadas con los requisitos del puesto.'

  return [
    `Estimado equipo de ${company},`,
    '',
    `Me dirijo a ustedes con gran interés por la posición de ${role}. Como ${headline}, considero que mi experiencia y motivación encajan con lo que buscan, y me entusiasma la posibilidad de contribuir a sus objetivos.`,
    '',
    'A lo largo de mi trayectoria he conseguido resultados concretos, entre ellos:',
    achievements,
    '',
    `${skillsLine} Me caracterizo por combinar el rigor técnico con el foco en el impacto, aportando valor medible desde el primer día.`,
    '',
    `Quedo a su disposición para ampliar cualquier información en una entrevista. Gracias por su tiempo y consideración.`,
    '',
    'Atentamente,',
    name,
  ].join('\n')
}
