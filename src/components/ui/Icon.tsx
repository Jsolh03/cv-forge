/* Iconos SVG inline (stroke), ligeros y sin dependencias. */

export type IconName =
  | 'briefcase'
  | 'user'
  | 'sparkles'
  | 'layout'
  | 'download'
  | 'link'
  | 'image'
  | 'text'
  | 'check'
  | 'plus'
  | 'trash'
  | 'wand'
  | 'refresh'
  | 'chevron-right'
  | 'chevron-left'
  | 'cpu'
  | 'alert'
  | 'target'
  | 'print'

interface IconProps {
  name: IconName
  size?: number
  className?: string
}

const PATHS: Record<IconName, string> = {
  briefcase: 'M3 7h18v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7zM8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  sparkles: 'M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3zM5 16l.9 2.3L8 19l-2.1.7L5 22l-.9-2.3L2 19l2.1-.7L5 16z',
  layout: 'M3 4h18v16H3V4zM3 9h18M9 9v11',
  download: 'M12 3v12m0 0l-4-4m4 4l4-4M4 19h16',
  link: 'M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1',
  image: 'M3 5h18v14H3V5zM3 16l5-5 4 4 3-3 6 6M9 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
  text: 'M4 6h16M4 12h16M4 18h10',
  check: 'M5 13l4 4L19 7',
  plus: 'M12 5v14M5 12h14',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  wand: 'M15 4V2M15 10V8M11 6H9M21 6h-2M18 9l-1.5-1.5M18 3l-1.5 1.5M4 20l10-10',
  refresh: 'M21 12a9 9 0 1 1-2.6-6.4M21 3v6h-6',
  'chevron-right': 'M9 6l6 6-6 6',
  'chevron-left': 'M15 6l-6 6 6 6',
  cpu: 'M6 6h12v12H6V6zM9 9h6v6H9V9zM9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2',
  alert: 'M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
  target: 'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0',
  print: 'M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6v-8z',
}

export function Icon({ name, size = 18, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={PATHS[name]} />
    </svg>
  )
}
