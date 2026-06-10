/** Genera un identificador único corto, estable en el cliente. */
export function uid(prefix = 'id'): string {
  const rnd =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.floor(Math.random() * 1e9).toString(36)
  return `${prefix}_${rnd}`
}
