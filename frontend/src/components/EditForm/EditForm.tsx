import { ErrorMessage, Field, Form, Formik } from 'formik'
import { useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { object, string } from 'yup'
import Modal from '../shared/Modal/Modal'
import SecondaryLoader from '../shared/SecondaryLoader/SecondaryLoader'
import { getJob, getLoading, getName, getPfp, getUsername } from '../../store/features/userInfo/userInfoSlice'
import { changeUserData, changeUserImage } from '../../store/features/userInfo/userThunks'
import { notifySuccess } from '../../hooks/useAuth'
import { AppDispatch } from '../../store/setup'
import './EditForm.scss'

const NAME_MAX = 30;
const JOB_MAX = 50;

const validationSchema = object({
  fname: string().trim()
    .min(4, 'Your name needs at least 4 characters')
    .max(NAME_MAX, `Your name can be at most ${NAME_MAX} characters`)
    .required('Please enter your name'),
  job: string().trim().max(JOB_MAX, `Keep it under ${JOB_MAX} characters`)
})

// "Edit profile" dialog, opened from the account menu, the mobile menu and Shortcuts.
export default function EditProfileModal({ onClose }: { onClose: () => void }) {
  const dispatch = useDispatch<AppDispatch>()
  const fname = useSelector(getName)
  const job = useSelector(getJob)
  const pfp = useSelector(getPfp)
  const username = useSelector(getUsername)
  const upload = useSelector(getLoading)
  const photoInput = useRef<HTMLInputElement>(null)
  const photoUploading = upload.loading && upload.type === 'pfp'

  const initialValues = { fname: fname || '', job: job || '' }

  const handleSubmit = async (values: { fname: string, job: string }) => {
    const result = await dispatch(changeUserData({ fname: values.fname.trim(), job: values.job.trim() }))
    if (changeUserData.fulfilled.match(result)) {
      notifySuccess('Profile updated')
      onClose()
    }
    // on failure the error is shown as a notification and the dialog stays open
  }

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) dispatch(changeUserImage({ file, type: 'pfp' }))
    e.target.value = ''
  }

  return (
    <Modal title='Edit profile' description='This is how other people see you on Jupiter.' onClose={onClose}>
      <div className='EditForm'>
        <div className='EditForm__photo'>
          <div className='EditForm__avatar'>
            {photoUploading ? <SecondaryLoader /> : <img src={pfp} alt='' />}
          </div>
          <div className='EditForm__identity'>
            <strong>{fname}</strong>
            <span>@{username}</span>
          </div>
          <button type='button' className='EditForm__secondary' disabled={photoUploading} onClick={() => photoInput.current?.click()}>
            {photoUploading ? 'Uploading…' : 'Change photo'}
          </button>
          <input ref={photoInput} type='file' accept='image/*' hidden onChange={handlePhoto} />
        </div>

        <Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={validationSchema}>
          {({ isSubmitting, dirty, values, errors, touched }) => (
            <Form noValidate>
              <div className={`EditForm__field ${touched.fname && errors.fname ? 'invalid' : ''}`}>
                <div className='EditForm__label'>
                  <label htmlFor='edit-fname'>Full name</label>
                  <span className='count'>{values.fname.length}/{NAME_MAX}</span>
                </div>
                <Field type='text' name='fname' id='edit-fname' maxLength={NAME_MAX} autoComplete='name' />
                <ErrorMessage name='fname' component='p' className='error' />
              </div>

              <div className={`EditForm__field ${touched.job && errors.job ? 'invalid' : ''}`}>
                <div className='EditForm__label'>
                  <label htmlFor='edit-job'>Role <span className='optional'>(optional)</span></label>
                  <span className='count'>{values.job.length}/{JOB_MAX}</span>
                </div>
                <Field type='text' name='job' id='edit-job' maxLength={JOB_MAX} placeholder='e.g. Physics student' autoComplete='organization-title' />
                <ErrorMessage name='job' component='p' className='error' />
                <p className='hint'>Shown under your name on your profile.</p>
              </div>

              <div className='EditForm__actions'>
                <button type='button' className='EditForm__secondary' onClick={onClose}>Cancel</button>
                <button type='submit' className='EditForm__primary' disabled={isSubmitting || !dirty}>
                  {isSubmitting ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  )
}
