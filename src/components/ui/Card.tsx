import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '@/lib/classnames'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  actions?: ReactNode
  padSm?: boolean
}

export function Card({ title, subtitle, actions, padSm, className, children, ...rest }: CardProps) {
  return (
    <div className={cx('card', padSm && 'card--pad-sm', className)} {...rest}>
      {(title || actions) && (
        <div className="between" style={{ marginBottom: subtitle ? 0 : 'var(--sp-4)' }}>
          <div>
            {title && <div className="card__title">{title}</div>}
            {subtitle && <div className="card__sub">{subtitle}</div>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </div>
  )
}
