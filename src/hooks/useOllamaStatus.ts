import { useCallback, useEffect, useRef, useState } from 'react'
import { pingOllama } from '@/services/ollama'
import type { AiStatus } from '@/types'
import { useAppStore } from '@/store/useAppStore'

const POLL_MS = 30000

const INITIAL: AiStatus = {
  ollamaAvailable: false,
  ollamaModel: '',
  models: [],
  checkedAt: 0,
  checking: true,
  error: null,
}

/**
 * Sondea el estado de Ollama al montar y periódicamente. Selecciona un modelo
 * por defecto válido si el configurado no está instalado.
 */
export function useOllamaStatus() {
  const [status, setStatus] = useState<AiStatus>(INITIAL)
  const ollamaModel = useAppStore((s) => s.ollamaModel)
  const setOllamaModel = useAppStore((s) => s.setOllamaModel)
  const mounted = useRef(true)

  const check = useCallback(async () => {
    setStatus((s) => ({ ...s, checking: true }))
    const ping = await pingOllama()
    if (!mounted.current) return

    let model = ollamaModel
    if (ping.available && ping.models.length > 0 && !ping.models.includes(ollamaModel)) {
      // El modelo configurado no existe: elige uno instalado.
      const preferred =
        ping.models.find((m) => /llama3|gemma2|qwen|mistral/i.test(m)) ?? ping.models[0]
      model = preferred
      setOllamaModel(preferred)
    }

    setStatus({
      ollamaAvailable: ping.available,
      ollamaModel: model,
      models: ping.models,
      checkedAt: Date.now(),
      checking: false,
      error: ping.error,
    })
  }, [ollamaModel, setOllamaModel])

  useEffect(() => {
    mounted.current = true
    void check()
    const interval = setInterval(() => void check(), POLL_MS)
    return () => {
      mounted.current = false
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { status, recheck: check }
}
