import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { TProfile, TProfileFriend, fetchProfileFriends } from '../../../api/profiles';
import { serverMessage } from '../../../api/errors';
import PersonCard from '../../../components/PersonCard/PersonCard';
import FriendSkeleton from '../../../components/shared/Skeletons/FriendSkeleton';
import '../FriendsPage/FriendsPage.scss';

const STATUS_LABEL: Record<string, string> = { online: 'Online', away: 'Away', offline: 'Offline' };

// Friends tab of someone else's profile.
export default function ProfileFriends() {
  const { profile } = useOutletContext<{ profile: TProfile }>();
  const [friends, setFriends] = useState<TProfileFriend[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    setFriends(null);
    setError(null);
    fetchProfileFriends(profile.id).then(setFriends).catch(err => setError(serverMessage(err)));
  }, [profile.id]);

  const firstName = profile.fname.split(' ')[0];
  const shown = (friends ?? []).filter(friend =>
    `${friend.fname} ${friend.username}`.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className='FriendsPage'>
      <div className='FriendsPage__header'>
        <h2>{firstName}'s friends{friends ? ` · ${friends.length}` : ''}</h2>
        {friends && friends.length > 6 && (
          <input type='search' className='FriendsPage__search' placeholder='Search friends' aria-label='Search friends'
            value={query} onChange={e => setQuery(e.target.value)} />
        )}
      </div>
      <div className='FriendsPage__list'>
        {error && <div className='FriendsPage__empty'><strong>{error}</strong></div>}
        {!error && friends === null && <><FriendSkeleton /><FriendSkeleton /></>}
        {friends?.length === 0 && (
          <div className='FriendsPage__empty'>
            <strong>No friends yet</strong>
            <span>{firstName} hasn't added any friends.</span>
          </div>
        )}
        {shown.map(friend => (
          <PersonCard
            key={friend.id}
            id={friend.id}
            name={friend.fname}
            pfp={friend.pfp}
            status={friend.onlineStatus}
            detail={friend.job || STATUS_LABEL[friend.onlineStatus] || `@${friend.username}`}
          />
        ))}
      </div>
    </div>
  );
}
