import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { TProfile, TProfileFriend, fetchProfileFriends } from '../../../api/profiles';
import { serverMessage } from '../../../api/errors';
import { getUserID } from '../../../store/features/userInfo/userInfoSlice';
import { profilePath } from '../../../routes/routes';
import FriendSkeleton from '../../../components/shared/Skeletons/FriendSkeleton';
import Title from '../../../components/shared/Title/Title';
import '../FriendsPage/FriendsPage.scss';
import '../FriendsPage/FriendBar.scss';

// Friends tab of someone else's profile.
export default function ProfileFriends() {
  const { profile } = useOutletContext<{ profile: TProfile }>();
  const ownId = useSelector(getUserID);
  const [friends, setFriends] = useState<TProfileFriend[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFriends(null);
    fetchProfileFriends(profile.id).then(setFriends).catch(err => setError(serverMessage(err)));
  }, [profile.id]);

  return (
    <div className='FriendsPage'>
      <Title title={<>{profile.fname}'s friends</>} />
      <div className='FriendsPage__list'>
        {error && <p className='no-users'>{error}</p>}
        {!error && friends === null && <><FriendSkeleton /><FriendSkeleton /></>}
        {friends?.length === 0 && <p className='no-users'>No friends yet</p>}
        {friends?.map(friend => (
          <Link key={friend.id} to={profilePath(friend.id, ownId)} className='FriendBar profile-link'>
            <div className='FriendBar__content'>
              <img src={friend.pfp} alt={friend.fname} />
              <div className='name'>
                <h5>{friend.fname}</h5>
                {friend.job && <span>{friend.job}</span>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
