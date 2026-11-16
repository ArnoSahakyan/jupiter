import './Skeletons.scss'

// Placeholder for a comment that's being posted.
export default function CommentSkeleton() {
  return (
    <div className='CommentSkeleton' aria-hidden='true'>
      <span className='sk circle' style={{ width: 32, height: 32 }} />
      <span>
        <span className='sk' style={{ width: 110, height: 10 }} />
        <span className='sk' style={{ width: 180, height: 10 }} />
      </span>
    </div>
  )
}
