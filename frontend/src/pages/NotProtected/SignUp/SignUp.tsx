import { Link } from 'react-router-dom';
import { Formik, Form } from 'formik';
import { object, string } from 'yup';
import ROUTES from '../../../routes/routes';
import useAuth from '../../../hooks/useAuth';
import AuthLayout, { AuthField, PasswordField } from '../../../components/AuthLayout/AuthLayout';

export type TsignUpFormState = {
  fname: string,
  username: string,
  email: string;
  password: string;
}

const initialValues: TsignUpFormState = {
  fname: '',
  username: '',
  email: '',
  password: ''
};

// Same rules as the server (backend app/middleware/validateAuth.js).
const PASSWORD_RULES = [
  { label: '8+ characters', test: (p: string) => p.length >= 8 },
  { label: 'A number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'A lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'An uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'A symbol', test: (p: string) => /[^\w]/.test(p) },
];

const validationSchema = object({
  fname: string().trim()
    .min(4, 'Your name needs at least 4 characters')
    .max(30, 'Your name can be at most 30 characters')
    .required('Enter your full name'),
  username: string()
    .min(3, 'At least 3 characters')
    .max(20, 'At most 20 characters')
    .matches(/^[a-zA-Z0-9_.]+$/, 'Only letters, numbers, "_" and "."')
    .required('Choose a username'),
  email: string().trim().email('Enter a valid email address').required('Enter your email'),
  password: string()
    .max(72, 'At most 72 characters')
    .test('rules', 'Your password doesn’t meet all the rules below', value =>
      PASSWORD_RULES.every(rule => rule.test(value ?? '')))
    .required('Choose a password'),
})

export default function SignUp() {
  const { signup } = useAuth();

  const handleSubmit = (values: TsignUpFormState, { resetForm, setSubmitting }: { resetForm: () => void, setSubmitting: (isSubmitting: boolean) => void }) => {
    signup({ ...values, fname: values.fname.trim(), email: values.email.trim() }, { resetForm, setSubmitting });
  };

  return (
    <AuthLayout
      title='Create your account'
      subtitle='It takes less than a minute.'
      footer={<>Already have an account? <Link to={ROUTES.LOGIN}>Log in</Link></>}
    >
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ isSubmitting, values }) => (
          <Form noValidate>
            <AuthField name='fname' label='Full name' autoComplete='name' />
            <AuthField name='username' label='Username' autoComplete='username' hint='Letters, numbers, "_" and "." (3-20)' />
            <AuthField name='email' label='Email' type='email' autoComplete='email' />
            <PasswordField name='password' label='Password' autoComplete='new-password' />
            <ul className='PasswordRules' aria-label='Password rules'>
              {PASSWORD_RULES.map(rule => (
                <li key={rule.label} className={rule.test(values.password) ? 'met' : ''}>{rule.label}</li>
              ))}
            </ul>
            <button className='AuthLayout__submit' disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </button>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
}
