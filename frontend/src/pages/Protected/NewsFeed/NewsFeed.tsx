import Feed from '../../../components/Feed/Feed'
import FriendsBar from '../../../components/FriendsBar/FriendsBar'
import ProfileSummary from '../../../components/ProfileSummary/ProfileSummary'
import Suggestions from '../../../components/Suggestions/Suggestions'
import './NewsFeed.scss'

// Your profile on the left, the feed in the middle, friends and
// suggestions on the right (only the feed on phones).
export default function NewsFeed() {
  return (
    <div className='NewsFeed'>
      <div className='NewsFeed__layout'>
        <aside className='NewsFeed__left' aria-label='Your profile'>
          <ProfileSummary />
        </aside>
        <div className='NewsFeed__main'>
          <h1 className='NewsFeed__title'>News Feed</h1>
          <Feed />
        </div>
        <aside className='NewsFeed__right' aria-label='Friends and suggestions'>
          <FriendsBar />
          <Suggestions />
        </aside>
      </div>
    </div>
  )
}
