import { TFriendBack, TMessages } from '../../../store/features/friends/friendsSlice'
import './MessageChat.scss'

interface IMessageChat {
  content: TMessages;
  user: TFriendBack;
  own: boolean;
  lastInGroup: boolean; // last of several messages in a row from the same person
  time?: string;
}

// One chat bubble. Your messages sit on the right in violet; the friend's
// photo is shown next to the last message of each run of theirs.
export default function MessageChat({ content, user, own, lastInGroup, time }: IMessageChat) {
  return (
    <div className={`MessageChat ${own ? 'own' : 'theirs'} ${lastInGroup ? 'last' : ''}`}>
      {!own && (
        <span className='MessageChat__avatar'>{lastInGroup && <img src={user.pfp} alt='' />}</span>
      )}
      <div className='MessageChat__bubble'>
        <p>{content.message}</p>
        {lastInGroup && time && <time dateTime={content.createdAt}>{time}</time>}
      </div>
    </div>
  )
}
