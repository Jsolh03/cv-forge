/* =========================================================================
   Conector Ollama — IA local vía HTTP (http://localhost:11434)
   Sin dependencias externas: usa fetch nativo. Maneja timeouts y errores.
   ========================================================================= */

const OLLAMA_BASE = 'http://localhost:11434'

export interface OllamaTag {
  name: string
}

export interface OllamaPing {
  available: boolean
  models: string[]
  error: string | null
}

/** Comprueba si Ollama está vivo y devuelve los modelos instalados. */
export async function pingOllama(timeoutMs = 2500): Promise<OllamaPing> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, { signal: controller.signal })
    if (!res.ok) {
      return { available: false, models: [], error: `HTTP ${res.status}` }
    }
    const data = (await res.json()) as { models?: OllamaTag[] }
    const models = (data.models ?? []).map((m) => m.name)
    return { available: true, models, error: null }
  } catch (err) {
    const message =
      err instanceof DOMException && err.name === 'AbortError'
        ? 'Tiempo de espera agotado'
        : 'No se pudo conectar con Ollama'
    return { available: false, models: [], error: message }
  } finally {
    clearTimeout(timer)
  }
}

export interface GenerateOptions {
  model: string
  prompt: string
  system?: string
  temperature?: number
  timeoutMs?: number
  signal?: AbortSignal
}

/** Genera texto con Ollama (modo no-stream para simplicidad y robustez). */
export async function generate(opts: GenerateOptions): Promise<string> {
  const { model, prompt, system, temperature = 0.4, timeoutMs = 60000, signal } = opts

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  if (signal) {
    signal.addEventListener('abort', () => controller.abort(), { once: true })
  }

  try {
    const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        prompt,
        system,
        stream: false,
        options: { temperature },
      }),
    })

    if (!res.ok) {
      throw new OllamaError(`Ollama respondió HTTP ${res.status}`)
    }

    const data = (await res.json()) as { response?: string; error?: string }
    if (data.error) throw new OllamaError(data.error)
    return (data.response ?? '').trim()
  } catch (err) {
    if (err instanceof OllamaError) throw err
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new OllamaError('La generación superó el tiempo de espera')
    }
    throw new OllamaError('Fallo de red al contactar con Ollama')
  } finally {
    clearTimeout(timer)
  }
}

export class OllamaError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OllamaError'
  }
}
