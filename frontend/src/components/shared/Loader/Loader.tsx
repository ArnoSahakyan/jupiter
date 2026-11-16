import './Loader.scss'

// Full-page loading state: a small planet with an orbiting moon.
export default function Loader() {
  return (
    <div className='loader' role='status' aria-label='Loading'>
      <span className='loader__orbit'>
        <span className='loader__planet' />
        <span className='loader__moon' />
      </span>
    </div>
  )
}
