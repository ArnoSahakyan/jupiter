import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getFriendsBack, getFriendsLoading } from '../../store/features/friends/friendsSlice'
import { getFriendsApi } from '../../store/features/friends/friendThunks'
import { AppDispatch } from '../../store/setup'
import ROUTES, { profilePath } from '../../routes/routes'
import './FriendsBar.scss'

const STATUS_LABEL: Record<string, string> = { online: 'Online', away: 'Away', offline: 'Offline' }
const ORDER: Record<string, number> = { online: 0, away: 1, offline: 2 }

// Your friends, online first, with a quick search. Shown beside profiles and the feed.
export default function FriendsBar({ title = 'Friends' }: { title?: string }) {
  const dispatch = useDispatch<AppDispatch>()
  const friends = useSelector(getFriendsBack)
  const loading = useSelector(getFriendsLoading)
  const [search, setSearch] = useState('')

  useEffect(() => {
    dispatch(getFriendsApi())
  }, [dispatch])

  const query = search.trim().toLowerCase()
  const shown = friends
    .filter(friend => `${friend.fname} ${friend.username}`.toLowerCase().includes(query))
    .sort((a, b) => (ORDER[a.onlineStatus] ?? 3) - (ORDER[b.onlineStatus] ?? 3))
  const onlineCount = friends.filter(friend => friend.onlineStatus === 'online').length

  return (
    <div className='FriendsBar'>
      <div className='FriendsBar__header'>
        <h2>
          {title} {friends.length > 0 && <span className='count'>{friends.length}</span>}
        </h2>
        <Link to={'/' + ROUTES.FRIENDS}>See all</Link>
      </div>

      {friends.length > 0 && (
        <>
          {onlineCount > 0 && <p className='FriendsBar__online'><span className='dot' />{onlineCount} online now</p>}
          {friends.length > 4 && (
            <input
              type='search'
              className='FriendsBar__search'
              placeholder='Search friends'
              aria-label='Search friends'
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          )}
        </>
      )}

      {loading && friends.length === 0 ? (
        <ul className='FriendsBar__list' aria-hidden='true'>
          {[0, 1, 2].map(i => (
            <li key={i} className='FriendsBar__skeleton'><span className='circle' /><span className='lines'><span /><span /></span></li>
          ))}
        </ul>
      ) : friends.length === 0 ? (
        <div className='FriendsBar__empty'>
          <p>No friends yet. Find classmates and send them a request.</p>
          <Link to={'/' + ROUTES.FRIENDS} state={{ tab: 'find' }}>Find people</Link>
        </div>
      ) : shown.length === 0 ? (
        <p className='FriendsBar__none'>No friends match “{search.trim()}”</p>
      ) : (
        <ul className='FriendsBar__list'>
          {shown.map(friend => (
            <li key={friend.id}>
              <Link to={profilePath(friend.id)} className='profile-link FriendsBar__row'>
                <span className={`avatar ${friend.onlineStatus}`}><img src={friend.pfp} alt='' /></span>
                <span className='text'>
                  <strong>{friend.fname}</strong>
                  <span>{STATUS_LABEL[friend.onlineStatus] ?? `@${friend.username}`}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
