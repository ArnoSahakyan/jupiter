import './Navigation.scss';
import { useSelector } from 'react-redux';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import ROUTES from '../../routes/routes';
import BurgerMenu from '../BurgerMenu/BurgerMenu';
import { getName, getPfp, getStatus, getUsername } from '../../store/features/userInfo/userInfoSlice';
import useAuth from '../../hooks/useAuth';
import Modal from '../shared/Modal/Modal'
import EditForm from '../EditForm/EditForm';
import SearchUser from '../SearchUser/SearchUser';
import StatusSwitch from '../shared/StatusSwitch/StatusSwitch';
import { appLinks } from '../shared/navLinks';
import { IconChevronDown, IconEdit, IconLogout, IconUser } from '../shared/Icons/MenuIcons';

// Sections shown in the top bar (Photos is a tab on your profile).
const NAV_SECTIONS = ['News Feed', 'My Timeline', 'Friends', 'Messages'];
const navLinks = appLinks.filter(link => NAV_SECTIONS.includes(link.title));

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const status = useSelector(getStatus);
  const pfp = useSelector(getPfp);
  const name = useSelector(getName);
  const username = useSelector(getUsername);
  const { logout } = useAuth();
  const location = useLocation();
  const accountRef = useRef<HTMLDivElement>(null);

  const toggleEdit = () => setEditOpen(!editOpen);

  // The account menu closes on outside click, Escape, or navigating.
  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      {editOpen && (
        <Modal toggleModal={toggleEdit} isOpen={editOpen}>
          <div className="EditForm">
            <h2>Edit Your Info</h2>
            <EditForm toggleModal={toggleEdit} />
          </div>
        </Modal>
      )}

      <BurgerMenu onEditProfile={toggleEdit} />

      <header className='Navigation'>
        <div className='Navigation__left'>
          <Link to={ROUTES.NEWSFEED} className="Navigation__logo">
            <img src="/logo.svg" alt="Jupiter" />
          </Link>
          <nav aria-label='Main'>
            <ul className='Navigation__links'>
              {navLinks.map(link => (
                <li key={link.title}>
                  <NavLink to={link.route} end title={link.title} aria-label={link.title}>
                    <span className='icon'>{link.icon}</span>
                    <span className='label'>{link.title}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className='Navigation__right'>
          <SearchUser />

          <div className="Navigation__account" ref={accountRef}>
            <button
              type='button'
              className={`Navigation__account-button ${menuOpen ? 'open' : ''}`}
              aria-haspopup='true'
              aria-expanded={menuOpen}
              aria-controls='account-menu'
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span className={`avatar ${status ?? ''}`}><img src={pfp} alt="" /></span>
              <span className='name'>{name}</span>
              <span className='chevron'><IconChevronDown /></span>
            </button>

            <div id='account-menu' className={`Navigation__menu ${menuOpen ? 'open' : ''}`}>
              <div className='Navigation__menu-header'>
                <span className={`avatar ${status ?? ''}`}><img src={pfp} alt="" /></span>
                <span>
                  <strong>{name}</strong>
                  <span>@{username}</span>
                </span>
              </div>

              <StatusSwitch />

              <div className='Navigation__menu-items'>
                <Link to={ROUTES.HOME}><IconUser /> View profile</Link>
                <button type='button' onClick={() => { setMenuOpen(false); toggleEdit(); }}><IconEdit /> Edit profile</button>
                <button type='button' className='logout' onClick={() => { setMenuOpen(false); logout(); }}><IconLogout /> Log out</button>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
