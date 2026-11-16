import { NavLink } from 'react-router-dom'
import { appLinks } from '../shared/navLinks'
import './LeftSidebar.scss'

export default function LeftSidebar() {
  return (
    <nav className='LeftSidebar' aria-label='Sections'>
      <ul>
        {
          appLinks.map(link => (
            <li key={link.title}>
              <NavLink to={link.route} end aria-label={link.title}>{link.icon}</NavLink>
              <p className='desc'>{link.title}</p>
            </li>
          ))
        }
      </ul>
    </nav>
  )
}
