/* =========================================================================
   Builders de prompts para las tareas de IA local.
   Cada prompt es explícito y pide salida limpia, sin preámbulos.
   ========================================================================= */

import type { JobOffer, Recommendation } from '@/types'

export const SYSTEM_CV_EXPERT =
  'Eres un experto en redacción de currículums y coaching de carrera. Respondes en español, ' +
  'de forma concreta y profesional. Nunca inventas datos que no te den. No añades preámbulos ' +
  'ni explicaciones salvo que se pidan explícitamente.'

/** Reescribe una viñeta con la fórmula X-Y-Z de Google. */
export function bulletPrompt(bullet: string, jobKeywords: string[]): string {
  const kw = jobKeywords.slice(0, 12).join(', ')
  return [
    'Reescribe la siguiente viñeta de experiencia profesional usando la fórmula X-Y-Z de Google:',
    '"Logré [X], medido por [Y], haciendo [Z]".',
    '',
    'Reglas:',
    '- Empieza con un verbo de acción fuerte en pasado.',
    '- Incluye una métrica o resultado cuantificable (si el original no la tiene, propón una plausible con un placeholder claro como "X%").',
    '- Integra de forma natural palabras clave relevantes de esta oferta si encajan: ' + (kw || '(sin keywords)') + '.',
    '- Devuelve SOLO la viñeta reescrita, en una sola línea, sin comillas ni viñeta inicial.',
    '',
    'Viñeta original: ' + bullet,
  ].join('\n')
}

/** Mejora del resumen profesional alineado a la oferta. */
export function summaryPrompt(summary: string, job: JobOffer): string {
  return [
    'Mejora este resumen profesional de CV para alinearlo con la oferta indicada.',
    'Máximo 3 frases. Tono profesional y seguro. Sin inventar experiencia que no exista.',
    'Devuelve SOLO el resumen mejorado, sin comillas.',
    '',
    'Resumen actual: ' + (summary || '(vacío)'),
    '',
    'Puesto: ' + job.title,
    'Empresa: ' + job.company,
    'Descripción (extracto): ' + job.rawText.slice(0, 1200),
  ].join('\n')
}

/** Justificación enriquecida de la recomendación de plantilla. */
export function recommendationPrompt(job: JobOffer, base: Recommendation): string {
  return [
    'Un algoritmo ha recomendado el formato "' +
      (base.template === 'ats' ? 'ATS (optimizado para sistemas de cribado)' : 'Harvard (clásico)') +
      '" para esta oferta.',
    'Escribe una justificación breve (2-3 frases) en español dirigida al candidato, explicando por qué ese formato es el adecuado para esta oferta concreta.',
    'Devuelve SOLO el texto, sin encabezados.',
    '',
    'Puesto: ' + job.title,
    'Empresa: ' + job.company,
    'Descripción (extracto): ' + job.rawText.slice(0, 1000),
  ].join('\n')
}

/** De las keywords faltantes, cuáles encajan plausiblemente con el perfil. */
export function fittingKeywordsPrompt(missing: string[], profileText: string): string {
  return [
    'Perfil del candidato (habilidades y experiencia):',
    profileText.slice(0, 1500),
    '',
    'Palabras clave de la oferta que NO aparecen en su CV:',
    missing.join(', '),
    '',
    'Devuelve SOLO las palabras de esa lista que encajen de forma plausible con la experiencia del candidato (las que probablemente domine aunque se le olvidara mencionarlas).',
    'Una palabra por línea, exactamente como aparecen en la lista. Sin explicaciones. Si ninguna encaja, no devuelvas nada.',
  ].join('\n')
}

/** Genera una carta de presentación personalizada. */
export function coverLetterPrompt(opts: {
  fullName: string
  headline: string
  jobTitle: string
  company: string
  topBullets: string[]
  skills: string[]
  jobExcerpt: string
}): string {
  return [
    'Escribe una carta de presentación profesional en español para esta candidatura.',
    'Requisitos:',
    '- 3 o 4 párrafos, tono profesional y cercano, sin sonar genérico.',
    '- Primer párrafo: interés por el puesto y la empresa.',
    '- Párrafos centrales: conecta los logros del candidato con lo que pide la oferta.',
    '- Cierre: disponibilidad y agradecimiento.',
    '- NO inventes datos que no se den. No incluyas encabezados de dirección ni la fecha; solo el cuerpo de la carta.',
    '- Empieza con "Estimado equipo de ' + (opts.company || 'la empresa') + ',".',
    '',
    'Candidato: ' + opts.fullName + (opts.headline ? ` (${opts.headline})` : ''),
    'Puesto: ' + opts.jobTitle,
    'Empresa: ' + opts.company,
    'Logros destacados: ' + (opts.topBullets.join(' | ') || '(no especificados)'),
    'Habilidades: ' + (opts.skills.join(', ') || '(no especificadas)'),
    'Extracto de la oferta: ' + opts.jobExcerpt.slice(0, 800),
  ].join('\n')
}

/** Sugerencias de gap analysis enriquecidas. */
export function gapPrompt(missing: string[], job: JobOffer): string {
  return [
    'Estas palabras clave de la oferta NO aparecen en el CV del candidato:',
    missing.slice(0, 15).join(', ') || '(ninguna)',
    '',
    'Da 3 recomendaciones accionables y concretas en español para que el candidato cierre esas brechas en su CV.',
    'Formato: una recomendación por línea, empezando con un guion. Sin introducción.',
    '',
    'Contexto del puesto: ' + job.title + ' en ' + job.company,
  ].join('\n')
}
