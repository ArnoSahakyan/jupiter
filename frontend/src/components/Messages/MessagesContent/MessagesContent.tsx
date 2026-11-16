import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import io, { Socket } from 'socket.io-client'
import { TFriendBack, getFriendsBack, getFriendsLoading, getMessagesLoading, receiveMessage } from '../../../store/features/friends/friendsSlice'
import { getFriendsApi, getMessages } from '../../../store/features/friends/friendThunks'
import { getAccessToken, getUserID } from '../../../store/features/userInfo/userInfoSlice'
import { AppDispatch } from '../../../store/setup'
import { SOCKET_URL } from '../../../api/config'
import { profilePath } from '../../../routes/routes'
import { formatMessageTime } from '../../../hooks/dateFormat'
import SecondaryLoader from '../../shared/SecondaryLoader/SecondaryLoader'
import MessageChat from '../MessageChat/MessageChat'
import MessageInput from '../MessageInput/MessageInput'
import './MessagesContent.scss'

const STATUS_LABEL: Record<string, string> = { online: 'Online', away: 'Away', offline: 'Offline' }

// "Today", "Yesterday" or "Nov 14" (with the year if it's not this year).
const dayLabel = (value?: string) => {
  if (!value) return ''
  const date = new Date(value)
  const today = new Date()
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return new Intl.DateTimeFormat('en-US', date.getFullYear() === today.getFullYear()
    ? { weekday: 'short', month: 'short', day: 'numeric' }
    : { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

export default function MessagesContent() {
  const dispatch = useDispatch<AppDispatch>()
  const friends = useSelector(getFriendsBack)
  const friendsLoading = useSelector(getFriendsLoading)
  const messageLoading = useSelector(getMessagesLoading)
  const userId = useSelector(getUserID)
  const token = useSelector(getAccessToken)
  const location = useLocation()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  // phones show either the list or the open chat
  const [mobileChatOpen, setMobileChatOpen] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)
  const requestedFriendId = (location.state as { friendId?: number } | null)?.friendId

  // Friends (with their online status) may not be loaded yet on this page.
  useEffect(() => {
    dispatch(getFriendsApi())
  }, [dispatch])

  useEffect(() => {
    const newSocket = io(SOCKET_URL, { auth: { token } })
    newSocket.on('receive_message', (data) => dispatch(receiveMessage(data)))
    setSocket(newSocket)
    return () => {
      newSocket.disconnect()
    }
  }, [dispatch, token])

  const selected = friends.find(friend => friend.id === selectedId)

  const openChat = (friend: TFriendBack) => {
    setSelectedId(friend.id)
    setMobileChatOpen(true)
    dispatch(getMessages(friend.id))
  }

  // Start on the friend you came from ("Message" on a profile), else the first one.
  useEffect(() => {
    if (selectedId !== null || friends.length === 0) return
    const start = friends.find(friend => friend.id === requestedFriendId) ?? friends[0]
    setSelectedId(start.id)
    setMobileChatOpen(requestedFriendId !== undefined)
    dispatch(getMessages(start.id))
  }, [friends, selectedId, requestedFriendId, dispatch])

  // Join the open chat's room (again after the socket reconnects).
  useEffect(() => {
    if (socket && selected) socket.emit('join_room', selected.friendshipId)
  }, [socket, selected?.friendshipId]) // eslint-disable-line react-hooks/exhaustive-deps

  const messages = useMemo(() => selected?.messages ?? [], [selected])

  // Keep the newest message in view.
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages.length, selectedId, messageLoading])

  const shownFriends = friends.filter(friend =>
    `${friend.fname} ${friend.username}`.toLowerCase().includes(search.trim().toLowerCase()))

  if (!friendsLoading && friends.length === 0) {
    return (
      <div className='MessagesContent MessagesContent--empty'>
        <h2>No conversations yet</h2>
        <p>Add friends to start chatting with them here.</p>
        <Link to='/friends'>Find people</Link>
      </div>
    )
  }

  return (
    <div className={`MessagesContent ${mobileChatOpen ? 'chat-open' : ''}`}>
      <aside className='MessagesContent__list' aria-label='Conversations'>
        <div className='MessagesContent__list-header'>
          <h1>Messages</h1>
          <input
            type='search'
            placeholder='Search friends'
            aria-label='Search friends'
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <ul>
          {shownFriends.map(friend => (
            <li key={friend.id}>
              <button
                type='button'
                className={friend.id === selectedId ? 'active' : ''}
                aria-current={friend.id === selectedId}
                onClick={() => openChat(friend)}
              >
                <span className={`avatar ${friend.onlineStatus}`}><img src={friend.pfp} alt='' /></span>
                <span className='text'>
                  <strong>{friend.fname}</strong>
                  <span>{STATUS_LABEL[friend.onlineStatus] ?? friend.onlineStatus}</span>
                </span>
              </button>
            </li>
          ))}
          {shownFriends.length === 0 && <li className='none'>No friends match “{search}”</li>}
        </ul>
      </aside>

      <section className='MessagesContent__chat' aria-label={selected ? `Chat with ${selected.fname}` : 'Chat'}>
        {selected ? (
          <>
            <header className='MessagesContent__chat-header'>
              <button type='button' className='back' aria-label='Back to conversations' onClick={() => setMobileChatOpen(false)}>
                <svg viewBox='0 0 16 16' width='18' height='18' fill='currentColor' aria-hidden='true'>
                  <path fillRule='evenodd' d='M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8' />
                </svg>
              </button>
              <Link to={profilePath(selected.id, userId)} className='profile-link who'>
                <span className={`avatar ${selected.onlineStatus}`}><img src={selected.pfp} alt='' /></span>
                <span className='text'>
                  <strong>{selected.fname}</strong>
                  <span>{STATUS_LABEL[selected.onlineStatus] ?? selected.onlineStatus}</span>
                </span>
              </Link>
            </header>

            <div className='MessagesContent__messages' ref={chatRef} aria-live='polite'>
              {messageLoading && messages.length === 0 ? (
                <div className='center'><SecondaryLoader /></div>
              ) : messages.length === 0 ? (
                <div className='center hello'>
                  <img src={selected.pfp} alt='' />
                  <strong>Say hi to {selected.fname.split(' ')[0]}</strong>
                  <span>Messages you send appear here.</span>
                </div>
              ) : messages.map((message, index) => {
                const previous = messages[index - 1]
                const next = messages[index + 1]
                const day = dayLabel(message.createdAt)
                const newDay = !previous || dayLabel(previous.createdAt) !== day
                const lastInGroup = !next || next.senderId !== message.senderId || dayLabel(next.createdAt) !== day
                return (
                  <Fragment key={message.messageId}>
                    {newDay && day && <div className='day'><span>{day}</span></div>}
                    <MessageChat
                      content={message}
                      user={selected}
                      own={message.senderId == userId}
                      lastInGroup={lastInGroup}
                      time={message.createdAt ? formatMessageTime(message.createdAt) : undefined}
                    />
                  </Fragment>
                )
              })}
            </div>

            <MessageInput friend={selected} socket={socket} />
          </>
        ) : (
          <div className='center'><SecondaryLoader /></div>
        )}
      </section>
    </div>
  )
}
