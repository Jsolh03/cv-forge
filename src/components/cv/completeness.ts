import type { UserProfile } from '@/types'

/** Calcula un porcentaje 0..100 de completitud del perfil con pesos por sección. */
export function computeCompleteness(p: UserProfile): number {
  const checks: Array<[boolean, number]> = [
    [p.contact.fullName.trim().length > 0, 12],
    [p.contact.headline.trim().length > 0, 8],
    [p.contact.email.trim().length > 0, 8],
    [p.contact.location.trim().length > 0, 5],
    [p.summary.trim().length >= 60, 15],
    [p.experience.length > 0, 12],
    [p.experience.some((e) => e.bullets.some((b) => b.trim().length > 10)), 15],
    [p.education.length > 0, 10],
    [p.skills.length >= 3, 10],
    [p.languages.length > 0, 5],
  ]
  const total = checks.reduce((sum, [, w]) => sum + w, 0)
  const got = checks.reduce((sum, [ok, w]) => sum + (ok ? w : 0), 0)
  return Math.round((got / total) * 100)
}
