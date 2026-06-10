import type { TemplateKind, UserProfile } from '@/types'
import { HarvardTemplate } from './HarvardTemplate'
import { ATSTemplate } from './ATSTemplate'

interface CVPreviewProps {
  profile: UserProfile
  template: TemplateKind
  zoom?: number
  printRoot?: boolean
}

/** Renderiza el "papel" A4 con la plantilla seleccionada. */
export function CVPreview({ profile, template, zoom = 1, printRoot = false }: CVPreviewProps) {
  return (
    <div className={printRoot ? 'preview-stage print-root' : 'preview-stage'}>
      <div
        className="paper preview-stage--zoom"
        style={zoom !== 1 ? { transform: `scale(${zoom})` } : undefined}
      >
        {template === 'harvard' ? (
          <HarvardTemplate profile={profile} />
        ) : (
          <ATSTemplate profile={profile} />
        )}
      </div>
    </div>
  )
}
