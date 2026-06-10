import { useMemo, useRef, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field, Input, TextArea } from '@/components/ui/Field'
import { Tag } from '@/components/ui/Tag'
import { Icon, type IconName } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { ImageDropzone } from './ImageDropzone'
import { extractKeywords } from '@/services/keywords'
import { CorsBlockedError, parseText, parseUrl, parseUrlViaProxy } from '@/services/jobParser'
import { isUrl } from '@/lib/validation'
import type { AiStatus, JobSource } from '@/types'
import './job.css'

interface JobViewProps {
  ai: AiStatus
}

const TABS: Array<{ id: JobSource; label: string; icon: IconName }> = [
  { id: 'text', label: 'Texto', icon: 'text' },
  { id: 'url', label: 'URL', icon: 'link' },
  { id: 'image', label: 'Imagen', icon: 'image' },
]

export function JobView({ ai }: JobViewProps) {
  const job = useAppStore((s) => s.job)
  const setJob = useAppStore((s) => s.setJob)
  const resetJob = useAppStore((s) => s.resetJob)
  const pushToast = useAppStore((s) => s.pushToast)

  const [tab, setTab] = useState<JobSource>(job.source || 'text')
  const [draft, setDraft] = useState(job.rawText)
  const [url, setUrl] = useState(job.url)
  const [fetching, setFetching] = useState(false)
  const [proxyBusy, setProxyBusy] = useState(false)
  const [corsBlocked, setCorsBlocked] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function goPasteManually() {
    setCorsBlocked(false)
    setTab('text')
    // Espera al render de la pestaña Texto antes de enfocar.
    setTimeout(() => textareaRef.current?.focus(), 50)
  }

  const wordCount = useMemo(
    () => (job.rawText.trim() ? job.rawText.trim().split(/\s+/).length : 0),
    [job.rawText],
  )

  function applyText(text: string, source: JobSource) {
    const parsed = parseText(text)
    const keywords = extractKeywords(parsed.text)
    setJob({
      source,
      rawText: parsed.text,
      title: parsed.title || job.title,
      company: parsed.company || job.company,
      keywords,
    })
    pushToast('success', `Oferta analizada · ${keywords.length} palabras clave detectadas`)
  }

  function handleAnalyzeText() {
    if (draft.trim().length < 20) {
      pushToast('warning', 'Pega una descripción más completa de la oferta.')
      return
    }
    applyText(draft, 'text')
  }

  async function handleFetchUrl() {
    if (!isUrl(url)) {
      pushToast('error', 'Introduce una URL válida (https://…).')
      return
    }
    setFetching(true)
    setCorsBlocked(false)
    setJob({ url, source: 'url' })
    try {
      const parsed = await parseUrl(url)
      setDraft(parsed.text)
      applyText(parsed.text, 'url')
    } catch (err) {
      // CORS o fallo de red: no cambiamos de pestaña; ofrecemos opciones in situ.
      if (err instanceof CorsBlockedError) {
        setCorsBlocked(true)
        pushToast('warning', 'El navegador bloqueó la lectura directa (CORS). Tienes dos alternativas abajo.')
      } else {
        pushToast('error', err instanceof Error ? err.message : 'No se pudo leer la URL.')
      }
    } finally {
      setFetching(false)
    }
  }

  async function handleProxyRetry() {
    if (!isUrl(url)) {
      pushToast('error', 'Introduce una URL válida (https://…).')
      return
    }
    const ok = window.confirm(
      'Aviso de privacidad:\n\nLa lectura vía proxy enruta la oferta por un servicio externo (allorigins.win), ' +
        'así que el contenido de ESA petición sale de tu equipo. El resto de la app sigue siendo 100% local.\n\n' +
        '¿Continuar?',
    )
    if (!ok) return
    setProxyBusy(true)
    try {
      const parsed = await parseUrlViaProxy(url)
      setDraft(parsed.text)
      applyText(parsed.text, 'url')
      setCorsBlocked(false)
    } catch (err) {
      pushToast('error', err instanceof Error ? err.message : 'El proxy no pudo leer la oferta.')
    } finally {
      setProxyBusy(false)
    }
  }

  return (
    <div className="job-grid">
      <div className="stack gap-6">
        <Card
          title="Fuente de la oferta"
          subtitle="Pega el texto, importa una URL o sube una captura de pantalla."
          actions={
            <div className="segmented">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  className={`segmented__item ${tab === t.id ? 'segmented__item--active' : ''}`}
                  onClick={() => setTab(t.id)}
                >
                  <Icon name={t.icon} size={14} />
                  {t.label}
                </button>
              ))}
            </div>
          }
        >
          {tab === 'text' && (
            <div className="stack gap-4">
              <Field
                label="Descripción del puesto"
                hint="Copia y pega la oferta completa para un mejor análisis de palabras clave."
              >
                <TextArea
                  ref={textareaRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Ej.: Buscamos un Ingeniero Frontend Senior con experiencia en React, TypeScript y diseño de sistemas escalables…"
                  style={{ minHeight: 240 }}
                />
              </Field>
              <div className="between">
                <span className="text-muted" style={{ fontSize: 'var(--fs-xs)' }}>
                  {draft.trim() ? `${draft.trim().split(/\s+/).length} palabras` : 'Sin texto'}
                </span>
                <Button icon={<Icon name="sparkles" size={16} />} onClick={handleAnalyzeText}>
                  Analizar oferta
                </Button>
              </div>
            </div>
          )}

          {tab === 'url' && (
            <div className="stack gap-4">
              <Field
                label="URL de la oferta"
                hint="Se intenta leer localmente. Si el portal lo bloquea (CORS), te ofreceré un proxy opcional o pegar el texto."
              >
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://empresa.com/empleos/frontend-senior"
                  onKeyDown={(e) => e.key === 'Enter' && void handleFetchUrl()}
                />
              </Field>
              <div className="between">
                <span className="text-muted" style={{ fontSize: 'var(--fs-xs)' }}>
                  Lectura y parseo locales en tu navegador
                </span>
                <Button
                  icon={fetching ? undefined : <Icon name="link" size={16} />}
                  loading={fetching}
                  onClick={() => void handleFetchUrl()}
                >
                  {fetching ? 'Leyendo…' : 'Importar y analizar'}
                </Button>
              </div>

              {corsBlocked && (
                <div className="cors-panel">
                  <div className="row gap-2" style={{ fontWeight: 700, color: 'var(--warning)' }}>
                    <Icon name="alert" size={16} />
                    El navegador bloqueó la lectura directa (CORS)
                  </div>
                  <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-snug)' }}>
                    Es una restricción de seguridad del navegador, no un fallo de la app. Elige cómo continuar:
                  </p>
                  <div className="row gap-2 wrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Icon name="text" size={15} />}
                      onClick={goPasteManually}
                    >
                      Pegar el texto manualmente
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={proxyBusy}
                      icon={proxyBusy ? undefined : <Icon name="refresh" size={15} />}
                      onClick={() => void handleProxyRetry()}
                    >
                      {proxyBusy ? 'Leyendo vía proxy…' : 'Reintentar vía proxy público'}
                    </Button>
                  </div>
                  <p className="text-muted" style={{ fontSize: 'var(--fs-xs)' }}>
                    El proxy enruta esta oferta por un servicio externo (sale de tu equipo solo esta petición).
                    Para portales con login o mucho JavaScript, lo más fiable es pegar el texto o subir una captura.
                  </p>
                </div>
              )}
            </div>
          )}

          {tab === 'image' && (
            <ImageDropzone
              onText={(text) => {
                setDraft(text)
                applyText(text, 'image')
              }}
              onError={(msg) => pushToast('error', msg)}
            />
          )}
        </Card>

        {job.rawText && (
          <Card title="Detalles detectados" padSm>
            <div className="stack gap-4" style={{ marginTop: 'var(--sp-2)' }}>
              <div className="row gap-4 wrap">
                <Field label="Puesto detectado">
                  <Input
                    value={job.title}
                    onChange={(e) => setJob({ title: e.target.value })}
                    placeholder="Título del puesto"
                  />
                </Field>
                <Field label="Empresa">
                  <Input
                    value={job.company}
                    onChange={(e) => setJob({ company: e.target.value })}
                    placeholder="Nombre de la empresa"
                  />
                </Field>
              </div>
              <details>
                <summary
                  style={{ cursor: 'pointer', fontSize: 'var(--fs-sm)', color: 'var(--text-2)', fontWeight: 600 }}
                >
                  Ver texto procesado ({job.rawText.length} caracteres)
                </summary>
                <p
                  className="text-muted"
                  style={{
                    marginTop: 'var(--sp-2)',
                    fontSize: 'var(--fs-sm)',
                    whiteSpace: 'pre-wrap',
                    maxHeight: 200,
                    overflowY: 'auto',
                    lineHeight: 'var(--lh-snug)',
                  }}
                >
                  {job.rawText}
                </p>
              </details>
            </div>
          </Card>
        )}
      </div>

      <div className="stack gap-6">
        <Card title="Resumen del análisis" padSm>
          {job.rawText ? (
            <div className="stack gap-4">
              <div className="stat-row">
                <div className="stat">
                  <div className="stat__value gradient-text">{job.keywords.length}</div>
                  <div className="stat__label">Palabras clave</div>
                </div>
                <div className="stat">
                  <div className="stat__value gradient-text">{wordCount}</div>
                  <div className="stat__label">Palabras totales</div>
                </div>
              </div>
              <div className="row gap-2" style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-3)' }}>
                <span className={`status-dot ${ai.ollamaAvailable ? 'status-dot--on' : 'status-dot--off'}`} />
                {ai.ollamaAvailable
                  ? `IA local activa (${ai.ollamaModel}) para enriquecer el análisis`
                  : 'Análisis heurístico local (Ollama no detectado)'}
              </div>
            </div>
          ) : (
            <EmptyState icon="🎯" title="Aún no hay oferta">
              Añade una oferta para extraer automáticamente sus palabras clave.
            </EmptyState>
          )}
        </Card>

        {job.keywords.length > 0 && (
          <Card
            title="Palabras clave"
            subtitle="Detectadas y ponderadas por relevancia técnica."
            padSm
            actions={
              <Button variant="subtle" size="sm" icon={<Icon name="trash" size={14} />} onClick={resetJob}>
                Limpiar
              </Button>
            }
          >
            <div className="keyword-cloud">
              {job.keywords.map((kw) => (
                <Tag key={kw}>{kw}</Tag>
              ))}
            </div>
          </Card>
        )}

        {fetching && (
          <Card padSm>
            <div className="row gap-3">
              <Spinner brand />
              <span className="text-secondary">Leyendo la oferta desde la URL…</span>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
