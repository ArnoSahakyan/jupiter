import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ROUTES from '../../routes/routes';
import SearchUser from '../SearchUser/SearchUser';
import { appLinks } from '../shared/navLinks';
import useAuth from '../../hooks/useAuth';
import { AppDispatch } from '../../store/setup';
import { getName, getPfp, getStatus } from '../../store/features/userInfo/userInfoSlice';
import { changeOnlineStatus } from '../../store/features/userInfo/userThunks';
import './BurgerMenu.scss';

const STATUSES = ['online', 'away', 'offline'];

// Mobile header (up to 767px): logo, menu button and user search, plus a
// drawer with your profile, the app's sections, your status and account actions.
export default function BurgerMenu({ onEditProfile }: { onEditProfile: () => void }) {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { logout } = useAuth();
  const location = useLocation();
  const name = useSelector(getName);
  const pfp = useSelector(getPfp);
  const status = useSelector(getStatus);

  // Close when navigating to another page.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Close when the screen becomes wide enough for the desktop navbar (e.g. a
  // tablet rotated to landscape); otherwise the page would stay scroll-locked.
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)');
    const closeIfDesktop = () => desktop.matches && setOpen(false);
    desktop.addEventListener('change', closeIfDesktop);
    window.addEventListener('resize', closeIfDesktop);
    return () => {
      desktop.removeEventListener('change', closeIfDesktop);
      window.removeEventListener('resize', closeIfDesktop);
    };
  }, []);

  // While open: Escape closes it and the page behind doesn't scroll.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <div className="BurgerMenu">
      <header className="BurgerMenu__bar">
        <Link to={ROUTES.NEWSFEED} className="BurgerMenu__logo">
          <img src="/logo-light.svg" alt="Jupiter" />
        </Link>
        <button
          type="button"
          className={`BurgerMenu__toggle ${open ? 'open' : ''}`}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(!open)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <SearchUser />

      <div className={`BurgerMenu__backdrop ${open ? 'open' : ''}`} onClick={() => setOpen(false)} />

      <aside id="mobile-menu" className={`BurgerMenu__drawer ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="BurgerMenu__drawer-top">
          <img src="/logo.svg" alt="Jupiter" className="BurgerMenu__drawer-logo" />
          <button type="button" className="BurgerMenu__close" aria-label="Close menu" onClick={() => setOpen(false)}>
            <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor" aria-hidden="true">
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
            </svg>
          </button>
        </div>

        <Link to={ROUTES.HOME} className="BurgerMenu__profile">
          <span className={`BurgerMenu__avatar ${status ?? ''}`}>
            <img src={pfp} alt="" />
          </span>
          <span className="BurgerMenu__profile-text">
            <strong>{name}</strong>
            <span>View your profile</span>
          </span>
        </Link>

        <nav aria-label="Sections">
          <ul className="BurgerMenu__links">
            {appLinks.map(link => (
              <li key={link.title}>
                <NavLink to={link.route} end>
                  <span className="icon">{link.icon}</span>
                  {link.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="BurgerMenu__status">
          <p>Status</p>
          <div role="group" aria-label="Online status">
            {STATUSES.map(option => (
              <button
                key={option}
                type="button"
                className={`${option} ${status === option ? 'selected' : ''}`}
                aria-pressed={status === option}
                onClick={() => dispatch(changeOnlineStatus({ onlineStatus: option }))}
              >
                <span className="dot" />
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="BurgerMenu__actions">
          <button type="button" onClick={() => { setOpen(false); onEditProfile(); }}>
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
              <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325" />
            </svg>
            Edit profile
          </button>
          <button type="button" className="logout" onClick={() => { setOpen(false); logout(); }}>
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z" />
              <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z" />
            </svg>
            Log out
          </button>
        </div>
      </aside>
    </div>
  );
}
