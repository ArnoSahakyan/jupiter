/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useRef, useState } from 'react';
import IconSearch from '../shared/Icons/IconSearch';
import { useDispatch } from 'react-redux';
import { TsearchedUsers, searchUsers } from '../../store/features/userInfo/userThunks';
import { debounce } from 'lodash-es';
import Friend from '../FriendsBar/Friend/Friend';
import { AppDispatch } from '../../store/setup';
import SecondaryLoader from '../shared/SecondaryLoader/SecondaryLoader';
import './SearchUser.scss';
import { Link } from 'react-router-dom';
import { profilePath } from '../../routes/routes';

export default function SearchUser() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<TsearchedUsers[] | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const limit = 4;

  const searchBar = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (searchBar.current && !searchBar.current.contains(event.target as Node)) {
      setSearchOpen(false);
      setSearchTerm('');
      setResults(undefined)
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const debouncedSearch = useCallback(
    debounce((term: string, newOffset: number = 0) => {
      if (!term.trim()) {
        setResults(undefined);
        return;
      }
      if (term) {
        setLoading(true);
        setError(null);
        dispatch(searchUsers({ query: term, limit, offset: newOffset }))
          .then((action) => {
            if (searchUsers.fulfilled.match(action)) {
              const { payload } = action;

              if (newOffset === 0) {
                setResults(payload.users);
              } else {
                setResults(prevResults => [...prevResults, ...payload.users]);
              }
              setOffset(newOffset + limit);
              setHasMore(payload.currentPage < payload.totalPages);
            }
          })
          .catch((err) => {
            setError(err.message || 'Failed to fetch users');
          })
          .finally(() => {
            setLoading(false);
          })
      } else {
        setResults([]);
      }
    }, 300), [dispatch]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setOffset(0);
    debouncedSearch(term);
  };

  const handleLoadMore = () => {
    debouncedSearch(searchTerm, offset);
  };

  // Escape closes the search; opening it on desktop focuses the field.
  useEffect(() => {
    if (!searchOpen) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setSearchTerm('');
        setResults(undefined);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [searchOpen]);

  return (
    <div className='SearchUser' ref={searchBar}>
      <button
        type='button'
        className={`SearchUser__toggle ${searchOpen ? 'open' : ''}`}
        aria-label='Search users'
        aria-expanded={searchOpen}
        onClick={() => setSearchOpen(!searchOpen)}
      >
        <IconSearch />
      </button>
      <div className={`SearchUser__panel ${searchOpen ? 'active' : 'inactive'}`}>
        <div className='SearchUser__input'>
          <IconSearch />
          <input
            ref={inputRef}
            className='searchFriend'
            type="search"
            name="search"
            id="search"
            placeholder='Search people'
            autoComplete='off'
            value={searchTerm}
            onChange={handleChange}
            onFocus={() => setSearchOpen(true)}
          />
          {loading && <SecondaryLoader />}
        </div>
        {
          results &&
          <div className='SearchUser__results'>
            {error && <p>Error: {error}</p>}
            {
              !loading && (results.length > 0 ? results.map((user) => (
                <Link key={user.id} to={profilePath(user.id)} className='profile-link SearchUser__result' onClick={() => setSearchOpen(false)}>
                  <Friend user={user} onlyImg={false} />
                </Link>
              ))
                : <p className='no-users'>No one found</p>)
            }
            {hasMore && (!loading ? (
              <button type='button' className='load' onClick={handleLoadMore}>Load more</button>
            )
              : <p className='load'>Loading…</p>)
            }
          </div>
        }
      </div>
    </div>
  )
}
