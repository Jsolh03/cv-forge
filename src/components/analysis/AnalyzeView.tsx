import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Tag } from '@/components/ui/Tag'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { buildGapAnalysis, buildRecommendation } from '@/services/aiGateway'
import { suggestFittingKeywords } from '@/services/enhance'
import type { AiStatus, GapAnalysis, TemplateKind } from '@/types'
import './analysis.css'

const TEMPLATE_INFO: Record<TemplateKind, { name: string; desc: string }> = {
  ats: {
    name: 'ATS · Parseable',
    desc: 'Una columna, sans-serif, sin gráficos. Máxima compatibilidad con sistemas de cribado automático.',
  },
  harvard: {
    name: 'Harvard · Clásico',
    desc: 'Serif elegante, jerarquía tradicional y foco en logros. Ideal para lectura humana directa.',
  },
}

export function AnalyzeView({ ai }: { ai: AiStatus }) {
  const job = useAppStore((s) => s.job)
  const profile = useAppStore((s) => s.profile)
  const template = useAppStore((s) => s.template)
  const setTemplate = useAppStore((s) => s.setTemplate)
  const recommendation = useAppStore((s) => s.recommendation)
  const gap = useAppStore((s) => s.gap)
  const setRecommendation = useAppStore((s) => s.setRecommendation)
  const setGap = useAppStore((s) => s.setGap)
  const setView = useAppStore((s) => s.setView)
  const pushToast = useAppStore((s) => s.pushToast)

  const [running, setRunning] = useState(false)

  const aiCtx = { available: ai.ollamaAvailable, model: ai.ollamaModel }
  const hasJob = job.rawText.trim().length > 20

  async function runAnalysis() {
    if (!hasJob) {
      pushToast('warning', 'Primero añade una oferta en el paso 1.')
      setView('job')
      return
    }
    setRunning(true)
    try {
      const [rec, gapResult] = await Promise.all([
        buildRecommendation(job, aiCtx),
        buildGapAnalysis(job, profile, aiCtx),
      ])
      setRecommendation(rec)
      setGap(gapResult)
      setTemplate(rec.template)
      pushToast(
        'success',
        rec.aiEnhanced || gapResult.aiEnhanced
          ? 'Análisis completado con IA local.'
          : 'Análisis heurístico completado.',
      )
    } catch {
      pushToast('error', 'Ocurrió un error durante el análisis.')
    } finally {
      setRunning(false)
    }
  }

  if (!recommendation || !gap) {
    return (
      <Card>
        {!hasJob ? (
          <EmptyState icon="🎯" title="Añade una oferta para analizar">
            Ve al paso 1 y pega la descripción del puesto. Después podré recomendarte la mejor
            plantilla y detectar brechas de palabras clave.
          </EmptyState>
        ) : (
          <div className="stack gap-4 center" style={{ padding: 'var(--sp-8)', textAlign: 'center' }}>
            <div className="dropzone__icon" style={{ margin: 0 }}>
              <Icon name="target" size={26} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 'var(--fs-lg)' }}>Listo para analizar</div>
              <p className="text-muted" style={{ maxWidth: 460, margin: '6px auto 0' }}>
                Compararé la oferta de <strong>{job.title || 'el puesto'}</strong> con tu perfil para
                recomendar la plantilla óptima y un análisis de brechas.
                {ai.ollamaAvailable
                  ? ` Se usará IA local (${ai.ollamaModel}).`
                  : ' Se usará el motor heurístico local (sin Ollama).'}
              </p>
            </div>
            <Button size="lg" loading={running} icon={<Icon name="sparkles" size={18} />} onClick={runAnalysis}>
              {running ? 'Analizando…' : 'Ejecutar análisis'}
            </Button>
          </div>
        )}
      </Card>
    )
  }

  return (
    <div className="stack gap-6">
      <div className="rec-banner">
        <div className="rec-banner__badge">{recommendation.template === 'ats' ? 'ATS' : 'Harvard'}</div>
        <div className="grow">
          <div className="row gap-2" style={{ marginBottom: 4 }}>
            <strong style={{ fontSize: 'var(--fs-md)' }}>Plantilla recomendada</strong>
            {recommendation.aiEnhanced && (
              <Tag variant="muted">
                <Icon name="cpu" size={12} /> IA local
              </Tag>
            )}
          </div>
          <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>
            {recommendation.rationale}
          </p>
        </div>
        <ProgressRing value={recommendation.score} label={`${recommendation.score}%`} size={84} />
      </div>

      <div className="analyze-grid">
        <Card title="Elige tu plantilla" subtitle="Puedes seguir la recomendación o cambiarla.">
          <div className="template-choice">
            {(['ats', 'harvard'] as TemplateKind[]).map((kind) => (
              <button
                key={kind}
                className={[
                  'template-card',
                  template === kind && 'template-card--active',
                  recommendation.template === kind && 'template-card--recommended',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setTemplate(kind)}
              >
                <div className="template-card__name">{TEMPLATE_INFO[kind].name}</div>
                <div className="template-card__desc">{TEMPLATE_INFO[kind].desc}</div>
              </button>
            ))}
          </div>

          <hr className="divider" />

          <div className="form-grid" style={{ gap: 'var(--sp-5)' }}>
            <div>
              <div className="row gap-2" style={{ marginBottom: 'var(--sp-2)', color: 'var(--info)' }}>
                <Icon name="cpu" size={15} />
                <strong style={{ fontSize: 'var(--fs-sm)' }}>Señales ATS</strong>
              </div>
              <div className="signal-list">
                {recommendation.atsSignals.map((s, i) => (
                  <div className="signal signal--ats" key={i}>
                    <Icon name="check" size={14} className="signal__icon" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="row gap-2" style={{ marginBottom: 'var(--sp-2)', color: 'var(--accent-violet)' }}>
                <Icon name="user" size={15} />
                <strong style={{ fontSize: 'var(--fs-sm)' }}>Señales Harvard</strong>
              </div>
              <div className="signal-list">
                {recommendation.harvardSignals.map((s, i) => (
                  <div className="signal signal--harvard" key={i}>
                    <Icon name="check" size={14} className="signal__icon" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="stack gap-6">
          <Card title="Análisis de brechas (Gap Analysis)" subtitle="Cobertura de palabras clave de la oferta.">
            <div className="row gap-6 wrap" style={{ alignItems: 'center' }}>
              <ProgressRing value={gap.coverage} size={100} />
              <div className="grow">
                <div className="stat-row">
                  <div className="stat">
                    <div className="stat__value" style={{ color: 'var(--success)' }}>
                      {gap.matched.length}
                    </div>
                    <div className="stat__label">Cubiertas</div>
                  </div>
                  <div className="stat">
                    <div className="stat__value" style={{ color: 'var(--danger)' }}>
                      {gap.missing.length}
                    </div>
                    <div className="stat__label">Faltantes</div>
                  </div>
                </div>
              </div>
            </div>

            {gap.matched.length > 0 && (
              <>
                <div className="field__label" style={{ margin: 'var(--sp-4) 0 var(--sp-2)' }}>
                  Presentes en tu CV
                </div>
                <div className="keyword-cloud">
                  {gap.matched.map((k) => (
                    <Tag key={k} variant="matched">
                      <Icon name="check" size={11} /> {k}
                    </Tag>
                  ))}
                </div>
              </>
            )}

            {gap.missing.length > 0 && <MissingKeywords gap={gap} ai={ai} />}
          </Card>

          <Card
            title="Recomendaciones"
            subtitle={gap.aiEnhanced ? 'Generadas con IA local.' : 'Generadas por el motor heurístico.'}
            padSm
          >
            <div className="stack gap-2">
              {gap.suggestions.map((s, i) => (
                <div className="suggestion" key={i}>
                  <span className="suggestion__num">{i + 1}</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card padSm>
        <div className="between wrap gap-3">
          <span className="text-muted" style={{ fontSize: 'var(--fs-sm)' }}>
            ¿Cambiaste la oferta o el perfil? Vuelve a ejecutar el análisis.
          </span>
          <div className="row gap-2">
            <Button variant="ghost" loading={running} icon={<Icon name="refresh" size={15} />} onClick={runAnalysis}>
              Re-analizar
            </Button>
            <Button icon={<Icon name="sparkles" size={16} />} onClick={() => setView('build')}>
              Optimizar viñetas
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

/* ---------- Keywords faltantes: seleccionar y añadir a habilidades ---------- */

function MissingKeywords({ gap, ai }: { gap: GapAnalysis; ai: AiStatus }) {
  const profile = useAppStore((s) => s.profile)
  const addSkill = useAppStore((s) => s.addSkill)
  const setGap = useAppStore((s) => s.setGap)
  const pushToast = useAppStore((s) => s.pushToast)

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [suggesting, setSuggesting] = useState(false)

  const toggle = (kw: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(kw)) next.delete(kw)
      else next.add(kw)
      return next
    })

  async function suggestWithAI() {
    setSuggesting(true)
    try {
      const { value, aiUsed } = await suggestFittingKeywords(gap.missing, profile, {
        available: ai.ollamaAvailable,
        model: ai.ollamaModel,
      })
      if (value.length === 0) {
        pushToast('info', 'La IA no encontró keywords faltantes que encajen claramente con tu perfil.')
      } else {
        setSelected(new Set(value))
        pushToast(
          'success',
          aiUsed
            ? `IA: ${value.length} keyword(s) que encajan con tu perfil pre-seleccionadas. Revísalas.`
            : `${value.length} keyword(s) relacionadas pre-seleccionadas. Revísalas.`,
        )
      }
    } catch {
      pushToast('error', 'No se pudieron sugerir keywords.')
    } finally {
      setSuggesting(false)
    }
  }

  function addSelected() {
    const existing = new Set(profile.skills.map((s) => s.name.toLowerCase()))
    const toAdd = [...selected].filter((k) => !existing.has(k.toLowerCase()))
    if (toAdd.length === 0) {
      pushToast('warning', 'Marca al menos una keyword que sí domines.')
      return
    }
    toAdd.forEach((k) => addSkill(k))
    // Actualiza el gap: esas keywords pasan a estar cubiertas.
    const added = new Set(toAdd.map((k) => k.toLowerCase()))
    const newMatched = [...gap.matched, ...toAdd]
    const newMissing = gap.missing.filter((m) => !added.has(m.toLowerCase()))
    const total = newMatched.length + newMissing.length || 1
    setGap({
      ...gap,
      matched: newMatched,
      missing: newMissing,
      coverage: Math.round((newMatched.length / total) * 100),
    })
    setSelected(new Set())
    pushToast('success', `${toAdd.length} habilidad(es) añadida(s) a tu perfil. Cobertura actualizada.`)
  }

  return (
    <>
      <div className="between" style={{ margin: 'var(--sp-4) 0 var(--sp-2)' }}>
        <span className="field__label" style={{ margin: 0 }}>
          Faltan en tu CV
        </span>
        <Button
          variant="subtle"
          size="sm"
          loading={suggesting}
          icon={<Icon name="wand" size={14} />}
          onClick={suggestWithAI}
        >
          Sugerir cuáles añadir
        </Button>
      </div>
      <p className="text-muted" style={{ fontSize: 'var(--fs-xs)', marginBottom: 'var(--sp-2)' }}>
        Marca las que <strong>sí domines</strong> (quizá se te olvidó ponerlas) y añádelas a tus
        habilidades. La IA puede pre-seleccionar las que encajan con tu perfil.
      </p>
      <div className="keyword-cloud">
        {gap.missing.map((k) => {
          const on = selected.has(k)
          return (
            <button
              key={k}
              type="button"
              className={`tag ${on ? 'tag--matched' : 'tag--missing'}`}
              style={{ cursor: 'pointer' }}
              onClick={() => toggle(k)}
              aria-pressed={on}
            >
              {on ? <Icon name="check" size={11} /> : <Icon name="plus" size={11} />} {k}
            </button>
          )
        })}
      </div>
      {selected.size > 0 && (
        <div className="row" style={{ marginTop: 'var(--sp-3)' }}>
          <Button size="sm" icon={<Icon name="check" size={14} />} onClick={addSelected}>
            Añadir {selected.size} a mis habilidades
          </Button>
        </div>
      )}
    </>
  )
}
