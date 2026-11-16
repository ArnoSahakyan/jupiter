import { Link } from 'react-router-dom';
import { Formik, Form } from 'formik';
import { object, string } from 'yup';
import ROUTES from '../../../routes/routes';
import useAuth from '../../../hooks/useAuth';
import AuthLayout, { AuthField, PasswordField } from '../../../components/AuthLayout/AuthLayout';

export type TlogInFormState = {
  username: string;
  password: string;
}

// Logging in only needs both fields; the password rules apply at signup.
const validationSchema = object({
  username: string().trim().required('Enter your username'),
  password: string().required('Enter your password'),
});

const initialValues: TlogInFormState = {
  username: '',
  password: ''
};

export default function LogIn() {
  const { signin } = useAuth();

  return (
    <AuthLayout
      title='Welcome back'
      subtitle='Log in to see what your friends are up to.'
      footer={<>New to Jupiter? <Link to={ROUTES.SIGNUP}>Create an account</Link></>}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => signin({ ...values, username: values.username.trim() }, { setSubmitting })}
      >
        {({ isSubmitting }) => (
          <Form noValidate>
            <AuthField name='username' label='Username' autoComplete='username' />
            <PasswordField name='password' label='Password' autoComplete='current-password' />
            <button className='AuthLayout__submit' disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Logging in…' : 'Log in'}
            </button>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
}
