import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TextArea } from '@/components/ui/Field'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/EmptyState'
import { contactParts } from '@/components/cv/templates/shared'
import { generateCoverLetter } from '@/services/enhance'
import type { AiStatus } from '@/types'
import './cover.css'

export function CoverLetterView({ ai }: { ai: AiStatus }) {
  const profile = useAppStore((s) => s.profile)
  const job = useAppStore((s) => s.job)
  const coverLetter = useAppStore((s) => s.coverLetter)
  const setCoverLetter = useAppStore((s) => s.setCoverLetter)
  const pushToast = useAppStore((s) => s.pushToast)
  const [busy, setBusy] = useState(false)

  const contacts = contactParts(profile.contact)
  const canGenerate = profile.experience.length > 0 || profile.summary.trim().length > 0

  async function generate() {
    if (!canGenerate) {
      pushToast('warning', 'Completa tu perfil (experiencia o resumen) antes de generar la carta.')
      return
    }
    setBusy(true)
    try {
      const { value, aiUsed } = await generateCoverLetter(profile, job, {
        available: ai.ollamaAvailable,
        model: ai.ollamaModel,
      })
      setCoverLetter(value)
      pushToast('success', aiUsed ? 'Carta generada con IA local.' : 'Carta generada (plantilla local).')
    } catch {
      pushToast('error', 'No se pudo generar la carta.')
    } finally {
      setBusy(false)
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(coverLetter)
      pushToast('success', 'Carta copiada al portapapeles.')
    } catch {
      pushToast('error', 'No se pudo copiar.')
    }
  }

  function downloadPdf() {
    pushToast('info', 'En el diálogo, elige “Guardar como PDF”.')
    setTimeout(() => window.print(), 200)
  }

  return (
    <div className="stack gap-6">
      <Card padSm className="no-print">
        <div className="between wrap gap-3">
          <div className="row gap-2">
            <span className={`status-dot ${ai.ollamaAvailable ? 'status-dot--on' : 'status-dot--off'}`} />
            <span style={{ fontSize: 'var(--fs-sm)' }}>
              {ai.ollamaAvailable
                ? `Generación con IA local (${ai.ollamaModel})`
                : 'Generación con plantilla local (sin Ollama)'}
              {job.company ? ` · para ${job.company}` : ''}
            </span>
          </div>
          <div className="row gap-2">
            {coverLetter && (
              <>
                <Button variant="ghost" size="sm" icon={<Icon name="text" size={15} />} onClick={copy}>
                  Copiar
                </Button>
                <Button variant="ghost" size="sm" icon={<Icon name="download" size={15} />} onClick={downloadPdf}>
                  Descargar PDF
                </Button>
              </>
            )}
            <Button
              size="sm"
              loading={busy}
              icon={<Icon name="wand" size={15} />}
              onClick={generate}
            >
              {coverLetter ? 'Regenerar' : 'Generar carta'}
            </Button>
          </div>
        </div>
      </Card>

      {coverLetter ? (
        <div className="cover-grid">
          <Card title="Editor" subtitle="Ajusta el texto a tu voz antes de exportar." className="no-print">
            <TextArea
              className="cover-editor"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
          </Card>

          <div className="preview-stage print-root">
            <div className="paper">
              <div className="cover-letter">
                <div className="cover-letter__head">
                  <div className="cover-letter__name">{profile.contact.fullName || 'Tu Nombre'}</div>
                  {profile.contact.headline && (
                    <div style={{ fontStyle: 'italic', fontSize: 12, color: '#333' }}>
                      {profile.contact.headline}
                    </div>
                  )}
                  {contacts.length > 0 && (
                    <div className="cover-letter__contact">
                      {contacts.map((c, i) => (
                        <span key={i}>{c}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="cover-letter__body">{coverLetter}</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Card className="no-print">
          <EmptyState icon="✉️" title="Aún no hay carta de presentación">
            Pulsa <strong>“Generar carta”</strong> y la IA redactará una carta personalizada para{' '}
            {job.title ? <strong>{job.title}</strong> : 'el puesto'}
            {job.company ? (
              <>
                {' '}
                en <strong>{job.company}</strong>
              </>
            ) : null}
            , conectando tus logros con lo que pide la oferta. Podrás editarla y exportarla a PDF.
          </EmptyState>
        </Card>
      )}
    </div>
  )
}
