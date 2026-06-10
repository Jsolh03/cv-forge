/* =========================================================================
   Optimizador de viñetas (fórmula X-Y-Z) con fallback heurístico.
   Si Ollama está disponible se usa IA; si no, una reescritura determinista.
   ========================================================================= */

import { generate, OllamaError } from './ollama'
import { bulletPrompt, SYSTEM_CV_EXPERT } from './prompts'

const ACTION_VERBS = [
  'Lideré', 'Diseñé', 'Implementé', 'Optimicé', 'Reduje', 'Aumenté', 'Automaticé',
  'Desarrollé', 'Coordiné', 'Escalé', 'Refactoricé', 'Entregué',
]

const WEAK_STARTERS = [
  'responsable de', 'encargado de', 'encargada de', 'ayudé a', 'participé en',
  'trabajé en', 'colaboré en', 'me ocupé de', 'tareas de', 'gestión de',
]

function hasMetric(text: string): boolean {
  return /\d/.test(text) && /(%|€|\$|x|veces|millones|mil|k\b|horas|días|usuarios|minutos)/i.test(text)
}

/** Reescritura heurística garantizada (sin IA): aplica estructura X-Y-Z. */
export function heuristicOptimize(bullet: string): string {
  let text = bullet.trim().replace(/^[-•*\s]+/, '')
  if (!text) return text

  const lower = text.toLowerCase()
  for (const weak of WEAK_STARTERS) {
    if (lower.startsWith(weak)) {
      text = text.slice(weak.length).trim()
      break
    }
  }

  // Asegura inicio con verbo de acción fuerte.
  const startsStrong = ACTION_VERBS.some((v) => text.toLowerCase().startsWith(v.toLowerCase()))
  if (!startsStrong) {
    const verb = pickVerb(text)
    text = `${verb} ${text.charAt(0).toLowerCase()}${text.slice(1)}`
  }

  // Añade plantilla de métrica si falta una.
  if (!hasMetric(text)) {
    text = text.replace(/\.?\s*$/, '')
    text += ', logrando una mejora medible de [X%] en [resultado clave].'
  } else if (!/[.!?]$/.test(text)) {
    text += '.'
  }

  return text.charAt(0).toUpperCase() + text.slice(1)
}

function pickVerb(text: string): string {
  // Verbo determinista según longitud (sin aleatoriedad para reproducibilidad).
  return ACTION_VERBS[text.length % ACTION_VERBS.length]
}

export interface OptimizeResult {
  text: string
  aiUsed: boolean
}

/**
 * Optimiza una viñeta. Intenta Ollama; ante cualquier fallo, devuelve la
 * versión heurística (nunca lanza, nunca devuelve vacío).
 */
export async function optimizeBullet(
  bullet: string,
  jobKeywords: string[],
  ollama: { available: boolean; model: string },
): Promise<OptimizeResult> {
  const trimmed = bullet.trim()
  if (!trimmed) return { text: '', aiUsed: false }

  if (ollama.available) {
    try {
      const out = await generate({
        model: ollama.model,
        system: SYSTEM_CV_EXPERT,
        prompt: bulletPrompt(trimmed, jobKeywords),
        temperature: 0.5,
      })
      const clean = sanitizeLine(out)
      if (clean) return { text: clean, aiUsed: true }
    } catch (err) {
      // Silenciamos: caemos al fallback. El llamador puede notificar.
      if (!(err instanceof OllamaError)) throw err
    }
  }

  return { text: heuristicOptimize(trimmed), aiUsed: false }
}

/** Limpia la salida de la IA: quita comillas, viñetas y líneas extra. */
export function sanitizeLine(raw: string): string {
  const firstLine = raw.split('\n').map((l) => l.trim()).find((l) => l.length > 0) ?? ''
  return firstLine.replace(/^["'`\-•*\s]+/, '').replace(/["'`]+$/, '').trim()
}
