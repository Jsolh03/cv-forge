interface ProgressRingProps {
  value: number // 0..100
  size?: number
  stroke?: number
  label?: string
}

/** Anillo de progreso SVG con gradiente de marca. */
export function ProgressRing({ value, size = 92, stroke = 9, label }: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value))
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (clamped / 100) * circumference
  const color = clamped >= 75 ? 'var(--success)' : clamped >= 45 ? 'var(--warning)' : 'var(--danger)'

  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(148,163,199,0.16)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 600ms var(--ease-out), stroke 300ms' }}
        />
      </svg>
      <span className="ring-wrap__label">{label ?? `${Math.round(clamped)}%`}</span>
    </div>
  )
}
