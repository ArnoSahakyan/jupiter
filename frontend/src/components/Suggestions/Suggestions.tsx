import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getUnassociated } from '../../store/features/friends/friendsSlice'
import { getUnassociatedApi, sendRequest } from '../../store/features/friends/friendThunks'
import { profilePath } from '../../routes/routes'
import { AppDispatch } from '../../store/setup'
import './Suggestions.scss'

const SHOWN = 4

// "People you may know": users you aren't connected to yet.
export default function Suggestions() {
  const dispatch = useDispatch<AppDispatch>()
  const people = useSelector(getUnassociated)
  const [sent, setSent] = useState<Set<number>>(new Set())
  const [pending, setPending] = useState<number | null>(null)

  useEffect(() => {
    dispatch(getUnassociatedApi())
  }, [dispatch])

  if (people.length === 0) return null

  const add = (id: number) => {
    setPending(id)
    dispatch(sendRequest(id)).unwrap()
      .then(() => setSent(previous => new Set(previous).add(id)))
      .catch(() => undefined)
      .finally(() => setPending(null))
  }

  return (
    <div className='Suggestions'>
      <div className='Suggestions__header'>
        <h2>People you may know</h2>
        <Link to='/friends'>See all</Link>
      </div>
      <ul>
        {people.slice(0, SHOWN).map(person => (
          <li key={person.id}>
            <Link to={profilePath(person.id)} className='profile-link Suggestions__person'>
              <img src={person.pfp} alt='' />
              <span>
                <strong>{person.fname}</strong>
                <span>{person.job || `@${person.username}`}</span>
              </span>
            </Link>
            {sent.has(person.id)
              ? <span className='Suggestions__sent'>Sent</span>
              : (
                <button type='button' disabled={pending === person.id} onClick={() => add(person.id)} aria-label={`Add ${person.fname} as a friend`}>
                  Add
                </button>
              )}
          </li>
        ))}
      </ul>
    </div>
  )
}
