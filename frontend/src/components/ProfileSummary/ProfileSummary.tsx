import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { fetchProfile } from '../../api/profiles'
import { getCoverPhoto, getJob, getName, getPfp, getUserID, getUsername } from '../../store/features/userInfo/userInfoSlice'
import { getFriendsBack } from '../../store/features/friends/friendsSlice'
import { newsfeedPostsSelector, userPostsSelector } from '../../store/features/post/postSlice'
import ROUTES from '../../routes/routes'
import './ProfileSummary.scss'

// Your mini profile on the newsfeed.
export default function ProfileSummary() {
  const id = useSelector(getUserID)
  const fname = useSelector(getName)
  const username = useSelector(getUsername)
  const job = useSelector(getJob)
  const pfp = useSelector(getPfp)
  const cover = useSelector(getCoverPhoto)
  const friends = useSelector(getFriendsBack)
  const userPosts = useSelector(userPostsSelector)
  const feed = useSelector(newsfeedPostsSelector)
  const [postsCount, setPostsCount] = useState<number>()
  // re-count when you post or delete from the feed
  const ownInFeed = feed.data.filter(post => post.userId === id).length

  useEffect(() => {
    if (id) fetchProfile(id).then(profile => setPostsCount(profile.postsCount)).catch(() => undefined)
  }, [id, ownInFeed])

  const posts = userPosts.totalItems ?? postsCount

  return (
    <div className='ProfileSummary'>
      <div className='ProfileSummary__cover'>{cover && <img src={cover} alt='' />}</div>
      <Link to={ROUTES.HOME} className='ProfileSummary__avatar profile-link'>
        <img src={pfp} alt={fname} />
      </Link>
      <Link to={ROUTES.HOME} className='ProfileSummary__name profile-link'>{fname}</Link>
      <p className='ProfileSummary__meta'>@{username}{job ? ` · ${job}` : ''}</p>
      <dl className='ProfileSummary__stats'>
        <div>
          <dt>Friends</dt>
          <dd>{friends.length}</dd>
        </div>
        <div>
          <dt>Posts</dt>
          <dd>{posts ?? '–'}</dd>
        </div>
      </dl>
      <Link to={ROUTES.HOME} className='ProfileSummary__link'>View profile</Link>
    </div>
  )
}
