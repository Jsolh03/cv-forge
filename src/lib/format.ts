/** Utilidades de formato puro (sin estado). */

const MONTHS_ES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
]

/** Convierte "2021-03" en "mar 2021"; deja el texto libre intacto. */
export function formatMonthYear(value: string): string {
  if (!value) return ''
  const match = /^(\d{4})-(\d{2})$/.exec(value.trim())
  if (!match) return value
  const year = match[1]
  const month = Number(match[2])
  if (month < 1 || month > 12) return value
  return `${MONTHS_ES[month - 1]} ${year}`
}

/** Rango de fechas para experiencia/educación. */
export function formatRange(start: string, end: string, current: boolean): string {
  const a = formatMonthYear(start)
  const b = current ? 'Actualidad' : formatMonthYear(end)
  if (a && b) return `${a} — ${b}`
  return a || b || ''
}

/** Capitaliza la primera letra. */
export function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

/** Trunca con elipsis. */
export function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s
}
