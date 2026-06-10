/** Validaciones puras reutilizables en formularios. */

export function isEmail(value: string): boolean {
  if (!value) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function isUrl(value: string): boolean {
  if (!value) return false
  try {
    const u = new URL(value.trim())
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

export function isNonEmpty(value: string): boolean {
  return value.trim().length > 0
}

/** Devuelve un mensaje de error o null si es válido. */
export function validateRequired(value: string, label: string): string | null {
  return isNonEmpty(value) ? null : `${label} es obligatorio`
}
