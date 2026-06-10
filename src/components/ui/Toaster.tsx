import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import type { Toast } from '@/types'
import './toaster.css'

const ICONS: Record<Toast['kind'], string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
}

export function Toaster() {
  const toasts = useAppStore((s) => s.toasts)
  return (
    <div className="toaster" role="region" aria-label="Notificaciones">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  )
}

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useAppStore((s) => s.dismissToast)

  useEffect(() => {
    const timer = setTimeout(() => dismiss(toast.id), 4200)
    return () => clearTimeout(timer)
  }, [toast.id, dismiss])

  return (
    <div className={`toast toast--${toast.kind}`} role="status">
      <span className="toast__icon">{ICONS[toast.kind]}</span>
      <span className="toast__msg">{toast.message}</span>
      <button className="toast__close" onClick={() => dismiss(toast.id)} aria-label="Cerrar">
        ✕
      </button>
    </div>
  )
}
