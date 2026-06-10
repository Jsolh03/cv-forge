/* =========================================================================
   OCR local con Tesseract.js — extrae texto de capturas de ofertas.
   Carga perezosa del worker; reporta progreso para la UI.
   ========================================================================= */

import Tesseract from 'tesseract.js'

export interface OcrProgress {
  status: string
  progress: number // 0..1
}

/**
 * Reconoce texto de una imagen (File/Blob/dataURL). Idiomas: español + inglés.
 * Lanza un Error legible si falla. Reporta progreso vía callback opcional.
 */
export async function recognizeImage(
  image: File | Blob | string,
  onProgress?: (p: OcrProgress) => void,
): Promise<string> {
  try {
    const result = await Tesseract.recognize(image, 'spa+eng', {
      logger: (m: { status: string; progress: number }) => {
        if (onProgress) onProgress({ status: translateStatus(m.status), progress: m.progress })
      },
    })
    return result.data.text.trim()
  } catch {
    throw new Error('No se pudo procesar la imagen. Prueba con una captura más nítida.')
  }
}

function translateStatus(status: string): string {
  const map: Record<string, string> = {
    'loading tesseract core': 'Cargando motor OCR…',
    'initializing tesseract': 'Inicializando…',
    'loading language traineddata': 'Cargando idiomas…',
    'initializing api': 'Preparando reconocimiento…',
    'recognizing text': 'Reconociendo texto…',
  }
  return map[status] ?? status
}
