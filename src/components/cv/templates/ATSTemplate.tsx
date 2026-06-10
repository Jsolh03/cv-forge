import type { UserProfile } from '@/types'
import { formatRange } from '@/lib/format'
import { contactParts, hasContent } from './shared'

/** Plantilla ATS: sans-serif, una columna, secciones etiquetadas, parseable. */
export function ATSTemplate({ profile }: { profile: UserProfile }) {
  const { contact, summary, experience, education, skills, languages, projects } = profile
  const contacts = contactParts(contact)

  return (
    <div className="cv cv--ats">
      <header>
        <div className="cv-name">{contact.fullName || 'Tu Nombre'}</div>
        {contact.headline && <div className="cv-headline">{contact.headline}</div>}
        {contacts.length > 0 && (
          <div className="cv-contact">
            {contacts.map((c, i) => (
              <span key={i}>{c}</span>
            ))}
          </div>
        )}
      </header>

      {hasContent(summary) && (
        <section className="cv-section">
          <div className="cv-section__title">Resumen profesional</div>
          <p className="cv-summary">{summary}</p>
        </section>
      )}

      {experience.length > 0 && (
        <section className="cv-section">
          <div className="cv-section__title">Experiencia profesional</div>
          {experience.map((exp) => (
            <div className="cv-entry" key={exp.id}>
              <div className="cv-entry__top">
                <span className="cv-entry__role">{exp.role}</span>
                <span className="cv-entry__meta">{formatRange(exp.startDate, exp.endDate, exp.current)}</span>
              </div>
              <div className="cv-entry__org">
                {exp.company}
                {exp.location ? ` — ${exp.location}` : ''}
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

      {skills.length > 0 && (
        <section className="cv-section">
          <div className="cv-section__title">Habilidades</div>
          <div className="cv-skills">
            {skills.map((s) => (
              <span className="cv-skill" key={s.id}>
                {s.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {education.length > 0 && (
        <section className="cv-section">
          <div className="cv-section__title">Educación</div>
          {education.map((edu) => (
            <div className="cv-entry" key={edu.id}>
              <div className="cv-entry__top">
                <span className="cv-entry__role">
                  {edu.degree}
                  {edu.field ? ` en ${edu.field}` : ''}
                </span>
                <span className="cv-entry__meta">{formatRange(edu.startDate, edu.endDate, false)}</span>
              </div>
              <div className="cv-entry__org">
                {edu.institution}
                {edu.location ? ` — ${edu.location}` : ''}
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

      {languages.length > 0 && (
        <section className="cv-section">
          <div className="cv-section__title">Idiomas</div>
          <div className="cv-skills">
            {languages.map((l) => (
              <span className="cv-skill" key={l.id}>
                {l.name}
                {l.level ? ` — ${l.level}` : ''}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
