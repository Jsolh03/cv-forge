import { useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field, Input, TextArea, Select } from '@/components/ui/Field'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/EmptyState'
import { BulletsEditor } from './BulletsEditor'
import { computeCompleteness } from './completeness'
import { enhanceSummary } from '@/services/enhance'
import type { AiStatus, SkillLevel } from '@/types'
import { useState } from 'react'
import './cv.css'

const SKILL_LEVELS: Array<{ value: SkillLevel; label: string }> = [
  { value: 'basico', label: 'Básico' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'avanzado', label: 'Avanzado' },
  { value: 'experto', label: 'Experto' },
]

export function ProfileView({ ai }: { ai: AiStatus }) {
  const profile = useAppStore((s) => s.profile)
  const completeness = useMemo(() => computeCompleteness(profile), [profile])

  return (
    <div className="stack gap-6">
      <CompletenessCard percent={completeness} />
      <ContactSection />
      <SummarySection ai={ai} />
      <ExperienceSection />
      <EducationSection />
      <SkillsSection />
      <ExtrasSection />
    </div>
  )
}

/* ---------- Completeness ---------- */

function CompletenessCard({ percent }: { percent: number }) {
  const loadSample = useAppStore((s) => s.loadSampleProfile)
  const resetAll = useAppStore((s) => s.resetAll)
  const pushToast = useAppStore((s) => s.pushToast)

  return (
    <Card padSm>
      <div className="between wrap gap-4">
        <div className="grow" style={{ minWidth: 220 }}>
          <div className="row gap-2" style={{ marginBottom: 'var(--sp-2)' }}>
            <Icon name="user" size={16} />
            <strong>Completitud del perfil</strong>
            <span className="gradient-text" style={{ fontWeight: 800 }}>
              {percent}%
            </span>
          </div>
          <div className="completeness">
            <div className="completeness__bar">
              <div className="completeness__fill" style={{ width: `${percent}%` }} />
            </div>
          </div>
        </div>
        <div className="row gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<Icon name="sparkles" size={15} />}
            onClick={() => {
              loadSample()
              pushToast('info', 'Perfil de ejemplo cargado. Edítalo con tus datos.')
            }}
          >
            Cargar ejemplo
          </Button>
          <Button
            variant="subtle"
            size="sm"
            icon={<Icon name="trash" size={15} />}
            onClick={() => {
              if (confirm('¿Vaciar todo el perfil y la oferta? Esta acción no se puede deshacer.')) {
                resetAll()
                pushToast('warning', 'Datos restablecidos.')
              }
            }}
          >
            Vaciar
          </Button>
        </div>
      </div>
    </Card>
  )
}

/* ---------- Contacto ---------- */

function ContactSection() {
  const contact = useAppStore((s) => s.profile.contact)
  const update = useAppStore((s) => s.updateContact)

  return (
    <Card title="Datos de contacto" subtitle="Información de cabecera de tu CV.">
      <div className="form-grid">
        <Field label="Nombre completo" required>
          <Input value={contact.fullName} onChange={(e) => update({ fullName: e.target.value })} placeholder="Alex Rivera" />
        </Field>
        <Field label="Titular profesional" hint="Aparece bajo tu nombre.">
          <Input value={contact.headline} onChange={(e) => update({ headline: e.target.value })} placeholder="Ingeniero de Software Senior" />
        </Field>
        <Field label="Email">
          <Input type="email" value={contact.email} onChange={(e) => update({ email: e.target.value })} placeholder="alex@email.com" />
        </Field>
        <Field label="Teléfono">
          <Input value={contact.phone} onChange={(e) => update({ phone: e.target.value })} placeholder="+34 600 000 000" />
        </Field>
        <Field label="Ubicación">
          <Input value={contact.location} onChange={(e) => update({ location: e.target.value })} placeholder="Madrid, España" />
        </Field>
        <Field label="Sitio web">
          <Input value={contact.website} onChange={(e) => update({ website: e.target.value })} placeholder="alexrivera.dev" />
        </Field>
        <Field label="LinkedIn">
          <Input value={contact.linkedin} onChange={(e) => update({ linkedin: e.target.value })} placeholder="linkedin.com/in/alexrivera" />
        </Field>
        <Field label="GitHub">
          <Input value={contact.github} onChange={(e) => update({ github: e.target.value })} placeholder="github.com/alexrivera" />
        </Field>
      </div>
    </Card>
  )
}

