import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/EmptyState'
import { optimizeBullet } from '@/services/optimizer'
import { summaryPrompt } from '@/services/prompts'
import { generate } from '@/services/ollama'
import { SYSTEM_CV_EXPERT } from '@/services/prompts'
import { sanitizeLine } from '@/services/optimizer'
import type { AiStatus } from '@/types'
import './ai.css'

type SuggestionMap = Record<string, string>

export function BuildView({ ai }: { ai: AiStatus }) {
  const profile = useAppStore((s) => s.profile)
  const job = useAppStore((s) => s.job)
  const setBullets = useAppStore((s) => s.setExperienceBullets)
  const setSummary = useAppStore((s) => s.setSummary)
  const setView = useAppStore((s) => s.setView)
  const pushToast = useAppStore((s) => s.pushToast)

  const [suggestions, setSuggestions] = useState<SuggestionMap>({})
  const [loadingKey, setLoadingKey] = useState<string | null>(null)
  const [bulkRunning, setBulkRunning] = useState(false)
  const [summaryBusy, setSummaryBusy] = useState(false)

  const aiCtx = { available: ai.ollamaAvailable, model: ai.ollamaModel }
  const key = (expId: string, i: number) => `${expId}:${i}`

  const hasExperience = profile.experience.length > 0

  async function optimizeOne(expId: string, index: number, bullet: string) {
    if (!bullet.trim()) {
      pushToast('warning', 'Esta viñeta está vacía.')
      return
    }
    setLoadingKey(key(expId, index))
    try {
      const result = await optimizeBullet(bullet, job.keywords, aiCtx)
      setSuggestions((prev) => ({ ...prev, [key(expId, index)]: result.text }))
      if (!result.aiUsed && ai.ollamaAvailable) {
        pushToast('info', 'Ollama no respondió; se usó la reescritura heurística.')
      }
    } finally {
      setLoadingKey(null)
    }
  }

  function applyOne(expId: string, index: number) {
    const text = suggestions[key(expId, index)]
    if (text == null) return
    const exp = profile.experience.find((e) => e.id === expId)
    if (!exp) return
    setBullets(
      expId,
      exp.bullets.map((b, i) => (i === index ? text : b)),
    )
    setSuggestions((prev) => {
      const next = { ...prev }
      delete next[key(expId, index)]
      return next
    })
    pushToast('success', 'Viñeta actualizada.')
  }

  async function optimizeAll() {
    setBulkRunning(true)
    const next: SuggestionMap = {}
    try {
      for (const exp of profile.experience) {
        for (let i = 0; i < exp.bullets.length; i++) {
          const bullet = exp.bullets[i]
          if (!bullet.trim()) continue
          const result = await optimizeBullet(bullet, job.keywords, aiCtx)
          next[key(exp.id, i)] = result.text
        }
      }
      setSuggestions((prev) => ({ ...prev, ...next }))
      const count = Object.keys(next).length
      pushToast('success', `${count} viñeta(s) optimizada(s). Revisa y aplica las que prefieras.`)
    } catch {
      pushToast('error', 'Error durante la optimización masiva.')
    } finally {
      setBulkRunning(false)
    }
  }

  function applyAll() {
    let applied = 0
    for (const exp of profile.experience) {
      const updated = exp.bullets.map((b, i) => {
        const sug = suggestions[key(exp.id, i)]
        if (sug != null) {
          applied++
          return sug
        }
        return b
      })
      if (updated.some((b, i) => b !== exp.bullets[i])) setBullets(exp.id, updated)
    }
    setSuggestions({})
    pushToast('success', `${applied} viñeta(s) aplicada(s).`)
  }

  async function optimizeSummary() {
    if (!profile.summary.trim()) {
      pushToast('warning', 'Escribe primero un resumen en el paso 2.')
      return
    }
    setSummaryBusy(true)
    try {
      if (ai.ollamaAvailable) {
        const out = await generate({
          model: ai.ollamaModel,
          system: SYSTEM_CV_EXPERT,
          prompt: summaryPrompt(profile.summary, job),
          temperature: 0.5,
        })
        const clean = out
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean)
          .join(' ')
        const text = sanitizeLine(clean) || clean
        if (text.length > 20) {
          setSummary(text)
          pushToast('success', 'Resumen optimizado con IA local.')
          return
        }
      }
      pushToast('info', 'IA local no disponible: ajusta el resumen manualmente o activa Ollama.')
    } catch {
      pushToast('error', 'No se pudo optimizar el resumen.')
    } finally {
      setSummaryBusy(false)
    }
  }

  const pendingCount = Object.keys(suggestions).length

  return (
    <div className="build-grid">
      <div className="stack gap-6">
        <Card padSm>
          <div className="between wrap gap-3">
            <div className="row gap-2">
              <span className={`status-dot ${ai.ollamaAvailable ? 'status-dot--on' : 'status-dot--off'}`} />
              <span style={{ fontSize: 'var(--fs-sm)' }}>
                {ai.ollamaAvailable
                  ? `Optimización con IA local (${ai.ollamaModel})`
                  : 'Optimización heurística local (sin Ollama)'}
              </span>
            </div>
            <div className="row gap-2">
              {pendingCount > 0 && (
                <Button variant="ghost" size="sm" icon={<Icon name="check" size={15} />} onClick={applyAll}>
                  Aplicar todo ({pendingCount})
                </Button>
              )}
              <Button
                size="sm"
                loading={bulkRunning}
                icon={<Icon name="wand" size={15} />}
                onClick={optimizeAll}
                disabled={!hasExperience}
              >
                Optimizar todo
              </Button>
            </div>
          </div>
        </Card>

        <Card title="Resumen profesional" padSm
          actions={
            <Button
              variant="ghost"
              size="sm"
              loading={summaryBusy}
              icon={<Icon name="wand" size={15} />}
              onClick={optimizeSummary}
            >
              Optimizar
            </Button>
          }
        >
          <p style={{ fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-snug)' }}>
            {profile.summary || <span className="text-muted">Sin resumen. Añádelo en el paso 2.</span>}
          </p>
        </Card>

        {!hasExperience ? (
          <Card>
            <EmptyState icon="✨" title="Sin experiencia para optimizar">
              Añade puestos con viñetas en el paso 2 para reescribirlos con la fórmula X-Y-Z.
            </EmptyState>
          </Card>
        ) : (
          <Card title="Viñetas de experiencia" subtitle="Reescritura con la fórmula X-Y-Z de Google.">
            {profile.experience.map((exp) => (
              <div className="exp-group" key={exp.id}>
                <div className="exp-group__head">
                  <Icon name="briefcase" size={15} />
                  {exp.role || 'Puesto'}
                  <span className="exp-group__badge">· {exp.company || 'Empresa'}</span>
                </div>
                {exp.bullets.map((bullet, i) => {
                  const k = key(exp.id, i)
                  const suggestion = suggestions[k]
                  return (
                    <div className="opt-bullet" key={k}>
                      <div className="between gap-3">
                        <div className="opt-bullet__text grow">
                          {bullet.trim() || <span className="text-muted">Viñeta vacía</span>}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          loading={loadingKey === k}
                          icon={<Icon name="wand" size={14} />}
                          onClick={() => optimizeOne(exp.id, i, bullet)}
                          disabled={!bullet.trim()}
                        >
                          X-Y-Z
                        </Button>
                      </div>
                      {suggestion != null && (
                        <div className="opt-suggestion">
                          <div className="opt-suggestion__label">
                            <Icon name="sparkles" size={12} /> Versión optimizada
                          </div>
                          <div className="opt-suggestion__text">{suggestion}</div>
                          <div className="row gap-2" style={{ marginTop: 'var(--sp-3)' }}>
                            <Button size="sm" icon={<Icon name="check" size={14} />} onClick={() => applyOne(exp.id, i)}>
                              Aplicar
                            </Button>
                            <Button
                              variant="subtle"
                              size="sm"
                              onClick={() =>
                                setSuggestions((prev) => {
                                  const next = { ...prev }
                                  delete next[k]
                                  return next
                                })
                              }
                            >
                              Descartar
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </Card>
        )}
      </div>

      <div className="stack gap-6">
        <Card title="Fórmula X-Y-Z" subtitle="El estándar de Google para viñetas de impacto." padSm>
          <div className="xyz-legend">
            <div className="xyz-legend__item">
              <span className="xyz-letter">X</span>
              <span>
                <strong>Logré [X]</strong> — el resultado o logro concreto.
              </span>
            </div>
            <div className="xyz-legend__item">
              <span className="xyz-letter">Y</span>
              <span>
                <strong>medido por [Y]</strong> — la métrica que lo cuantifica.
              </span>
            </div>
            <div className="xyz-legend__item">
              <span className="xyz-letter">Z</span>
              <span>
                <strong>haciendo [Z]</strong> — la acción o tecnología empleada.
              </span>
            </div>
          </div>
          <hr className="divider" />
          <p className="text-muted" style={{ fontSize: 'var(--fs-xs)' }}>
            Ejemplo: “Reduje el tiempo de carga un <strong>42%</strong> (Y) migrando a SSR con Vite
            (Z), mejorando la retención de usuarios (X)”.
          </p>
        </Card>

        <Card title="Palabras clave objetivo" padSm subtitle="De la oferta; intégralas con naturalidad.">
          {job.keywords.length > 0 ? (
            <div className="keyword-cloud">
              {job.keywords.slice(0, 16).map((k) => (
                <span className="tag" key={k}>
                  {k}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-muted" style={{ fontSize: 'var(--fs-sm)' }}>
              Analiza una oferta en el paso 1 para ver aquí sus palabras clave.
            </p>
          )}
          <hr className="divider" />
          <Button block icon={<Icon name="download" size={16} />} onClick={() => setView('export')}>
            Ir a vista previa y exportar
          </Button>
        </Card>
      </div>
    </div>
  )
}
