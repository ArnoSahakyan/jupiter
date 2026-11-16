import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Post from '../../../components/Post/Post';
import Reload from '../../../components/shared/Reload/Reload';
import PostSkeleton from '../../../components/shared/Skeletons/PostSkeleton';
import { TProfile } from '../../../api/profiles';
import { postGetLoading, profilePostsSelector } from '../../../store/features/post/postSlice';
import { getProfilePosts } from '../../../store/features/post/postThunks';
import { AppDispatch } from '../../../store/setup';
import '../../../components/Feed/Feed.scss';

const LIMIT = 3;

// Timeline tab of someone else's profile.
export default function ProfileFeed() {
  const { profile } = useOutletContext<{ profile: TProfile }>();
  const dispatch = useDispatch<AppDispatch>();
  const posts = useSelector(profilePostsSelector);
  const loading = useSelector(postGetLoading);
  const shown = posts.userId === profile.id ? posts.data : [];

  useEffect(() => {
    dispatch(getProfilePosts({ userId: profile.id, limit: LIMIT, offset: 0 }));
  }, [dispatch, profile.id]);

  const loadMore = () => {
    dispatch(getProfilePosts({ userId: profile.id, limit: LIMIT, offset: posts.offset + LIMIT }));
  };

  return (
    <div className='Feed'>
      <div className="Feed__list">
        {
          (loading && shown.length === 0 && <><PostSkeleton /><PostSkeleton /></>)
          ||
          (shown.length === 0
            ? <p className='no-users'>{profile.fname} hasn't posted anything yet</p>
            : shown.map(post => <Post key={post.postId} postData={post} />))
        }
        {loading && shown.length > 0 && <PostSkeleton />}
        {!loading && shown.length > 0 && posts.totalPages !== undefined && posts.currentPage < posts.totalPages && (
          <Reload func={loadMore} />
        )}
      </div>
    </div>
  );
}
