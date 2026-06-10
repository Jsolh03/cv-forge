/* =========================================================================
   Algoritmo de recomendación de plantilla: Harvard vs ATS.
   Heurística determinista basada en señales ponderadas de la oferta.
   ========================================================================= */

import type { JobOffer, Recommendation } from '@/types'
import { TECH_DENSITY_TERMS } from './signalTerms'

interface Signal {
  label: string
  patterns: RegExp[]
  weight: number
}

/** Señales que empujan hacia un sistema ATS (parseabilidad por máquina). */
const ATS_SIGNALS: Signal[] = [
  {
    label: 'Plataforma ATS detectada (Workday/Greenhouse/Taleo/Lever/SuccessFactors)',
    patterns: [/workday/i, /greenhouse/i, /taleo/i, /\blever\b/i, /successfactors/i, /icims/i, /smartrecruiters/i],
    weight: 35,
  },
  {
    label: 'Mención explícita de "applicant tracking system" / cribado automático',
    patterns: [/applicant tracking/i, /\bATS\b/, /cribado autom/i, /sistema de seguimiento/i],
    weight: 30,
  },
  {
    label: 'Portal corporativo / "sube tu CV" en formulario',
    patterns: [/sube tu (cv|currículum)/i, /upload your (cv|resume)/i, /portal de empleo/i, /careers?\.\w+/i, /apply (now|online)/i, /aplica en línea/i],
    weight: 18,
  },
  {
    label: 'Gran empresa / multinacional (procesos estandarizados)',
    patterns: [/multinacional/i, /global (company|team|leader)/i, /fortune \d+/i, /\b\d{3,}\+? (empleados|employees)\b/i],
    weight: 12,
  },
  {
    label: 'Lista densa de requisitos técnicos obligatorios',
    patterns: [/requisitos (mínimos|obligatorios|imprescindibles)/i, /must[- ]have/i, /imprescindible/i],
    weight: 10,
  },
]

/** Señales que empujan hacia un formato Harvard (lectura humana directa). */
const HARVARD_SIGNALS: Signal[] = [
  {
    label: 'Candidatura por contacto directo / email a una persona',
    patterns: [/env[íi]a (tu )?(cv|currículum) a [\w.-]+@/i, /send your (cv|resume) to [\w.-]+@/i, /contacta (con|a) /i, /escr[íi]benos a/i],
    weight: 32,
  },
  {
    label: 'Referido / networking / recomendación personal',
    patterns: [/referido/i, /referral/i, /recomendaci[óo]n/i, /networking/i, /te conocemos/i],
    weight: 26,
  },
  {
    label: 'Startup pequeña / equipo reducido / trato cercano',
    patterns: [/startup/i, /equipo (pequeño|reducido)/i, /small team/i, /early[- ]stage/i, /fundador/i, /founder/i],
    weight: 16,
  },
  {
    label: 'Ámbito académico, consultoría o investigación',
    patterns: [/investigaci[óo]n/i, /research/i, /universidad/i, /consultor[íi]a/i, /\bPhD\b/i, /docencia/i, /académic/i],
    weight: 18,
  },
  {
    label: 'Énfasis en logros, impacto y narrativa profesional',
    patterns: [/logros/i, /impacto/i, /trayectoria/i, /track record/i, /storytelling/i],
    weight: 8,
  },
]

function scoreSignals(text: string, signals: Signal[]): { total: number; hits: string[] } {
  let total = 0
  const hits: string[] = []
  for (const sig of signals) {
    if (sig.patterns.some((re) => re.test(text))) {
      total += sig.weight
      hits.push(sig.label)
    }
  }
  return { total, hits }
}

/** Densidad de términos técnicos: mucha densidad favorece ATS (parseabilidad). */
function techDensityBonus(text: string): number {
  const lower = text.toLowerCase()
  let count = 0
  for (const term of TECH_DENSITY_TERMS) {
    if (lower.includes(term)) count++
  }
  if (count >= 10) return 14
  if (count >= 6) return 9
  if (count >= 3) return 4
  return 0
}

/**
 * Recomendación determinista. Si no hay texto suficiente, recomienda ATS por
 * defecto (la opción más segura para la mayoría de procesos modernos).
 */
export function recommendTemplate(job: JobOffer): Recommendation {
  const text = `${job.title} ${job.company} ${job.rawText}`.trim()

  if (text.replace(/\s/g, '').length < 40) {
    return {
      template: 'ats',
      score: 55,
      atsSignals: ['Información insuficiente: se aplica el formato ATS por seguridad'],
      harvardSignals: [],
      rationale:
        'Aún no hay suficiente texto de la oferta para un análisis fino. El formato ATS es la opción más segura por defecto, ya que la mayoría de empresas usan cribado automático. Pega más detalle de la oferta para afinar la recomendación.',
      aiEnhanced: false,
    }
  }

  const ats = scoreSignals(text, ATS_SIGNALS)
  const harvard = scoreSignals(text, HARVARD_SIGNALS)
  const atsTotal = ats.total + techDensityBonus(text)

  const template = atsTotal >= harvard.total ? 'ats' : 'harvard'
  const winner = Math.max(atsTotal, harvard.total)
  const loser = Math.min(atsTotal, harvard.total)
  const denom = winner + loser || 1
  // Confianza 50..98 según el margen entre ganador y perdedor.
  const score = Math.min(98, Math.max(50, Math.round(50 + ((winner - loser) / denom) * 48)))

  const rationale =
    template === 'ats'
      ? `Esta oferta muestra señales propias de procesos con cribado automático (${
          ats.hits[0] ?? 'requisitos técnicos densos'
        }). El formato ATS —una sola columna, sans-serif, secciones etiquetadas y sin gráficos— maximiza la probabilidad de que el sistema lea correctamente tu CV.`
      : `Esta oferta apunta a una lectura humana directa (${
          harvard.hits[0] ?? 'contacto cercano'
        }). El formato Harvard —tipografía serif, jerarquía clásica y foco en logros— transmite solidez y trayectoria a un reclutador que leerá tu CV en detalle.`

  return {
    template,
    score,
    atsSignals: ats.hits.length ? ats.hits : ['Sin señales ATS claras'],
    harvardSignals: harvard.hits.length ? harvard.hits : ['Sin señales Harvard claras'],
    rationale,
    aiEnhanced: false,
  }
}
