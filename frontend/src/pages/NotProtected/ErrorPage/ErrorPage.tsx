import { Link, isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom'
import ROUTES from '../../../routes/routes'
import './ErrorPage.scss'

// A small banded planet with a moon, drawn inline so it follows the palette.
const Planet = () => (
  <svg className='ErrorPage__planet' viewBox='0 0 200 200' aria-hidden='true'>
    <defs>
      <clipPath id='error-planet'><circle cx='100' cy='100' r='62' /></clipPath>
      <radialGradient id='error-shade' cx='35%' cy='30%' r='75%'>
        <stop offset='0' stopColor='#fff' stopOpacity='0.35' />
        <stop offset='1' stopColor='#170c30' stopOpacity='0.35' />
      </radialGradient>
    </defs>
    <ellipse cx='100' cy='108' rx='96' ry='22' className='ring back' />
    <g clipPath='url(#error-planet)'>
      <rect x='30' y='30' width='140' height='140' className='band b1' />
      <rect x='30' y='62' width='140' height='16' className='band b2' />
      <rect x='30' y='90' width='140' height='10' className='band b3' />
      <rect x='30' y='118' width='140' height='20' className='band b2' />
      <rect x='30' y='146' width='140' height='8' className='band b3' />
      <ellipse cx='122' cy='126' rx='14' ry='8' className='spot' />
      <circle cx='100' cy='100' r='62' fill='url(#error-shade)' />
    </g>
    <path d='M4 108 A96 22 0 0 0 196 108' className='ring front' />
    <circle cx='172' cy='36' r='9' className='moon' />
  </svg>
)

export default function ErrorPage() {
  const error = useRouteError()
  const navigate = useNavigate()
  const notFound = isRouteErrorResponse(error) && error.status === 404

  const detail = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`.trim()
    : error instanceof Error ? error.message : null

  return (
    <main className='ErrorPage'>
      <Link to={ROUTES.HOME} className='ErrorPage__logo'><img src='/logo-light.svg' alt='Jupiter' /></Link>
      <div className='ErrorPage__content'>
        <Planet />
        <p className='ErrorPage__code'>{notFound ? '404' : 'Error'}</p>
        <h1>{notFound ? 'Lost in orbit' : 'Something went wrong'}</h1>
        <p className='ErrorPage__text'>
          {notFound
            ? "The page you're looking for doesn't exist or has moved."
            : 'An unexpected error happened. Try again, or head back home.'}
        </p>
        {!notFound && detail && <p className='ErrorPage__detail'>{detail}</p>}
        <div className='ErrorPage__actions'>
          <Link to={ROUTES.HOME} className='primary'>Back to home</Link>
          {notFound
            ? <button type='button' onClick={() => navigate(-1)}>Go back</button>
            : <button type='button' onClick={() => window.location.reload()}>Try again</button>}
        </div>
      </div>
    </main>
  )
}
