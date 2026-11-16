import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import InfoBar from './InfoBar/InfoBar'
import CommentBar from './CommentBar/CommentBar';
import CommentInput from './CommentInput/CommentInput';
import CommentSkeleton from '../shared/Skeletons/CommentSkeleton';
import { PostState, TComments, postCommentLoading, postDeleteLoading } from '../../store/features/post/postSlice';
import { deletePost } from '../../store/features/post/postThunks';
import { getUserID } from '../../store/features/userInfo/userInfoSlice';
import { formatDate, formatRelative } from '../../hooks/dateFormat';
import { profilePath } from '../../routes/routes';
import { AppDispatch } from '../../store/setup';
import './Post.scss'

export type TInsigths = {
  post: PostState
  commentsCount: number,
  onComment: () => void,
}

const countComments = (comments: TComments[] | null) =>
  (comments ?? []).reduce((total, comment) => total + 1 + (comment.replies?.length ?? 0), 0);

export default function Post({ postData }: { postData: PostState }) {
  const dispatch = useDispatch<AppDispatch>();
  const userId = useSelector(getUserID);
  const commentLoading = useSelector(postCommentLoading)
  const deleteLoading = useSelector(postDeleteLoading);
  const [replyData, setReplyData] = useState<TComments | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isOwn = postData.userId == userId;
  const deleting = deleteLoading.loading && deleteLoading.postId === postData.postId;
  const authorLink = profilePath(postData.userId, userId);
  const commentFieldId = `comment-${postData.postId}`;

  // The "⋯" menu closes on outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  return (
    <article className='Post'>
      <header className='Post__header'>
        <Link to={authorLink} className='profile-link Post__avatar'>
          <img src={postData.pfp} alt={postData.fname} />
        </Link>
        <div className='Post__author'>
          <Link to={authorLink} className='profile-link Post__name'>{postData.fname}</Link>
          <time dateTime={new Date(postData.createdAt).toISOString()} title={formatDate(new Date(postData.createdAt))}>
            {formatRelative(postData.createdAt)}
          </time>
        </div>
        {isOwn && (
          <div className='Post__menu' ref={menuRef}>
            <button
              type='button'
              className='Post__menu-button'
              aria-label='Post options'
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg viewBox='0 0 16 16' width='18' height='18' fill='currentColor' aria-hidden='true'>
                <path d='M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3' />
              </svg>
            </button>
            {menuOpen && (
              <div className='Post__menu-list'>
                <button type='button' className='danger' disabled={deleting} onClick={() => dispatch(deletePost(postData.postId))}>
                  {deleting ? 'Deleting…' : 'Delete post'}
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {postData.content && <p className='Post__text'>{postData.content}</p>}
      {postData.image && (
        <div className='Post__image'>
          <img src={postData.image} alt={`Photo shared by ${postData.fname}`} loading='lazy' />
        </div>
      )}

      <InfoBar
        post={postData}
        commentsCount={countComments(postData.comments)}
        onComment={() => document.getElementById(commentFieldId)?.focus()}
      />

      {(postData.comments || (commentLoading.loading && commentLoading.postId === postData.postId)) && (
        <div className='Post__comments'>
          {postData.comments && <CommentBar replyData={replyData} setReplyData={setReplyData} comments={postData.comments} />}
          {commentLoading.loading && commentLoading.postId === postData.postId && <CommentSkeleton />}
        </div>
      )}
      <CommentInput replyData={replyData} setReplyData={setReplyData} post={postData} fieldId={commentFieldId} />
    </article>
  )
}
