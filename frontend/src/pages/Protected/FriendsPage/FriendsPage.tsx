import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { getFriendsBack, getFriendsLoading, getRequests, getRespondLoading, getUnassociated } from '../../../store/features/friends/friendsSlice'
import { deleteFriend, getFriendsApi, getRequestsApi, getUnassociatedApi, respondRequest, sendRequest } from '../../../store/features/friends/friendThunks'
import { AppDispatch } from '../../../store/setup'
import PersonCard from '../../../components/PersonCard/PersonCard'
import FriendSkeleton from '../../../components/shared/Skeletons/FriendSkeleton'
import ROUTES from '../../../routes/routes'
import { mutualLabel } from '../../../hooks/mutualLabel'
import './FriendsPage.scss'

type Tab = 'friends' | 'requests' | 'find'

const matches = (query: string, ...fields: (string | null | undefined)[]) =>
  fields.some(field => field?.toLowerCase().includes(query.trim().toLowerCase()))

// Your friends, friend requests, and people to add.
export default function FriendsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const friends = useSelector(getFriendsBack)
  const requests = useSelector(getRequests)
  const people = useSelector(getUnassociated)
  const loading = useSelector(getFriendsLoading)
  const respond = useSelector(getRespondLoading)
  const startTab = (useLocation().state as { tab?: Tab } | null)?.tab
  const [tab, setTab] = useState<Tab>(startTab ?? 'friends')
  const [query, setQuery] = useState('')
  const [confirming, setConfirming] = useState<number | null>(null)
  const [sent, setSent] = useState<Set<number>>(new Set())

  useEffect(() => {
    dispatch(getRequestsApi())
  }, [dispatch])

  useEffect(() => {
    if (tab === 'find') dispatch(getUnassociatedApi())
    setQuery('')
    setConfirming(null)
  }, [tab, dispatch])

  const busy = (id: number) => respond.loading && respond.userId === id

  const accept = (senderId: number) =>
    dispatch(respondRequest({ senderId, status: 'accepted' })).then(() => dispatch(getFriendsApi()))
  const decline = (senderId: number) => dispatch(respondRequest({ senderId, status: 'rejected' }))
  const add = (id: number) => dispatch(sendRequest(id)).unwrap()
    .then(() => setSent(previous => new Set(previous).add(id)))
    .catch(() => undefined)

  const shownFriends = friends.filter(f => matches(query, f.fname, f.username))
  const shownRequests = requests.filter(r => matches(query, r.fname))
  const shownPeople = people.filter(p => matches(query, p.fname, p.username, p.job))

  const tabs: { id: Tab, label: string, count?: number, highlight?: boolean }[] = [
    { id: 'friends', label: 'Friends', count: friends.length },
    { id: 'requests', label: 'Requests', count: requests.length, highlight: requests.length > 0 },
    { id: 'find', label: 'Find people' },
  ]

  const skeletons = <><FriendSkeleton /><FriendSkeleton /></>
  const empty = (title: string, text: string, action?: { label: string, onClick: () => void }) => (
    <div className='FriendsPage__empty'>
      <strong>{title}</strong>
      <span>{text}</span>
      {action && <button type='button' className='person-button primary' onClick={action.onClick}>{action.label}</button>}
    </div>
  )
  const noMatch = <div className='FriendsPage__empty'><strong>No one matches “{query}”</strong></div>

  return (
    <div className='FriendsPage'>
      <div className='FriendsPage__header'>
        <h2>Friends</h2>
        <div className='FriendsPage__tabs' role='tablist' aria-label='Friends sections'>
          {tabs.map(t => (
            <button
              key={t.id}
              type='button'
              role='tab'
              aria-selected={tab === t.id}
              className={tab === t.id ? 'active' : ''}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              {t.count !== undefined && <span className={`count ${t.highlight ? 'highlight' : ''}`}>{t.count}</span>}
            </button>
          ))}
        </div>
        <input
          type='search'
          className='FriendsPage__search'
          placeholder={tab === 'find' ? 'Search people' : tab === 'requests' ? 'Search requests' : 'Search friends'}
          aria-label='Search this list'
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      <div className='FriendsPage__list' role='tabpanel'>
        {tab === 'friends' && (
          loading && friends.length === 0 ? skeletons
            : friends.length === 0 ? empty('No friends yet', 'Find people you know and send them a request.', { label: 'Find people', onClick: () => setTab('find') })
              : shownFriends.length === 0 ? noMatch
                : shownFriends.map(friend => (
                  <PersonCard
                    key={friend.id}
                    id={friend.id}
                    name={friend.fname}
                    pfp={friend.pfp}
                    detail={friend.job || `@${friend.username}`}
                    status={friend.onlineStatus}
                    actions={confirming === friend.id ? (
                      <>
                        <button type='button' className='person-button danger' disabled={busy(friend.id)} onClick={() => dispatch(deleteFriend(friend.id)).then(() => setConfirming(null))}>Remove</button>
                        <button type='button' className='person-button ghost' onClick={() => setConfirming(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button type='button' className='person-button secondary' onClick={() => navigate('/' + ROUTES.MESSAGES, { state: { friendId: friend.id } })}>Message</button>
                        <button type='button' className='person-button ghost' onClick={() => setConfirming(friend.id)} aria-label={`Unfriend ${friend.fname}`}>Unfriend</button>
                      </>
                    )}
                  />
                ))
        )}

        {tab === 'requests' && (
          loading && requests.length === 0 ? skeletons
            : requests.length === 0 ? empty('No pending requests', 'When someone sends you a friend request, it shows up here.')
              : shownRequests.length === 0 ? noMatch
                : shownRequests.map(request => (
                  <PersonCard
                    key={request.requestId}
                    id={request.senderId}
                    name={request.fname}
                    pfp={request.pfp}
                    detail='Wants to be your friend'
                    actions={<>
                      <button type='button' className='person-button primary' disabled={busy(request.senderId)} onClick={() => accept(request.senderId)}>Accept</button>
                      <button type='button' className='person-button secondary' disabled={busy(request.senderId)} onClick={() => decline(request.senderId)}>Decline</button>
                    </>}
                  />
                ))
        )}

        {tab === 'find' && (
          loading && people.length === 0 ? skeletons
            : people.length === 0 ? empty('You know everyone here', 'There’s no one left to add right now. Check back later.')
              : shownPeople.length === 0 ? noMatch
                : shownPeople.map(person => (
                  <PersonCard
                    key={person.id}
                    id={person.id}
                    name={person.fname}
                    pfp={person.pfp}
                    detail={[person.job, mutualLabel(person.mutualFriends)].filter(Boolean).join(' · ') || `@${person.username}`}
                    actions={sent.has(person.id)
                      ? <button type='button' className='person-button secondary' disabled>Request sent</button>
                      : <button type='button' className='person-button primary' disabled={busy(person.id)} onClick={() => add(person.id)}>Add friend</button>}
                  />
                ))
        )}
      </div>
    </div>
  )
}
