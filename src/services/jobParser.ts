/* =========================================================================
   Parser de ofertas: normaliza texto y deduce título/empresa.
   Para URL intenta fetch directo; ante bloqueo CORS guía al usuario.
   ========================================================================= */

export interface ParsedJob {
  title: string
  company: string
  text: string
}

/** Normaliza espacios y saltos de línea de un texto pegado u OCR. */
export function normalizeText(raw: string): string {
  return raw
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .split('\n')
    .map((l) => l.trim())
    .join('\n')
    .trim()
}

/** Heurística para deducir título de puesto y empresa de un texto de oferta. */
export function inferTitleAndCompany(text: string): { title: string; company: string } {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  let title = ''
  let company = ''

  const TITLE_HINTS =
    /(ingenier|developer|desarrollad|engineer|manager|analyst|analista|designer|diseñad|consultor|specialist|especialista|lead|architect|arquitect|scientist|técnic|technician|director|responsable)/i

  for (const line of lines.slice(0, 12)) {
    if (!title && TITLE_HINTS.test(line) && line.length < 90) {
      title = line.replace(/^(puesto|vacante|posición|position|role)\s*[:\-]\s*/i, '')
    }
    const compMatch = /(en|at|para|para la empresa)\s+([A-ZÁÉÍÓÚ][\w&.\- ]{2,40})/.exec(line)
    if (!company && compMatch) company = compMatch[2].trim()
    const compLabel = /(empresa|company|compañía)\s*[:\-]\s*(.+)/i.exec(line)
    if (compLabel) company = compLabel[2].trim()
  }

  return { title, company }
}

/** Procesa texto pegado u obtenido por OCR. */
export function parseText(raw: string): ParsedJob {
  const text = normalizeText(raw)
  const { title, company } = inferTitleAndCompany(text)
  return { title, company, text }
}

export class CorsBlockedError extends Error {
  constructor() {
    super(
      'El navegador bloqueó la lectura de esta URL (CORS). Abre la oferta, copia el texto y pégalo en la pestaña "Texto", o sube una captura en "Imagen".',
    )
    this.name = 'CorsBlockedError'
  }
}

/**
 * Intenta obtener y extraer el texto principal de una URL.
 * Muchos portales bloquean CORS en el navegador: en ese caso lanzamos
 * CorsBlockedError con instrucciones claras (degradación elegante, sin mock falso).
 */
export async function parseUrl(url: string, timeoutMs = 8000): Promise<ParsedJob> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: controller.signal, mode: 'cors' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const html = await res.text()
    const text = htmlToText(html)
    if (text.replace(/\s/g, '').length < 80) {
      throw new Error('La página no devolvió texto legible (posible contenido dinámico).')
    }
    const { title, company } = inferTitleAndCompany(text)
    return { title, company, text }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('La URL tardó demasiado en responder.')
    }
    // TypeError de fetch en navegador = casi siempre CORS.
    if (err instanceof TypeError) throw new CorsBlockedError()
    throw err instanceof Error ? err : new CorsBlockedError()
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Lectura de la URL a través de un proxy CORS público (opt-in del usuario).
 * IMPORTANTE: rompe el local-first SOLO en esta petición — el texto de la oferta
 * pasa por un servicio externo. El llamador debe advertirlo explícitamente.
 */
const PUBLIC_PROXY = 'https://api.allorigins.win/raw?url='

export async function parseUrlViaProxy(url: string, timeoutMs = 14000): Promise<ParsedJob> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(PUBLIC_PROXY + encodeURIComponent(url), { signal: controller.signal })
    if (!res.ok) throw new Error(`El proxy respondió HTTP ${res.status}.`)
    const html = await res.text()
    const text = htmlToText(html)
    if (text.replace(/\s/g, '').length < 80) {
      throw new Error(
        'La página no devolvió texto legible (probablemente requiere inicio de sesión o se genera con JavaScript). Copia el texto y pégalo en la pestaña “Texto”.',
      )
    }
    const { title, company } = inferTitleAndCompany(text)
    return { title, company, text }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('El proxy tardó demasiado en responder.')
    }
    if (err instanceof TypeError) {
      throw new Error('No se pudo contactar con el proxy público. Revisa tu conexión.')
    }
    throw err instanceof Error ? err : new Error('Fallo al leer la oferta vía proxy.')
  } finally {
    clearTimeout(timer)
  }
}

/** Extrae texto plano de HTML eliminando scripts/estilos y etiquetas. */
export function htmlToText(html: string): string {
  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
  const withBreaks = withoutScripts
    .replace(/<\/(p|div|li|h[1-6]|br|tr)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
  const text = withBreaks.replace(/<[^>]+>/g, ' ')
  const decoded = decodeEntities(text)
  return normalizeText(decoded)
}

function decodeEntities(text: string): string {
  const map: Record<string, string> = {
    '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ',
    '&aacute;': 'á', '&eacute;': 'é', '&iacute;': 'í', '&oacute;': 'ó', '&uacute;': 'ú',
    '&ntilde;': 'ñ', '&uuml;': 'ü',
  }
  return text.replace(/&[#\w]+;/g, (e) => map[e.toLowerCase()] ?? e)
}
