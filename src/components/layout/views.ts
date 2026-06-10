import type { IconName } from '@/components/ui/Icon'
import type { View, ViewMeta } from '@/types'

export interface ViewDef extends ViewMeta {
  icon: IconName
  title: string
}

export const VIEWS: ViewDef[] = [
  { id: 'job', step: 1, label: 'Oferta', title: 'Analizar oferta de trabajo', description: 'Texto, URL o imagen', icon: 'briefcase' },
  { id: 'profile', step: 2, label: 'Perfil', title: 'Tu perfil profesional', description: 'Experiencia y datos', icon: 'user' },
  { id: 'analyze', step: 3, label: 'Análisis', title: 'Análisis y recomendación', description: 'Plantilla y brechas', icon: 'target' },
  { id: 'build', step: 4, label: 'Optimizar', title: 'Optimizar y construir CV', description: 'IA y fórmula X-Y-Z', icon: 'sparkles' },
  { id: 'cover', step: 5, label: 'Carta', title: 'Carta de presentación', description: 'Generada con IA', icon: 'text' },
  { id: 'export', step: 6, label: 'Exportar', title: 'Vista previa y exportación', description: 'Imprimir / PDF', icon: 'download' },
]

export function viewDef(view: View): ViewDef {
  return VIEWS.find((v) => v.id === view) ?? VIEWS[0]
}

export function nextView(view: View): View | null {
  const idx = VIEWS.findIndex((v) => v.id === view)
  return idx >= 0 && idx < VIEWS.length - 1 ? VIEWS[idx + 1].id : null
}

export function prevView(view: View): View | null {
  const idx = VIEWS.findIndex((v) => v.id === view)
  return idx > 0 ? VIEWS[idx - 1].id : null
}
