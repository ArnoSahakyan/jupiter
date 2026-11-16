import './CommentInput.scss'
import { Field, Formik, Form, FormikValues } from 'formik'
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PostState, TComments, TReplies } from '../../../store/features/post/postSlice';
import { getPfp } from '../../../store/features/userInfo/userInfoSlice';
import { object, string } from 'yup';
import { createComment } from '../../../store/features/post/postThunks';
import { AppDispatch } from '../../../store/setup';

type TcommentInput = {
  post: PostState,
  replyData: TComments | null,
  setReplyData: React.Dispatch<React.SetStateAction<TReplies | null>>,
  fieldId: string,
}

const validationSchema = object({
  content: string().trim().required()
})

const initialValues = {
  content: ''
}

export default function CommentInput({ post, replyData, setReplyData, fieldId }: TcommentInput) {
  const dispatch = useDispatch<AppDispatch>();
  const pfp = useSelector(getPfp)

  // Choosing "Reply" puts the cursor in the comment field.
  useEffect(() => {
    if (replyData) document.getElementById(fieldId)?.focus();
  }, [replyData, fieldId]);

  const handleSubmit = (values: FormikValues, { resetForm }: { resetForm: () => void }) => {
    const newParentId = replyData?.parentId ? replyData.parentId : replyData?.commentId
    dispatch(createComment({
      content: values.content.trim(),
      uploaderId: post.userId,
      postId: post.postId,
      parentId: newParentId ?? null
    }))
    resetForm();
    setReplyData(null)
  };

  return (
    <div className="CommentInput">
      <img src={pfp} alt='' />
      <div className="CommentInput__box">
        {replyData && (
          <div className='CommentInput__replying'>
            Replying to <strong>{replyData.fname}</strong>
            <button type='button' aria-label='Cancel reply' onClick={() => setReplyData(null)}>×</button>
          </div>
        )}
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ values }) => (
            <Form className="CommentInput__input">
              <Field
                id={fieldId}
                type="text"
                name="content"
                autoComplete='off'
                aria-label={replyData ? `Reply to ${replyData.fname}` : 'Write a comment'}
                placeholder={replyData ? `Reply to ${replyData.fname}…` : 'Write a comment…'}
              />
              <button type="submit" aria-label='Send' disabled={!values.content.trim()}>
                <svg viewBox='0 0 16 16' width='16' height='16' fill='currentColor' aria-hidden='true'>
                  <path d='M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z' />
                </svg>
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}
