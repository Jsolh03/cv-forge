import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { TextArea } from '@/components/ui/Field'

interface BulletsEditorProps {
  bullets: string[]
  onChange: (bullets: string[]) => void
}

/** Editor de viñetas de logros: añadir, editar y eliminar. */
export function BulletsEditor({ bullets, onChange }: BulletsEditorProps) {
  const update = (i: number, value: string) => {
    onChange(bullets.map((b, idx) => (idx === i ? value : b)))
  }
  const remove = (i: number) => {
    const next = bullets.filter((_, idx) => idx !== i)
    onChange(next.length ? next : [''])
  }
  const add = () => onChange([...bullets, ''])

  return (
    <div className="stack">
      <label className="field__label" style={{ marginBottom: 'var(--sp-2)' }}>
        Logros / responsabilidades
      </label>
      {bullets.map((bullet, i) => (
        <div className="bullet-row" key={i}>
          <span className="bullet-row__marker" />
          <TextArea
            value={bullet}
            onChange={(e) => update(i, e.target.value)}
            placeholder="Ej.: Reduje el tiempo de carga un 42% migrando a SSR, mejorando la retención en 12%."
            style={{ minHeight: 60 }}
          />
          <Button
            variant="subtle"
            size="icon"
            onClick={() => remove(i)}
            aria-label="Eliminar viñeta"
            title="Eliminar"
          >
            <Icon name="trash" size={15} />
          </Button>
        </div>
      ))}
      <Button variant="ghost" size="sm" icon={<Icon name="plus" size={15} />} onClick={add}>
        Añadir logro
      </Button>
    </div>
  )
}
