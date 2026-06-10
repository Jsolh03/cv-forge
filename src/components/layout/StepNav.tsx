import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { nextView, prevView, viewDef } from './views'
import type { View } from '@/types'

export function StepNav() {
  const view = useAppStore((s) => s.view)
  const setView = useAppStore((s) => s.setView)

  const prev = prevView(view)
  const next = nextView(view)

  const go = (v: View | null) => {
    if (!v) return
    setView(v)
    document.querySelector('.content')?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="step-nav">
      {prev ? (
        <Button variant="ghost" icon={<Icon name="chevron-left" size={16} />} onClick={() => go(prev)}>
          {viewDef(prev).label}
        </Button>
      ) : (
        <span />
      )}
      {next && (
        <Button onClick={() => go(next)}>
          Continuar: {viewDef(next).label}
          <Icon name="chevron-right" size={16} />
        </Button>
      )}
    </div>
  )
}