/* ---------- Resumen ---------- */

function SummarySection({ ai }: { ai: AiStatus }) {
  const summary = useAppStore((s) => s.profile.summary)
  const setSummary = useAppStore((s) => s.setSummary)
  const job = useAppStore((s) => s.job)
  const pushToast = useAppStore((s) => s.pushToast)
  const [busy, setBusy] = useState(false)

  async function embellish() {
    if (!summary.trim()) {
      pushToast('warning', 'Escribe primero un borrador del resumen para embellecerlo.')
      return
    }
    setBusy(true)
    try {
      const { value, aiUsed } = await enhanceSummary(summary, job, { available: ai.ollamaAvailable, model: ai.ollamaModel })
      setSummary(value)
      pushToast('success', aiUsed ? 'Resumen embellecido con IA local.' : 'Resumen pulido (motor local).')
    } catch {
      pushToast('error', 'No se pudo embellecer el resumen.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card
      title="Resumen profesional"
      subtitle="2-3 frases que sinteticen tu propuesta de valor."
      actions={
        <Button
          variant="ghost"
          size="sm"
          loading={busy}
          icon={<Icon name="wand" size={15} />}
          onClick={embellish}
        >
          Embellecer con IA
        </Button>
      }
    >
      <Field hint={`${summary.length} caracteres · ideal 250-450${job.title ? ` · alineado a "${job.title}"` : ''}`}>
        <TextArea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Escribe un borrador y pulsa “Embellecer con IA”. Ej.: Ingeniero de software con 6 años construyendo aplicaciones web escalables…"
          style={{ minHeight: 110 }}
        />
      </Field>
    </Card>
  )
}

/* ---------- Experiencia ---------- */

function ExperienceSection() {
  const experience = useAppStore((s) => s.profile.experience)
  const add = useAppStore((s) => s.addExperience)
  const update = useAppStore((s) => s.updateExperience)
  const remove = useAppStore((s) => s.removeExperience)
  const setBullets = useAppStore((s) => s.setExperienceBullets)

  return (
    <Card
      title="Experiencia profesional"
      subtitle="Lo más importante: ordena de más reciente a más antiguo."
      actions={
        <Button size="sm" icon={<Icon name="plus" size={15} />} onClick={add}>
          Añadir
        </Button>
      }
    >
      {experience.length === 0 ? (
        <EmptyState icon="💼" title="Sin experiencia añadida">
          Añade tu primer puesto para empezar a construir el CV.
        </EmptyState>
      ) : (
        <div className="stack gap-4">
          {experience.map((exp, i) => (
            <div className="item-card" key={exp.id}>
              <div className="item-card__head">
                <span className="item-card__index">
                  <span className="item-card__dot">{i + 1}</span>
                  {exp.role || 'Nuevo puesto'}
                </span>
                <Button variant="subtle" size="icon" onClick={() => remove(exp.id)} aria-label="Eliminar">
                  <Icon name="trash" size={15} />
                </Button>
              </div>
              <div className="form-grid">
                <Field label="Puesto" required>
                  <Input value={exp.role} onChange={(e) => update(exp.id, { role: e.target.value })} placeholder="Senior Frontend Engineer" />
                </Field>
                <Field label="Empresa" required>
                  <Input value={exp.company} onChange={(e) => update(exp.id, { company: e.target.value })} placeholder="TechNova" />
                </Field>
                <Field label="Ubicación">
                  <Input value={exp.location} onChange={(e) => update(exp.id, { location: e.target.value })} placeholder="Madrid / Remoto" />
                </Field>
                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
                  <Field label="Inicio" hint="AAAA-MM">
                    <Input value={exp.startDate} onChange={(e) => update(exp.id, { startDate: e.target.value })} placeholder="2021-06" />
                  </Field>
                  <Field label="Fin" hint="AAAA-MM">
                    <Input
                      value={exp.endDate}
                      onChange={(e) => update(exp.id, { endDate: e.target.value })}
                      placeholder="2024-01"
                      disabled={exp.current}
                    />
                  </Field>
                </div>
                <label className="checkbox span-2">
                  <input
                    type="checkbox"
                    checked={exp.current}
                    onChange={(e) => update(exp.id, { current: e.target.checked })}
                  />
                  Trabajo aquí actualmente
                </label>
              </div>
              <hr className="divider" style={{ margin: 'var(--sp-4) 0' }} />
              <BulletsEditor bullets={exp.bullets} onChange={(b) => setBullets(exp.id, b)} />
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

/* ---------- Educación ---------- */

function EducationSection() {
  const education = useAppStore((s) => s.profile.education)
  const add = useAppStore((s) => s.addEducation)
  const update = useAppStore((s) => s.updateEducation)
  const remove = useAppStore((s) => s.removeEducation)

  return (
    <Card
      title="Educación"
      actions={
        <Button size="sm" icon={<Icon name="plus" size={15} />} onClick={add}>
          Añadir
        </Button>
      }
    >
      {education.length === 0 ? (
        <EmptyState icon="🎓" title="Sin formación añadida">
          Añade tu titulación más relevante.
        </EmptyState>
      ) : (
        <div className="stack gap-4">
          {education.map((edu, i) => (
            <div className="item-card" key={edu.id}>
              <div className="item-card__head">
                <span className="item-card__index">
                  <span className="item-card__dot">{i + 1}</span>
                  {edu.degree || 'Nueva titulación'}
                </span>
                <Button variant="subtle" size="icon" onClick={() => remove(edu.id)} aria-label="Eliminar">
                  <Icon name="trash" size={15} />
                </Button>
              </div>
              <div className="form-grid">
                <Field label="Titulación" required>
                  <Input value={edu.degree} onChange={(e) => update(edu.id, { degree: e.target.value })} placeholder="Grado" />
                </Field>
                <Field label="Campo de estudio">
                  <Input value={edu.field} onChange={(e) => update(edu.id, { field: e.target.value })} placeholder="Ingeniería Informática" />
                </Field>
                <Field label="Institución" required>
                  <Input value={edu.institution} onChange={(e) => update(edu.id, { institution: e.target.value })} placeholder="Universidad Politécnica de Madrid" />
                </Field>
                <Field label="Ubicación">
                  <Input value={edu.location} onChange={(e) => update(edu.id, { location: e.target.value })} placeholder="Madrid" />
                </Field>
                <Field label="Inicio" hint="AAAA-MM">
                  <Input value={edu.startDate} onChange={(e) => update(edu.id, { startDate: e.target.value })} placeholder="2014-09" />
                </Field>
                <Field label="Fin" hint="AAAA-MM">
                  <Input value={edu.endDate} onChange={(e) => update(edu.id, { endDate: e.target.value })} placeholder="2018-06" />
                </Field>
                <Field label="Detalles" hint="Honores, mención, GPA, tesis…">
                  <Input value={edu.details} onChange={(e) => update(edu.id, { details: e.target.value })} placeholder="Matrícula de honor en proyecto final" />
                </Field>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

/* ---------- Skills ---------- */

function SkillsSection() {
  const skills = useAppStore((s) => s.profile.skills)
  const addSkill = useAppStore((s) => s.addSkill)
  const updateSkill = useAppStore((s) => s.updateSkill)
  const removeSkill = useAppStore((s) => s.removeSkill)
  const [draft, setDraft] = useState('')

  const commit = () => {
    const name = draft.trim()
    if (!name) return
    addSkill(name)
    setDraft('')
  }

  return (
    <Card title="Habilidades" subtitle="Tecnologías y competencias clave.">
      <div className="skill-input-row" style={{ marginBottom: 'var(--sp-4)' }}>
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && commit()}
          placeholder="Escribe una habilidad y pulsa Enter (ej.: React)"
        />
        <Button icon={<Icon name="plus" size={15} />} onClick={commit}>
          Añadir
        </Button>
      </div>
      {skills.length === 0 ? (
        <EmptyState icon="🧩" title="Sin habilidades">Añade tus competencias técnicas.</EmptyState>
      ) : (
        <div className="stack gap-2">
          {skills.map((skill) => (
            <div className="row gap-2" key={skill.id}>
              <Input
                value={skill.name}
                onChange={(e) => updateSkill(skill.id, { name: e.target.value })}
                className="grow"
              />
              <Select
                value={skill.level}
                onChange={(e) => updateSkill(skill.id, { level: e.target.value as SkillLevel })}
                options={SKILL_LEVELS}
                style={{ width: 150 }}
              />
              <Button variant="subtle" size="icon" onClick={() => removeSkill(skill.id)} aria-label="Eliminar">
                <Icon name="trash" size={15} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

/* ---------- Idiomas + Proyectos ---------- */

function ExtrasSection() {
  const languages = useAppStore((s) => s.profile.languages)
  const addLang = useAppStore((s) => s.addLanguage)
  const updateLang = useAppStore((s) => s.updateLanguage)
  const removeLang = useAppStore((s) => s.removeLanguage)

  const projects = useAppStore((s) => s.profile.projects)
  const addProject = useAppStore((s) => s.addProject)
  const updateProject = useAppStore((s) => s.updateProject)
  const removeProject = useAppStore((s) => s.removeProject)

  return (
    <div className="form-grid">
      <Card
        title="Idiomas"
        actions={
          <Button size="sm" variant="ghost" icon={<Icon name="plus" size={15} />} onClick={addLang}>
            Añadir
          </Button>
        }
      >
        {languages.length === 0 ? (
          <p className="text-muted" style={{ fontSize: 'var(--fs-sm)' }}>
            Sin idiomas añadidos.
          </p>
        ) : (
          <div className="stack gap-2">
            {languages.map((lang) => (
              <div className="row gap-2" key={lang.id}>
                <Input
                  value={lang.name}
                  onChange={(e) => updateLang(lang.id, { name: e.target.value })}
                  placeholder="Inglés"
                  className="grow"
                />
                <Input
                  value={lang.level}
                  onChange={(e) => updateLang(lang.id, { level: e.target.value })}
                  placeholder="C1"
                  style={{ width: 110 }}
                />
                <Button variant="subtle" size="icon" onClick={() => removeLang(lang.id)} aria-label="Eliminar">
                  <Icon name="trash" size={15} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card
        title="Proyectos"
        actions={
          <Button size="sm" variant="ghost" icon={<Icon name="plus" size={15} />} onClick={addProject}>
            Añadir
          </Button>
        }
      >
        {projects.length === 0 ? (
          <p className="text-muted" style={{ fontSize: 'var(--fs-sm)' }}>
            Sin proyectos añadidos.
          </p>
        ) : (
          <div className="stack gap-3">
            {projects.map((p) => (
              <div className="item-card" key={p.id}>
                <div className="item-card__head">
                  <span className="item-card__index">{p.name || 'Proyecto'}</span>
                  <Button variant="subtle" size="icon" onClick={() => removeProject(p.id)} aria-label="Eliminar">
                    <Icon name="trash" size={15} />
                  </Button>
                </div>
                <div className="stack gap-2">
                  <Input value={p.name} onChange={(e) => updateProject(p.id, { name: e.target.value })} placeholder="Nombre del proyecto" />
                  <Input value={p.link} onChange={(e) => updateProject(p.id, { link: e.target.value })} placeholder="github.com/usuario/proyecto" />
                  <TextArea
                    value={p.description}
                    onChange={(e) => updateProject(p.id, { description: e.target.value })}
                    placeholder="Descripción breve e impacto."
                    style={{ minHeight: 60 }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
