import { useCallback, useEffect, useState } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ProfileCover from '../../../components/ProfileCover/ProfileCover';
import PageBar from '../../../components/PageBar/PageBar';
import Shortcuts from '../../../components/Shortcuts/Shortcuts';
import FriendsBar from '../../../components/FriendsBar/FriendsBar';
import SecondaryLoader from '../../../components/shared/SecondaryLoader/SecondaryLoader';
import { TProfile, fetchProfile } from '../../../api/profiles';
import { serverMessage } from '../../../api/errors';
import { getUserID } from '../../../store/features/userInfo/userInfoSlice';
import { respondRequest, sendRequest } from '../../../store/features/friends/friendThunks';
import { AppDispatch } from '../../../store/setup';
import ROUTES from '../../../routes/routes';
import '../HomePage/HomePage.scss';
import './UserProfile.scss';

// Someone else's profile: /user/:id, with Timeline / Photos / Friends tabs.
export default function UserProfile() {
  const { id } = useParams();
  const userId = Number(id);
  const ownId = useSelector(getUserID);
  const navigate = useNavigate();
  const [profile, setProfile] = useState<TProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    return fetchProfile(userId)
      .then(setProfile)
      .catch(err => setError(serverMessage(err)));
  }, [userId]);

  useEffect(() => {
    if (userId === ownId) {
      navigate(ROUTES.HOME, { replace: true }); // your own profile is the home page
      return;
    }
    setProfile(null);
    load();
  }, [userId, ownId, navigate, load]);

  if (error) {
    return <div className='HomePage UserProfile'><p className='no-users UserProfile__error'>{error}</p></div>;
  }
  if (!profile || profile.id !== userId) {
    return <div className='HomePage UserProfile'><div className='UserProfile__loading'><SecondaryLoader /></div></div>;
  }

  const base = `/user/${profile.id}`;
  return (
    <div className='HomePage UserProfile'>
      <ProfileCover user={profile} actions={<ProfileActions profile={profile} onChange={load} />} />
      <PageBar
        user={profile}
        links={[
          { title: 'Timeline', route: base },
          { title: 'Photos', route: `${base}/photos` },
          { title: 'Friends', route: `${base}/friends` },
        ]}
      />
      <section>
        <Shortcuts />
        <Outlet context={{ profile }} />
        <FriendsBar />
      </section>
    </div>
  );
}

function ProfileActions({ profile, onChange }: { profile: TProfile; onChange: () => void }) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const run = (action: Promise<unknown>) => {
    setBusy(true);
    action.then(onChange).catch(() => undefined).finally(() => setBusy(false));
  };

  const count = `${profile.friendsCount} ${profile.friendsCount === 1 ? 'friend' : 'friends'}`;

  return (
    <>
      <p>{count}</p>
      {profile.relationship === 'none' && (
        <button className='addfriend' disabled={busy} onClick={() => run(dispatch(sendRequest(profile.id)).unwrap())}>
          Add Friend
        </button>
      )}
      {profile.relationship === 'request_sent' && (
        <button className='addfriend' disabled>Request Sent</button>
      )}
      {profile.relationship === 'request_received' && (
        <button className='addfriend' disabled={busy} onClick={() => run(dispatch(respondRequest({ senderId: profile.id, status: 'accepted' })).unwrap())}>
          Accept Request
        </button>
      )}
      {profile.relationship === 'friends' && (
        <button className='addfriend' onClick={() => navigate('/' + ROUTES.MESSAGES, { state: { friendId: profile.id } })}>
          Message
        </button>
      )}
    </>
  );
}
