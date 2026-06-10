import { cx } from '@/lib/classnames'

interface SpinnerProps {
  brand?: boolean
  size?: 'sm' | 'lg'
}

export function Spinner({ brand = false, size = 'sm' }: SpinnerProps) {
  return (
    <span
      className={cx('spinner', brand && 'spinner--brand', size === 'lg' && 'spinner--lg')}
      role="status"
      aria-label="Cargando"
    />
  )
}
