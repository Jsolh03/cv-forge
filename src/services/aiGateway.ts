/* =========================================================================
   Fachada de IA: orquesta recomendación y gap analysis, enriqueciéndolos
   con Ollama cuando está disponible y cayendo a heurística determinista si no.
   ========================================================================= */

import type { GapAnalysis, JobOffer, Recommendation, UserProfile } from '@/types'
import { generate } from './ollama'
import { computeGap, extractKeywords } from './keywords'
import { recommendTemplate } from './recommendation'
import { gapPrompt, recommendationPrompt, SYSTEM_CV_EXPERT } from './prompts'
import { sanitizeLine } from './optimizer'

export interface AiContext {
  available: boolean
  model: string
}

/** Recomendación de plantilla, enriquecida con justificación de IA si se puede. */
export async function buildRecommendation(
  job: JobOffer,
  ai: AiContext,
): Promise<Recommendation> {
  const base = recommendTemplate(job)
  if (!ai.available) return base

  try {
    const out = await generate({
      model: ai.model,
      system: SYSTEM_CV_EXPERT,
      prompt: recommendationPrompt(job, base),
      temperature: 0.4,
      timeoutMs: 45000,
    })
    const text = out.trim()
    if (text.length > 20) {
      return { ...base, rationale: text, aiEnhanced: true }
    }
  } catch {
    // Mantener la base heurística.
  }
  return base
}

/** Gap analysis determinista, con sugerencias enriquecidas por IA si se puede. */
export async function buildGapAnalysis(
  job: JobOffer,
  profile: UserProfile,
  ai: AiContext,
): Promise<GapAnalysis> {
  const keywords = job.keywords.length ? job.keywords : extractKeywords(job.rawText)
  const base = computeGap(keywords, profile)
  if (!ai.available || base.missing.length === 0) return base

  try {
    const out = await generate({
      model: ai.model,
      system: SYSTEM_CV_EXPERT,
      prompt: gapPrompt(base.missing, job),
      temperature: 0.5,
      timeoutMs: 45000,
    })
    const lines = out
      .split('\n')
      .map((l) => sanitizeLine(l))
      .filter((l) => l.length > 8)
      .slice(0, 4)
    if (lines.length > 0) {
      return { ...base, suggestions: lines, aiEnhanced: true }
    }
  } catch {
    // Mantener sugerencias heurísticas.
  }
  return base
}
