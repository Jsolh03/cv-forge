import type { ContactInfo } from '@/types'

export function hasContent(value: string): boolean {
  return value.trim().length > 0
}

/** Devuelve los campos de contacto no vacíos en orden de presentación. */
export function contactParts(contact: ContactInfo): string[] {
  return [
    contact.email,
    contact.phone,
    contact.location,
    contact.website,
    contact.linkedin,
    contact.github,
  ].filter(hasContent)
}
