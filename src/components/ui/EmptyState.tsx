import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: string
  title: string
  children?: ReactNode
}

export function EmptyState({ icon = '✨', title, children }: EmptyStateProps) {
  return (
    <div className="empty">
      <div className="empty__icon">{icon}</div>
      <div className="empty__title">{title}</div>
      {children && <div style={{ fontSize: 'var(--fs-sm)' }}>{children}</div>}
    </div>
  )
}
