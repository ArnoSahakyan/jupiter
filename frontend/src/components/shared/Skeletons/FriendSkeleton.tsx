import './Skeletons.scss'

// Placeholder shaped like a person card.
export default function FriendSkeleton() {
  return (
    <div className='FriendSkeleton' aria-hidden='true'>
      <span className='sk circle' style={{ width: 52, height: 52 }} />
      <span>
        <span className='sk' style={{ width: 130, height: 11 }} />
        <span className='sk' style={{ width: 80, height: 9 }} />
      </span>
    </div>
  )
}
