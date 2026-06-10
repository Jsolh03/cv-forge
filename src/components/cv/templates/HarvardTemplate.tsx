import type { UserProfile } from '@/types'
import { formatRange } from '@/lib/format'
import { contactParts, hasContent } from './shared'

/** Plantilla Harvard: serif, clásica, centrada, foco en logros. */
export function HarvardTemplate({ profile }: { profile: UserProfile }) {
  const { contact, summary, experience, education, skills, languages, projects } = profile
  const contacts = contactParts(contact)

  return (
    <div className="cv cv--harvard">
      <header>
        <div className="cv-name">{contact.fullName || 'Tu Nombre'}</div>
        {contact.headline && <div className="cv-headline">{contact.headline}</div>}
        {contacts.length > 0 && (
          <div className="cv-contact">
            {contacts.map((c, i) => (
              <span key={i}>
                {c}
                {i < contacts.length - 1 ? ' ·' : ''}
              </span>
            ))}
          </div>
        )}
      </header>

      {hasContent(summary) && (
        <section className="cv-section">
          <div className="cv-section__title">Perfil</div>
          <p className="cv-summary">{summary}</p>
        </section>
      )}

      {experience.length > 0 && (
        <section className="cv-section">
          <div className="cv-section__title">Experiencia</div>
          {experience.map((exp) => (
            <div className="cv-entry" key={exp.id}>
              <div className="cv-entry__top">
                <div>
                  <span className="cv-entry__role">{exp.role}</span>
                  {exp.company && <span className="cv-entry__org">, {exp.company}</span>}
                </div>
                <div className="cv-entry__meta">
                  {formatRange(exp.startDate, exp.endDate, exp.current)}
                  {exp.location ? ` · ${exp.location}` : ''}
                </div>
              </div>
              {exp.bullets.filter(hasContent).length > 0 && (
                <ul className="cv-bullets">
                  {exp.bullets.filter(hasContent).map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {education.length > 0 && (
        <section className="cv-section">
          <div className="cv-section__title">Educación</div>
          {education.map((edu) => (
            <div className="cv-entry" key={edu.id}>
              <div className="cv-entry__top">
                <div>
                  <span className="cv-entry__role">
                    {edu.degree}
                    {edu.field ? ` en ${edu.field}` : ''}
                  </span>
                  {edu.institution && <span className="cv-entry__org">, {edu.institution}</span>}
                </div>
                <div className="cv-entry__meta">
                  {formatRange(edu.startDate, edu.endDate, false)}
                  {edu.location ? ` · ${edu.location}` : ''}
                </div>
              </div>
              {hasContent(edu.details) && (
                <ul className="cv-bullets">
                  <li>{edu.details}</li>
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {projects.length > 0 && (
        <section className="cv-section">
          <div className="cv-section__title">Proyectos</div>
          {projects.map((p) => (
            <div className="cv-entry" key={p.id}>
              <div className="cv-entry__top">
                <span className="cv-entry__role">{p.name}</span>
                {p.link && <span className="cv-entry__meta">{p.link}</span>}
              </div>
              {hasContent(p.description) && (
                <ul className="cv-bullets">
                  <li>{p.description}</li>
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {skills.length > 0 && (
        <section className="cv-section">
          <div className="cv-section__title">Habilidades</div>
          <p className="cv-inline">{skills.map((s) => s.name).join(' · ')}</p>
        </section>
      )}

      {languages.length > 0 && (
        <section className="cv-section">
          <div className="cv-section__title">Idiomas</div>
          <p className="cv-inline">
            {languages.map((l) => `${l.name}${l.level ? ` (${l.level})` : ''}`).join(' · ')}
          </p>
        </section>
      )}
    </div>
  )
}
