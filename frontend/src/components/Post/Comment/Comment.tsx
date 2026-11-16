import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { formatDate, formatRelative } from '../../../hooks/dateFormat'
import { TComments, TReplies } from '../../../store/features/post/postSlice'
import { getUserID } from '../../../store/features/userInfo/userInfoSlice'
import { profilePath } from '../../../routes/routes'
import './Comment.scss'

interface commentComponent {
  comment: TReplies,
  isReply: boolean,
  replyData: TComments | null
  setReplyData: React.Dispatch<React.SetStateAction<TReplies | null>>
}

export default function Comment({ comment, isReply, replyData, setReplyData }: commentComponent) {
  const ownId = useSelector(getUserID)
  const replying = replyData?.commentId === comment.commentId
  const withProfileLink = (child: JSX.Element) => comment.userId
    ? <Link to={profilePath(comment.userId, ownId)} className='profile-link'>{child}</Link>
    : child

  return (
    <div className={`Comment ${isReply ? 'reply' : ''}`}>
      <div className="Comment__pfp">
        {withProfileLink(<img src={comment.pfp} alt={comment.fname} />)}
      </div>
      <div className="Comment__body">
        <div className="Comment__bubble">
          {withProfileLink(<span className='Comment__name'>{comment.fname}</span>)}
          <p>{comment.content}</p>
        </div>
        <div className="Comment__meta">
          <time dateTime={new Date(comment.createdAt).toISOString()} title={formatDate(new Date(comment.createdAt))}>
            {formatRelative(comment.createdAt)}
          </time>
          <button
            type='button'
            className={replying ? 'active' : ''}
            aria-pressed={replying}
            onClick={() => setReplyData(replying ? null : comment)}
          >
            {replying ? 'Replying' : 'Reply'}
          </button>
        </div>
      </div>
    </div>
  )
}
