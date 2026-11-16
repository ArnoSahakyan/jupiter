import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { getUserID } from '../../store/features/userInfo/userInfoSlice'
import { profilePath } from '../../routes/routes'
import './PersonCard.scss'

// A person in a list (friends, requests, suggestions): photo, name, a line
// of detail, and optional action buttons.
export default function PersonCard({ id, name, pfp, detail, status, actions }: {
  id: number
  name: string
  pfp: string
  detail?: string | null
  status?: string
  actions?: ReactNode
}) {
  const ownId = useSelector(getUserID)
  const link = profilePath(id, ownId)
  return (
    <div className='PersonCard'>
      <Link to={link} className='profile-link PersonCard__who'>
        <span className={`PersonCard__avatar ${status ?? ''}`}>
          <img src={pfp} alt='' />
        </span>
        <span className='PersonCard__text'>
          <strong>{name}</strong>
          {detail && <span title={detail}>{detail}</span>}
        </span>
      </Link>
      {actions && <div className='PersonCard__actions'>{actions}</div>}
    </div>
  )
}
