import { Link } from 'react-router-dom';
import './LogIn.scss';
import ROUTES from '../../../routes/routes';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { object, string } from 'yup';
import useAuth from '../../../hooks/useAuth';


export type TlogInFormState = {
  username: string;
  password: string;
}

const validationSchema = object({
  username: string().min(3).max(20).required(),
  password: string()
    .min(8, 'Password must be 8 characters long')
    .matches(/[0-9]/, 'Password requires a number')
    .matches(/[a-z]/, 'Password requires a lowercase letter')
    .matches(/[A-Z]/, 'Password requires an uppercase letter')
    .matches(/[^\w]/, 'Password requires a symbol')
    .required(),
});

const initialValues: TlogInFormState = {
  username: '',
  password: ''
};

export default function LogIn() {
  const { signin } = useAuth();

  return (
    <div className='LogIn'>

      <div className="LogIn__info">
        <h2>Jupiter</h2>
        <p>Jupiter brings your campus into one orbit. Share posts and photos, find friends and chat in real time.</p>
        <img src="/jupiter.svg" alt='Jupiter planet' />
      </div>
      <div className="LogIn__content">
        <h2>Log In</h2>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          validateOnChange={true}
          onSubmit={(values, { setSubmitting }) => signin(values, { setSubmitting })}
        >
          {
            ({
              isSubmitting
            }) => (
              <Form>
                <div className="input-wrapper">
                  <Field type="text" name="username" id="username" placeholder='Your Username' />
                  <ErrorMessage name="username" component="div" className="error" />
                </div>

                <div className="input-wrapper">
                  <Field type="password" name="password" id="password" placeholder='Your Password' />
                  <ErrorMessage name="password" component="div" className="error" />
                </div>

                <button disabled={isSubmitting} type="submit">{isSubmitting ? "Logging In..." : "Log In"}</button>
              </Form>
            )
          }
        </Formik>
        <p>Don't have an account? <Link className='signup' to={ROUTES.SIGNUP}>Sign Up</Link></p>
      </div>
    </div>
  );
}
