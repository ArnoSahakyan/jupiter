import { Link } from 'react-router-dom'
import Title from '../shared/Title/Title'
import ROUTES from '../../routes/routes'
import './Footer.scss'

const exploreLinks = [
  { title: 'News Feed', route: ROUTES.NEWSFEED },
  { title: 'My Timeline', route: ROUTES.HOME },
  { title: 'Photos', route: '/' + ROUTES.PHOTOS },
  { title: 'Friends', route: '/' + ROUTES.FRIENDS },
  { title: 'Messages', route: '/' + ROUTES.MESSAGES },
]

const projectLinks = [
  { title: 'Frontend source', href: 'https://github.com/ArnoSahakyan/winku' },
  { title: 'Backend source', href: 'https://github.com/ArnoSahakyan/winkuback' },
]

export default function Footer() {
  return (
    <footer className='FooterBG'>
      <div className="Footer">
        <div className="Footer__info">
          <img src="/logo.svg" alt='Jupiter' />
          <p>Jupiter is a small social network for students: share what you are working on, keep up with friends and chat in real time.</p>
        </div>

        <ul className='Footer__navigate Footer-ul'>
          <Title title={<>Explore</>} />
          {exploreLinks.map(link => (
            <li key={link.title}><Link to={link.route}>{link.title}</Link></li>
          ))}
        </ul>

        <ul className='Footer__links Footer-ul'>
          <Title title={<>Project</>} />
          {projectLinks.map(link => (
            <li key={link.title}>
              <span>&#xF3ED;</span>
              <a href={link.href} target="_blank" rel="noopener noreferrer">{link.title}</a>
            </li>
          ))}
        </ul>
      </div>
      <div className="FooterBottom">
        <p>© Jupiter {new Date().getFullYear()}. All rights reserved.</p>
      </div>

    </footer>
  )
}
