import { useAppStore } from '@/store/useAppStore'
import { cx } from '@/lib/classnames'
import { Icon } from '@/components/ui/Icon'
import type { AiStatus } from '@/types'
import { VIEWS } from './views'

interface SidebarProps {
  ai: AiStatus
  onOpenSettings: () => void
}

export function Sidebar({ ai, onOpenSettings }: SidebarProps) {
  const view = useAppStore((s) => s.view)
  const setView = useAppStore((s) => s.setView)
  const completed = useCompletion()

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand__logo">CV</div>
        <div>
          <div className="brand__name">CV Forge</div>
          <div className="brand__tag">Optimizador con IA local</div>
        </div>
      </div>

      <nav className="nav" aria-label="Pasos">
        <div className="nav__heading">Flujo de trabajo</div>
        {VIEWS.map((v) => (
          <button
            key={v.id}
            className={cx(
              'nav-item',
              view === v.id && 'nav-item--active',
              completed[v.id] && view !== v.id && 'nav-item--done',
            )}
            onClick={() => setView(v.id)}
            aria-current={view === v.id ? 'page' : undefined}
          >
            <span className="nav-item__num">
              {completed[v.id] && view !== v.id ? <Icon name="check" size={14} /> : v.step}
            </span>
            <span className="nav-item__body">
              <span className="nav-item__label">{v.label}</span>
              <span className="nav-item__desc">{v.description}</span>
            </span>
          </button>
        ))}
      </nav>

      <div className="sidebar__footer">
        <button className="ai-pill" onClick={onOpenSettings} title="Configurar IA local">
          <span
            className={cx(
              'status-dot',
              ai.ollamaAvailable ? 'status-dot--on' : 'status-dot--off',
              ai.checking && 'status-dot--pulse',
            )}
          />
          <span className="ai-pill__body">
            <span className="ai-pill__title">
              {ai.checking ? 'Comprobando IA…' : ai.ollamaAvailable ? 'Ollama conectado' : 'Modo heurístico'}
            </span>
            <span className="ai-pill__model">
              {ai.ollamaAvailable ? ai.ollamaModel || 'sin modelo' : 'IA local no detectada'}
            </span>
          </span>
          <Icon name="cpu" size={16} />
        </button>
      </div>
    </aside>
  )
}

/** Marca como completado cada paso según el estado real del store. */
function useCompletion(): Record<string, boolean> {
  const job = useAppStore((s) => s.job)
  const profile = useAppStore((s) => s.profile)
  const recommendation = useAppStore((s) => s.recommendation)
  const coverLetter = useAppStore((s) => s.coverLetter)

  return {
    job: job.rawText.trim().length > 40,
    profile: profile.contact.fullName.trim().length > 0 && profile.experience.length > 0,
    analyze: recommendation !== null,
    build: profile.experience.some((e) => e.bullets.some((b) => b.trim().length > 0)),
    cover: coverLetter.trim().length > 0,
    export: false,
  }
}
