import { ReactNode, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import SecondaryLoader from '../shared/SecondaryLoader/SecondaryLoader'
import { getLoading } from '../../store/features/userInfo/userInfoSlice'
import { changeUserImage } from '../../store/features/userInfo/userThunks'
import { AppDispatch } from '../../store/setup'
import './ProfileHeader.scss'

export type ProfileHeaderUser = {
  fname: string;
  username?: string;
  job: string | null;
  pfp: string;
  coverPhoto: string;
  onlineStatus?: string;
  friendsCount?: number;
  postsCount?: number;
};

type ProfileHeaderProps = {
  user: ProfileHeaderUser;
  editable?: boolean; // your own profile: change photo / cover
  actions?: ReactNode;
  tabs: { title: string; route: string }[];
};

const IconCamera = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
    <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4z" />
    <path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5m0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M3 6.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0" />
  </svg>
);

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

// Cover, photo, name, stats, actions and tabs for a profile (yours or someone else's).
export default function ProfileHeader({ user, editable = false, actions, tabs }: ProfileHeaderProps) {
  const dispatch = useDispatch<AppDispatch>()
  const upload = useSelector(getLoading)
  const coverInput = useRef<HTMLInputElement>(null)
  const photoInput = useRef<HTMLInputElement>(null)
  const coverUploading = editable && upload.loading && upload.type === 'coverPhoto'
  const photoUploading = editable && upload.loading && upload.type === 'pfp'

  const uploadImage = (type: 'pfp' | 'coverPhoto') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) dispatch(changeUserImage({ file, type }))
    e.target.value = ''
  }

  const stats = [
    user.friendsCount !== undefined && plural(user.friendsCount, 'friend'),
    user.postsCount !== undefined && plural(user.postsCount, 'post'),
  ].filter(Boolean)

  return (
    <header className='ProfileHeader'>
      <div className='ProfileHeader__cover'>
        <img src={user.coverPhoto} alt='' />
        {coverUploading && <div className='ProfileHeader__cover-loading'><SecondaryLoader /></div>}
        {editable && (
          <>
            <button type='button' className='ProfileHeader__cover-button' disabled={coverUploading} onClick={() => coverInput.current?.click()}>
              <IconCamera /> <span>{coverUploading ? 'Uploading…' : 'Change cover'}</span>
            </button>
            <input ref={coverInput} type='file' accept='image/*' hidden onChange={uploadImage('coverPhoto')} />
          </>
        )}
      </div>

      <div className='ProfileHeader__body'>
        <div className='ProfileHeader__main'>
          <div className='ProfileHeader__avatar'>
            <div className='ProfileHeader__photo'>
              {photoUploading ? <SecondaryLoader /> : <img src={user.pfp} alt={user.fname} />}
            </div>
            {user.onlineStatus && <span className={`ProfileHeader__status ${user.onlineStatus}`} title={user.onlineStatus} />}
            {editable && (
              <>
                <button type='button' className='ProfileHeader__photo-button' aria-label='Change profile photo' disabled={photoUploading} onClick={() => photoInput.current?.click()}>
                  <IconCamera />
                </button>
                <input ref={photoInput} type='file' accept='image/*' hidden onChange={uploadImage('pfp')} />
              </>
            )}
          </div>

          <div className='ProfileHeader__info'>
            <h1>{user.fname}</h1>
            <p className='ProfileHeader__meta'>
              {user.username && <span>@{user.username}</span>}
              {user.job && <span>{user.job}</span>}
            </p>
            {stats.length > 0 && <p className='ProfileHeader__stats'>{stats.join(' · ')}</p>}
          </div>

          {actions && <div className='ProfileHeader__actions'>{actions}</div>}
        </div>

        <nav className='ProfileHeader__tabs' aria-label='Profile'>
          {tabs.map(tab => (
            <NavLink key={tab.title} to={tab.route} end>{tab.title}</NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
