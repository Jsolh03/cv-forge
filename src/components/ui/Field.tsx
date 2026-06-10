import { forwardRef } from 'react'
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { cx } from '@/lib/classnames'

interface FieldShellProps {
  label?: string
  required?: boolean
  hint?: string
  error?: string | null
  children: ReactNode
}

export function Field({ label, required, hint, error, children }: FieldShellProps) {
  return (
    <div className="field">
      {label && (
        <label className="field__label">
          {label}
          {required && <span className="field__req" aria-hidden>*</span>}
        </label>
      )}
      {children}
      {error ? (
        <span className="field__error">⚠ {error}</span>
      ) : (
        hint && <span className="field__hint">{hint}</span>
      )}
    </div>
  )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

export function Input({ invalid, className, ...rest }: InputProps) {
  return <input className={cx('input', invalid && 'input--invalid', className)} {...rest} />
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ invalid, className, ...rest }, ref) => (
    <textarea ref={ref} className={cx('textarea', invalid && 'input--invalid', className)} {...rest} />
  ),
)
TextArea.displayName = 'TextArea'

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  options: Array<{ value: string; label: string }>
}

export function Select({ options, className, ...rest }: SelectProps) {
  return (
    <select className={cx('select', className)} {...rest}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
