import { useCallback, useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import ProfileHeader from '../../../components/ProfileHeader/ProfileHeader'
import Shortcuts from '../../../components/Shortcuts/Shortcuts'
import FriendsBar from '../../../components/FriendsBar/FriendsBar'
import EditProfileModal from '../../../components/EditForm/EditForm'
import { fetchProfile } from '../../../api/profiles'
import { getCoverPhoto, getJob, getName, getPfp, getStatus, getUserID, getUsername } from '../../../store/features/userInfo/userInfoSlice'
import { getFriendsBack } from '../../../store/features/friends/friendsSlice'
import { userPostsSelector } from '../../../store/features/post/postSlice'
import ROUTES from '../../../routes/routes'
import './HomePage.scss'

// Your own profile: header with editable photo/cover, then your timeline, photos or friends.
export default function HomePage() {
  const id = useSelector(getUserID)
  const fname = useSelector(getName)
  const username = useSelector(getUsername)
  const job = useSelector(getJob)
  const pfp = useSelector(getPfp)
  const coverPhoto = useSelector(getCoverPhoto)
  const onlineStatus = useSelector(getStatus)
  const friends = useSelector(getFriendsBack)
  const userPosts = useSelector(userPostsSelector)
  const [postsCount, setPostsCount] = useState<number | undefined>(undefined)
  const [editOpen, setEditOpen] = useState(false)
  const closeEdit = useCallback(() => setEditOpen(false), [])

  // Post count for the header before the timeline has loaded (e.g. on the Photos tab).
  useEffect(() => {
    if (id) fetchProfile(id).then(profile => setPostsCount(profile.postsCount)).catch(() => undefined)
  }, [id])

  return (
    <div className='HomePage'>
      {editOpen && <EditProfileModal onClose={closeEdit} />}
      <ProfileHeader
        editable
        user={{
          fname: fname ?? '',
          username,
          job: job ?? null,
          pfp: pfp ?? '',
          coverPhoto: coverPhoto ?? '',
          onlineStatus,
          friendsCount: friends.length,
          postsCount: userPosts.totalItems ?? postsCount,
        }}
        actions={
          <button type='button' className='profile-button secondary' onClick={() => setEditOpen(true)}>
            Edit profile
          </button>
        }
        tabs={[
          { title: 'Timeline', route: ROUTES.HOME },
          { title: 'Photos', route: '/' + ROUTES.PHOTOS },
          { title: 'Friends', route: '/' + ROUTES.FRIENDS },
        ]}
      />
      <section>
        <Shortcuts />
        <Outlet />
        <FriendsBar />
      </section>
    </div>
  )
}
