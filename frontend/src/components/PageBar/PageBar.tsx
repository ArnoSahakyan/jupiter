import { NavLink } from 'react-router-dom'
import ROUTES from '../../routes/routes'
import './PageBar.scss'
import { useSelector } from 'react-redux'
import { getJob, getName, getPfp, } from '../../store/features/userInfo/userInfoSlice'

type PageBarProps = {
  // someone else's profile; omit for your own
  user?: { pfp: string; fname: string; job: string | null };
  links?: { title: string; route: string }[];
};

export default function PageBar({ user, links }: PageBarProps) {
  const ownPfp = useSelector(getPfp)
  const ownJob = useSelector(getJob)
  const ownName = useSelector(getName)
  const pfp = user ? user.pfp : ownPfp;
  const job = user ? user.job : ownJob;
  const fname = user ? user.fname : ownName;

  const pages = links ? links.map((link, id) => ({ id, ...link })) : [
    {
      id: 0,
      title: 'Timeline',
      route: ROUTES.HOME
    },
    {
      id: 1,
      title: 'Photos',
      route: ROUTES.PHOTOS
    },
    {
      id: 2,
      title: 'Friends',
      route: ROUTES.FRIENDS
    },
  ]

  return (
    <div className='PageBar'>
      <div className="PageBar__user">
        <div className="pfp">
          <img src={pfp} alt={fname ?? 'profile picture'} />
          {!user && <label htmlFor="upload-pfp" className='editpfp'>Edit Display Photo</label>}
        </div>
        <div className="name">
          <h3>{fname}</h3>
          <span>{job}</span>
        </div>
      </div>
      <div className="PageBar__menu">
        {
          pages.map(page => {
            return <NavLink key={page.id} to={page.route} end>{page.title}</NavLink>
          })
        }
      </div>
    </div>
  )
}
