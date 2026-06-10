/* =========================================================================
   Extracción de keywords y análisis de brechas (heurística determinista).
   Funciona SIEMPRE, con o sin IA. La IA solo enriquece estos resultados.
   ========================================================================= */

import type { GapAnalysis, UserProfile } from '@/types'

/** Stopwords ES + EN para filtrar ruido al extraer keywords. */
const STOPWORDS = new Set([
  // español
  'de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por', 'un', 'para',
  'con', 'no', 'una', 'su', 'al', 'lo', 'como', 'más', 'pero', 'sus', 'le', 'ya', 'o', 'este',
  'sí', 'porque', 'esta', 'entre', 'cuando', 'muy', 'sin', 'sobre', 'también', 'me', 'hasta',
  'hay', 'donde', 'quien', 'desde', 'todo', 'nos', 'durante', 'todos', 'uno', 'les', 'ni',
  'contra', 'otros', 'ese', 'eso', 'ante', 'ellos', 'e', 'esto', 'mí', 'antes', 'algunos',
  'qué', 'unos', 'yo', 'otro', 'otras', 'otra', 'él', 'tanto', 'esa', 'estos', 'mucho',
  'quienes', 'nada', 'muchos', 'cual', 'sea', 'poco', 'ella', 'estar', 'haber', 'ser',
  'experiencia', 'trabajo', 'empresa', 'equipo', 'puesto', 'candidato', 'requisitos', 'años',
  'conocimientos', 'capacidad', 'buscamos', 'ofrecemos', 'funciones', 'tareas',
  // inglés
  'the', 'and', 'for', 'with', 'you', 'are', 'our', 'will', 'your', 'have', 'has', 'this',
  'that', 'from', 'they', 'their', 'about', 'role', 'team', 'work', 'experience', 'job',
  'company', 'who', 'what', 'all', 'any', 'can', 'must', 'should', 'years', 'plus', 'including',
  'strong', 'ability', 'skills', 'requirements', 'responsibilities', 'looking',
])

/** Diccionario de skills técnicas reconocidas para dar más peso. */
const TECH_TERMS = new Set([
  'react', 'angular', 'vue', 'svelte', 'typescript', 'javascript', 'node', 'nodejs', 'python',
  'java', 'kotlin', 'swift', 'go', 'golang', 'rust', 'php', 'ruby', 'c++', 'c#', '.net', 'dotnet',
  'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'graphql', 'rest', 'grpc', 'kafka',
  'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'terraform', 'ansible', 'jenkins', 'gitlab',
  'ci/cd', 'cicd', 'git', 'agile', 'scrum', 'kanban', 'jira', 'figma', 'tailwind', 'css', 'html',
  'sass', 'webpack', 'vite', 'next', 'nextjs', 'nuxt', 'express', 'nestjs', 'django', 'flask',
  'spring', 'laravel', 'rails', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'spark', 'hadoop',
  'elasticsearch', 'rabbitmq', 'microservices', 'microservicios', 'devops', 'linux', 'bash',
  'testing', 'jest', 'cypress', 'playwright', 'selenium', 'seo', 'ux', 'ui', 'saas', 'api',
])

const TOKEN_RE = /[a-záéíóúüñ][a-záéíóúüñ0-9+#./-]{1,}/gi

function normalize(token: string): string {
  return token.toLowerCase().replace(/[.,;:()]+$/g, '').trim()
}

/**
 * Extrae las keywords más relevantes de un texto, priorizando términos técnicos
 * y la frecuencia. Devuelve hasta `limit` keywords ordenadas por peso.
 */
export function extractKeywords(text: string, limit = 24): string[] {
  if (!text.trim()) return []

  const counts = new Map<string, number>()
  const matches = text.match(TOKEN_RE) ?? []

  for (const raw of matches) {
    const tok = normalize(raw)
    if (tok.length < 2 || STOPWORDS.has(tok) || /^\d+$/.test(tok)) continue
    const weight = TECH_TERMS.has(tok) ? 3 : 1
    counts.set(tok, (counts.get(tok) ?? 0) + weight)
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word)
}

/** Construye un blob de texto con todo el contenido relevante del perfil. */
export function profileToText(profile: UserProfile): string {
  const parts: string[] = [
    profile.contact.headline,
    profile.summary,
    ...profile.skills.map((s) => s.name),
    ...profile.languages.map((l) => l.name),
    ...profile.experience.flatMap((e) => [e.role, e.company, ...e.bullets]),
    ...profile.education.flatMap((e) => [e.degree, e.field, e.institution]),
    ...profile.projects.flatMap((p) => [p.name, p.description]),
  ]
  return parts.join(' ').toLowerCase()
}

/**
 * Gap analysis determinista: compara las keywords de la oferta con el contenido
 * del perfil y calcula cobertura, matches, faltantes y sugerencias.
 */
export function computeGap(jobKeywords: string[], profile: UserProfile): GapAnalysis {
  const profileText = profileToText(profile)
  const matched: string[] = []
  const missing: string[] = []

  for (const kw of jobKeywords) {
    if (profileText.includes(kw.toLowerCase())) matched.push(kw)
    else missing.push(kw)
  }

  const total = jobKeywords.length || 1
  const coverage = Math.round((matched.length / total) * 100)

  const suggestions: string[] = []
  const missingTech = missing.filter((m) => TECH_TERMS.has(m.toLowerCase()))
  if (missingTech.length > 0) {
    suggestions.push(
      `Añade o resalta estas tecnologías clave si las dominas: ${missingTech.slice(0, 6).join(', ')}.`,
    )
  }
  if (missing.length > 0) {
    suggestions.push(
      `Integra de forma natural estas palabras de la oferta en tu resumen o viñetas: ${missing
        .slice(0, 8)
        .join(', ')}.`,
    )
  }
  if (coverage < 50) {
    suggestions.push('Tu cobertura es baja: prioriza reescribir el resumen alineándolo a la oferta.')
  } else if (coverage >= 80) {
    suggestions.push('Excelente alineación: pule las viñetas con métricas para destacar aún más.')
  }
  if (suggestions.length === 0) {
    suggestions.push('Buen punto de partida. Refuerza cada viñeta con resultados cuantificables.')
  }

  return { matched, missing, coverage, suggestions, aiEnhanced: false }
}
