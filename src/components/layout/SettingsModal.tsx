import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Field'
import { Icon } from '@/components/ui/Icon'
import { useAppStore } from '@/store/useAppStore'
import type { AiStatus } from '@/types'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
  ai: AiStatus
  onRecheck: () => void
}

export function SettingsModal({ open, onClose, ai, onRecheck }: SettingsModalProps) {
  const ollamaModel = useAppStore((s) => s.ollamaModel)
  const setOllamaModel = useAppStore((s) => s.setOllamaModel)

  return (
    <Modal
      open={open}
      title="IA local · Ollama"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" size="sm" icon={<Icon name="refresh" size={15} />} onClick={onRecheck}>
            Reintentar conexión
          </Button>
          <Button size="sm" onClick={onClose}>
            Listo
          </Button>
        </>
      }
    >
      <div className="stack gap-4">
        <div
          className="row gap-3"
          style={{
            padding: 'var(--sp-3) var(--sp-4)',
            borderRadius: 'var(--r-md)',
            background: ai.ollamaAvailable ? 'var(--success-bg)' : 'var(--warning-bg)',
            border: `1px solid ${ai.ollamaAvailable ? 'rgba(52,211,153,0.3)' : 'rgba(251,191,36,0.3)'}`,
          }}
        >
          <span className={`status-dot ${ai.ollamaAvailable ? 'status-dot--on' : 'status-dot--off'}`} />
          <div className="grow">
            <div style={{ fontWeight: 700 }}>
              {ai.ollamaAvailable ? 'Conectado a Ollama' : 'Ollama no detectado'}
            </div>
            <div className="text-muted" style={{ fontSize: 'var(--fs-xs)' }}>
              {ai.ollamaAvailable
                ? `${ai.models.length} modelo(s) disponible(s)`
                : ai.error ?? 'La app funciona igualmente en modo heurístico local.'}
            </div>
          </div>
        </div>

        {ai.ollamaAvailable && ai.models.length > 0 ? (
          <Field label="Modelo activo" hint="Se usará para optimizar viñetas, gap analysis y recomendaciones.">
            <Select
              value={ollamaModel}
              onChange={(e) => setOllamaModel(e.target.value)}
              options={ai.models.map((m) => ({ value: m, label: m }))}
            />
          </Field>
        ) : (
          <Field label="Modelo preferido" hint="Se usará cuando Ollama esté disponible.">
            <Input
              value={ollamaModel}
              onChange={(e) => setOllamaModel(e.target.value)}
              placeholder="llama3"
            />
          </Field>
        )}

        {!ai.ollamaAvailable && (
          <div
            className="stack gap-2"
            style={{
              fontSize: 'var(--fs-sm)',
              color: 'var(--text-2)',
              background: 'rgba(10,14,26,0.5)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--r-md)',
              padding: 'var(--sp-4)',
            }}
          >
            <strong style={{ color: 'var(--text-1)' }}>Cómo activar la IA avanzada (opcional):</strong>
            <ol style={{ paddingLeft: '1.1rem', display: 'grid', gap: 4 }}>
              <li>
                Instala Ollama desde <code>ollama.com</code>.
              </li>
              <li>
                Descarga un modelo: <code>ollama pull llama3</code> (o <code>gemma2</code>).
              </li>
              <li>
                Asegúrate de que corre en <code>localhost:11434</code> y pulsa “Reintentar”.
              </li>
            </ol>
            <span className="text-muted" style={{ fontSize: 'var(--fs-xs)' }}>
              Sin Ollama, CV Forge sigue optimizando con su motor heurístico determinista local.
            </span>
          </div>
        )}
      </div>
    </Modal>
  )
}
