import { Link, NavLink } from 'react-router-dom'
import ROUTES from '../../routes/routes'
import './Footer.scss'

const footerLinks = [
  { title: 'News Feed', route: ROUTES.NEWSFEED },
  { title: 'My Timeline', route: ROUTES.HOME },
  { title: 'Photos', route: '/' + ROUTES.PHOTOS },
  { title: 'Friends', route: '/' + ROUTES.FRIENDS },
  { title: 'Messages', route: '/' + ROUTES.MESSAGES },
]

export default function Footer() {
  const scrollToTop = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <footer className='Footer'>
      <div className='Footer__inner'>
        <div className='Footer__top'>
          <div className='Footer__brand'>
            <Link to={ROUTES.NEWSFEED} aria-label='Jupiter home'>
              <img src='/logo.svg' alt='Jupiter' />
            </Link>
            <p>A small social network for students: share what you're working on, keep up with friends and chat in real time.</p>
          </div>

          <nav aria-label='Footer'>
            <ul className='Footer__links'>
              {footerLinks.map(link => (
                <li key={link.title}>
                  <NavLink to={link.route} end>{link.title}</NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className='Footer__bottom'>
          <p>© {new Date().getFullYear()} Jupiter</p>
          <button type='button' className='Footer__to-top' onClick={scrollToTop}>
            Back to top
            <svg viewBox='0 0 16 16' width='14' height='14' fill='currentColor' aria-hidden='true'>
              <path fillRule='evenodd' d='M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5' />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  )
}
