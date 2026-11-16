import { ReactNode, useState } from 'react'
import { ErrorMessage, Field, useField } from 'formik'
import './AuthLayout.scss'

const FEATURES = [
  'Share posts and photos with your classmates',
  'Find friends and see what they are up to',
  'Chat in real time, one to one',
]

// Split screen for the login and signup pages: brand panel + form card.
export default function AuthLayout({ title, subtitle, children, footer }: {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div className='AuthLayout'>
      <section className='AuthLayout__brand'>
        <img src='/logo-light.svg' alt='Jupiter' className='AuthLayout__logo' />
        <div className='AuthLayout__pitch'>
          <h2>Your campus, in one orbit.</h2>
          <ul>
            {FEATURES.map(feature => (
              <li key={feature}>
                <svg viewBox='0 0 16 16' width='16' height='16' fill='currentColor' aria-hidden='true'>
                  <path d='M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z' />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>
        <img src='/jupiter.svg' alt='' className='AuthLayout__planet' />
      </section>

      <main className='AuthLayout__main'>
        <div className='AuthLayout__card'>
          <img src='/logo.svg' alt='Jupiter' className='AuthLayout__card-logo' />
          <h1>{title}</h1>
          <p className='AuthLayout__subtitle'>{subtitle}</p>
          {children}
          <p className='AuthLayout__footer'>{footer}</p>
        </div>
      </main>
    </div>
  )
}

// Labelled text field with an inline error.
export function AuthField({ name, label, type = 'text', autoComplete, hint }: {
  name: string
  label: string
  type?: string
  autoComplete?: string
  hint?: string
}) {
  const [, meta] = useField(name)
  const invalid = meta.touched && !!meta.error
  return (
    <div className={`AuthField ${invalid ? 'invalid' : ''}`}>
      <label htmlFor={`auth-${name}`}>{label}</label>
      <Field id={`auth-${name}`} name={name} type={type} autoComplete={autoComplete} aria-invalid={invalid} />
      <ErrorMessage name={name} component='p' className='AuthField__error' />
      {hint && !invalid && <p className='AuthField__hint'>{hint}</p>}
    </div>
  )
}

// Password field with a show/hide button.
export function PasswordField({ name, label, autoComplete, showError = true }: {
  name: string
  label: string
  autoComplete: string
  showError?: boolean
}) {
  const [visible, setVisible] = useState(false)
  const [, meta] = useField(name)
  const invalid = showError && meta.touched && !!meta.error
  return (
    <div className={`AuthField ${invalid ? 'invalid' : ''}`}>
      <label htmlFor={`auth-${name}`}>{label}</label>
      <div className='AuthField__password'>
        <Field id={`auth-${name}`} name={name} type={visible ? 'text' : 'password'} autoComplete={autoComplete} aria-invalid={invalid} />
        <button type='button' onClick={() => setVisible(!visible)} aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible}>
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
      {showError && <ErrorMessage name={name} component='p' className='AuthField__error' />}
    </div>
  )
}
