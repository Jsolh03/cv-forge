import type { ReactNode } from 'react'
import { cx } from '@/lib/classnames'

type TagVariant = 'default' | 'matched' | 'missing' | 'muted'

interface TagProps {
  variant?: TagVariant
  onRemove?: () => void
  children: ReactNode
}

export function Tag({ variant = 'default', onRemove, children }: TagProps) {
  return (
    <span className={cx('tag', variant !== 'default' && `tag--${variant}`)}>
      {children}
      {onRemove && (
        <button type="button" className="tag__x" onClick={onRemove} aria-label="Quitar">
          ✕
        </button>
      )}
    </span>
  )
}
