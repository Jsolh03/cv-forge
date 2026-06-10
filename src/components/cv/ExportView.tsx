import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { CVPreview } from './templates/CVPreview'
import type { TemplateKind } from '@/types'

export function ExportView() {
  const profile = useAppStore((s) => s.profile)
  const template = useAppStore((s) => s.template)
  const setTemplate = useAppStore((s) => s.setTemplate)
  const recommendation = useAppStore((s) => s.recommendation)
  const pushToast = useAppStore((s) => s.pushToast)
  const [zoom, setZoom] = useState(0.85)

  const handlePrint = () => {
    pushToast('info', 'En el diálogo, elige “Guardar como PDF” como destino.')
    // Deja repintar el toast antes de abrir el diálogo (bloquea el hilo).
    setTimeout(() => window.print(), 200)
  }

  return (
    <div className="stack gap-6">
      <Card padSm className="no-print">
        <div className="between wrap gap-4">
          <div className="row gap-3 wrap">
            <div className="segmented">
              {(['ats', 'harvard'] as TemplateKind[]).map((kind) => (
                <button
                  key={kind}
                  className={`segmented__item ${template === kind ? 'segmented__item--active' : ''}`}
                  onClick={() => setTemplate(kind)}
                >
                  <Icon name="layout" size={14} />
                  {kind === 'ats' ? 'ATS' : 'Harvard'}
                  {recommendation?.template === kind && ' ★'}
                </button>
              ))}
            </div>
            <div className="row gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)))}
                aria-label="Reducir zoom"
              >
                –
              </Button>
              <span style={{ minWidth: 52, textAlign: 'center', fontSize: 'var(--fs-sm)', fontWeight: 600 }}>
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setZoom((z) => Math.min(1.2, +(z + 0.1).toFixed(2)))}
                aria-label="Aumentar zoom"
              >
                +
              </Button>
            </div>
          </div>

          <div className="row gap-2">
            <Button variant="ghost" icon={<Icon name="refresh" size={15} />} onClick={() => setZoom(0.85)}>
              Ajustar
            </Button>
            <Button icon={<Icon name="download" size={16} />} onClick={handlePrint}>
              Descargar PDF
            </Button>
          </div>
        </div>
        <hr className="divider" />
        <p className="text-muted" style={{ fontSize: 'var(--fs-xs)', lineHeight: 'var(--lh-snug)' }}>
          Al pulsar <strong>Descargar PDF</strong> se abre el diálogo de impresión: en{' '}
          <strong>“Destino”</strong> elige <strong>“Guardar como PDF”</strong> y guarda. El texto se
          exporta <strong>vectorial y seleccionable</strong>, así que los sistemas ATS pueden leerlo
          (no es una imagen). Deja los márgenes en <strong>“Predeterminados”</strong>; el tamaño A4 ya
          está configurado.
        </p>
      </Card>

      <CVPreview profile={profile} template={template} zoom={zoom} printRoot />
    </div>
  )
}
