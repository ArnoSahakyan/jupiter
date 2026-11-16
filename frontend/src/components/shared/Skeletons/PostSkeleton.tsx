import './Skeletons.scss'

// Placeholder shaped like a post card.
export default function PostSkeleton() {
  return (
    <div className='PostSkeleton' aria-hidden='true'>
      <div className='PostSkeleton__header'>
        <span className='sk circle' style={{ width: 44, height: 44 }} />
        <span className='PostSkeleton__lines'>
          <span className='sk' style={{ width: 140, height: 11 }} />
          <span className='sk' style={{ width: 80, height: 9 }} />
        </span>
      </div>
      <span className='PostSkeleton__lines'>
        <span className='sk' style={{ width: '92%', height: 11 }} />
        <span className='sk' style={{ width: '64%', height: 11 }} />
      </span>
      <span className='sk PostSkeleton__image' />
    </div>
  )
}
