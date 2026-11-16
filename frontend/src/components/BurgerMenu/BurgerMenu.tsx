import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ROUTES from '../../routes/routes';
import SearchUser from '../SearchUser/SearchUser';
import { appLinks } from '../shared/navLinks';
import useAuth from '../../hooks/useAuth';
import { getName, getPfp, getStatus } from '../../store/features/userInfo/userInfoSlice';
import StatusSwitch from '../shared/StatusSwitch/StatusSwitch';
import { IconClose, IconEdit, IconLogout } from '../shared/Icons/MenuIcons';
import './BurgerMenu.scss';

// Mobile header (up to 767px): logo, menu button and user search, plus a
// drawer with your profile, the app's sections, your status and account actions.
export default function BurgerMenu({ onEditProfile }: { onEditProfile: () => void }) {
  const [open, setOpen] = useState(false);
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
            <IconClose />
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
          <StatusSwitch />
        </div>

        <div className="BurgerMenu__actions">
          <button type="button" onClick={() => { setOpen(false); onEditProfile(); }}>
            <IconEdit />
            Edit profile
          </button>
          <button type="button" className="logout" onClick={() => { setOpen(false); logout(); }}>
            <IconLogout />
            Log out
          </button>
        </div>
      </aside>
    </div>
  );
}
